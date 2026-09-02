import { useCallback, useEffect, useRef, useState } from 'react';

import { aiBotAssets, dashboardAssets } from '@assets';
import { useI18n } from '@i18n';
import { HomeTilt } from '@pages/DashboardPage/HomeTilt';

import { useAiBotModals } from './AiBotModalContext';
import {
  SIGNAL_POLL_MS,
  SIGNAL_ROTATE_MS,
  TRADE_AMOUNTS,
  type AiBotMockData,
  type EngineControlId,
} from './data/aiBot.mock';
import { aiBotService } from './data/aiBotService';
import { isBrandedStrategyId } from './modals/aiBotModals.data';
import { ApiClientError } from '@shared/api';
import { formatPairLabel } from '@shared/market/pairDisplay';
import { liveRefresh } from '@shared/live/liveRefresh';
import styles from './AiBotPage.module.css';

type AiBotContentProps = {
  figmaNode: string;
};

const DEFAULT_DURATION = '1m';

function AiBotBackdrop() {
  return (
    <div className={styles.backdrop} aria-hidden="true">
      <img className={styles.bg} src={dashboardAssets.homeBg} alt="" />
      <span className={styles.veil} />
    </div>
  );
}

function sanitizeAmountInput(raw: string): string {
  const cleaned = raw.replace(/[^\d.]/g, '');
  const [whole, ...rest] = cleaned.split('.');
  if (rest.length === 0) return whole ?? '';
  return `${whole ?? ''}.${rest.join('').slice(0, 2)}`;
}

function formatAmountDisplay(value: string): string {
  const numeric = sanitizeAmountInput(value);
  if (!numeric) return '';
  return `$${numeric}`;
}

export function AiBotContent({ figmaNode }: AiBotContentProps) {
  const { t } = useI18n();
  const [data, setData] = useState<AiBotMockData | null>(null);
  const { configuration, botSettings, openModal, syncBotSettingsFromPage, setBrandedStrategy, setTradingPairIds, syncFromBotRuntime } =
    useAiBotModals();

  const [activeControl, setActiveControl] = useState<EngineControlId>('stop');
  const [tradeAmount, setTradeAmount] = useState('$25');
  const [profitTarget, setProfitTarget] = useState('50');
  const [lossLimit, setLossLimit] = useState('30');
  const [busy, setBusy] = useState(false);
  const [controlError, setControlError] = useState<string | null>(null);
  const [controlFeedback, setControlFeedback] = useState<string | null>(null);
  const [signalPulse, setSignalPulse] = useState(0);
  const targetsSeededRef = useRef(false);
  const pairsSeededRef = useRef(false);
  const stakeModeSeededRef = useRef(false);
  const rotateIndexRef = useRef(0);
  const feedbackTimerRef = useRef<number | null>(null);

  const showFeedback = useCallback((message: string) => {
    setControlFeedback(message);
    setControlError(null);
    if (feedbackTimerRef.current) window.clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = window.setTimeout(() => {
      setControlFeedback(null);
      feedbackTimerRef.current = null;
    }, 4500);
  }, []);

  const load = useCallback(async () => {
    const primaryPair = configuration.tradingPairIds[0] ?? null;
    const [next, bot] = await Promise.all([
      aiBotService.fetchData(primaryPair),
      aiBotService.fetchBotRuntime(),
    ]);
    setData((prev) => {
      if (!prev) return next;
      return {
        ...next,
        status: {
          ...next.status,
          // Keep rotating signal fields until the rotator overwrites them.
          signal: prev.status.signal,
          signalSide: prev.status.signalSide,
          strength: prev.status.strength,
          updated: prev.status.updated,
          freshSeconds: prev.status.freshSeconds,
          market: prev.status.market,
          indicator: configuration.indicator || next.status.indicator,
          strategy: configuration.strategy || next.status.strategy,
        },
      };
    });
    if (!targetsSeededRef.current) {
      setProfitTarget(String(aiBotService.parseTargetAbs(next.targets.profitTarget, 50)));
      setLossLimit(String(aiBotService.parseTargetAbs(next.targets.lossLimit, 30)));
      if (bot?.amount && bot.amount > 0) {
        setTradeAmount(formatAmountDisplay(String(bot.amount)));
      }
      targetsSeededRef.current = true;
    }
    if (!stakeModeSeededRef.current && isBrandedStrategyId(bot?.stakeMode)) {
      setBrandedStrategy(bot.stakeMode);
      stakeModeSeededRef.current = true;
    }
    if (!pairsSeededRef.current && bot) {
      if (bot.assets?.length) {
        setTradingPairIds(bot.assets);
      } else if (bot.asset) {
        setTradingPairIds([bot.asset]);
      }
      syncFromBotRuntime(bot);
      pairsSeededRef.current = true;
      if (isBrandedStrategyId(bot.stakeMode)) {
        stakeModeSeededRef.current = true;
      }
    }
    if (next.status.botState === 'running') setActiveControl('start');
    else if (next.status.botState === 'paused') setActiveControl('pause');
    else setActiveControl('stop');
  }, [
    configuration.indicator,
    configuration.strategy,
    configuration.tradingPairIds,
    setBrandedStrategy,
    setTradingPairIds,
    syncFromBotRuntime,
  ]);

  const rotateSignal = useCallback(async () => {
    const pairs = configuration.tradingPairIds.filter(Boolean);
    if (pairs.length === 0) return;

    const index = rotateIndexRef.current % pairs.length;
    const asset = pairs[index]!;
    rotateIndexRef.current = (index + 1) % pairs.length;

    const snapshot = await aiBotService.fetchSignalSnapshot(asset);
    if (!snapshot) return;

    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        status: {
          ...prev.status,
          signal: snapshot.signal,
          signalSide: snapshot.signalSide,
          strength: snapshot.strength,
          updated: snapshot.updated,
          freshSeconds: snapshot.freshSeconds,
          market: snapshot.marketLabel,
          indicator: configuration.indicator || prev.status.indicator,
          strategy: configuration.strategy || prev.status.strategy,
        },
      };
    });
    setSignalPulse((value) => value + 1);
  }, [configuration.indicator, configuration.strategy, configuration.tradingPairIds]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    let id = window.setInterval(() => void load(), SIGNAL_POLL_MS);

    // A hidden tab polls nothing; showing it again catches up at once.
    const onVisibility = () => {
      window.clearInterval(id);
      if (!document.hidden) {
        void load();
        id = window.setInterval(() => void load(), SIGNAL_POLL_MS);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    // The bot opening or settling a trade changes this page immediately — waiting out
    // the poll interval is what made the customer refresh by hand.
    const unsubscribeLive = liveRefresh.subscribe(() => void load());

    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVisibility);
      unsubscribeLive();
    };
  }, [load]);

  useEffect(() => {
    void rotateSignal();
    const id = window.setInterval(() => {
      void rotateSignal();
    }, SIGNAL_ROTATE_MS);
    return () => window.clearInterval(id);
  }, [rotateSignal]);

  useEffect(() => {
    syncBotSettingsFromPage(tradeAmount, DEFAULT_DURATION, profitTarget, lossLimit);
  }, [syncBotSettingsFromPage, tradeAmount, profitTarget, lossLimit]);

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) window.clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  async function handleControl(controlId: EngineControlId) {
    if (busy) return;
    if (controlId === 'start' && configuration.tradingPairIds.length === 0) {
      setControlError(t.aiBot.controls.selectPair);
      setControlFeedback(null);
      return;
    }
    setBusy(true);
    setControlError(null);
    setActiveControl(controlId);
    const pendingMessage =
      controlId === 'start'
        ? t.aiBot.controls.starting
        : controlId === 'pause'
          ? t.aiBot.controls.pausing
          : controlId === 'stop'
            ? t.aiBot.controls.stopping
            : t.aiBot.controls.applying;
    setControlFeedback(pendingMessage);

    try {
      await aiBotService.applyControl(controlId, {
        pairs: configuration.tradingPairIds.length
          ? configuration.tradingPairIds
          : undefined,
        amount: aiBotService.parseAmount(tradeAmount),
        durationSeconds: 60,
        profitTarget: aiBotService.parseTargetAbs(profitTarget, 50),
        lossLimit: aiBotService.parseTargetAbs(lossLimit, 30),
        stakeMode: configuration.brandedStrategyId,
        strategyId: configuration.strategyGridId,
        settings: botSettings,
      });
      pairsSeededRef.current = false;
      stakeModeSeededRef.current = true;
      await load();
      void rotateSignal();
      const doneMessage =
        controlId === 'start'
          ? t.aiBot.controls.started
          : controlId === 'pause'
            ? t.aiBot.controls.paused
            : controlId === 'stop'
              ? t.aiBot.controls.stopped
              : t.aiBot.controls.applied;
      showFeedback(doneMessage);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setControlError(err.message);
      } else if (err instanceof Error) {
        setControlError(err.message);
      } else {
        setControlError(t.aiBot.controls.failed);
      }
      setControlFeedback(null);
      await load();
    } finally {
      setBusy(false);
    }
  }

  if (!data) {
    return (
      <div className={styles.page} data-figma-node={figmaNode} data-ai-bot-page="">
        <AiBotBackdrop />
        <div className={styles.content}>
          <p>…</p>
        </div>
      </div>
    );
  }

  const controlIcons: Record<EngineControlId, string> = {
    start: aiBotAssets.iconPlay,
    pause: aiBotAssets.iconPause,
    stop: aiBotAssets.iconStop,
    apply: aiBotAssets.iconApply,
  };

  const configRows = [
    {
      id: 'market',
      modal: 'marketType' as const,
      label: t.aiBot.configuration.marketType,
      value: configuration.marketType,
      icon: aiBotAssets.iconMarket,
    },
    {
      id: 'pair',
      modal: 'tradingPair' as const,
      label: t.aiBot.configuration.tradingPair,
      value: configuration.tradingPair,
      icon: aiBotAssets.iconPair,
    },
    {
      id: 'indicator',
      modal: 'technicalIndicator' as const,
      label: t.aiBot.configuration.indicator,
      value: configuration.indicator,
      icon: aiBotAssets.iconIndicator,
    },
    {
      id: 'strategy',
      modal: 'strategyGrid' as const,
      label: t.aiBot.configuration.strategy,
      value: configuration.strategy,
      icon: aiBotAssets.iconStrategy,
    },
  ] as const;

  const performanceStats = [
    { id: 'plus', label: t.aiBot.performance.todayPlus, value: data.performance.todayPlus, tone: 'profit' as const },
    { id: 'minus', label: t.aiBot.performance.todayMinus, value: data.performance.todayMinus, tone: 'loss' as const },
    { id: 'net', label: t.aiBot.performance.net, value: data.performance.net, tone: 'profit' as const },
    { id: 'active', label: t.aiBot.performance.active, value: data.performance.active, tone: 'warning' as const },
    { id: 'winRate', label: t.aiBot.performance.winRate, value: data.performance.winRate, tone: 'default' as const },
    { id: 'trades', label: t.aiBot.performance.trades, value: data.performance.trades, tone: 'default' as const },
  ];

  function statValueClass(tone: 'profit' | 'loss' | 'warning' | 'default') {
    if (tone === 'profit') return styles.statValueProfit;
    if (tone === 'loss') return styles.statValueLoss;
    if (tone === 'warning') return styles.statValueWarning;
    return '';
  }

  const stateLabel =
    data.status.botState === 'running'
      ? t.aiBot.status.running
      : data.status.botState === 'paused'
        ? t.aiBot.status.paused
        : t.aiBot.status.stopped;

  const stopReasonLabel =
    data.stopReason === 'DAILY_PROFIT_TARGET_REACHED'
      ? t.aiBot.status.profitTargetReached
      : data.stopReason === 'DAILY_LOSS_LIMIT_REACHED'
        ? t.aiBot.status.lossLimitReached
        : null;

  const stateChipClass =
    data.status.botState === 'running'
      ? styles.stateChipRunning
      : data.status.botState === 'paused'
        ? styles.stateChipPaused
        : styles.stateChipStopped;

  const signalRows = [
    {
      label: t.aiBot.status.signal,
      value: data.status.signal,
      tone:
        data.status.signalSide === 'up'
          ? styles.signalUp
          : data.status.signalSide === 'down'
            ? styles.signalDown
            : '',
      ltr: true,
    },
    { label: t.aiBot.status.strength, value: data.status.strength, ltr: true },
    { label: t.aiBot.status.indicator, value: configuration.indicator || data.status.indicator },
    { label: t.aiBot.status.strategy, value: configuration.strategy || data.status.strategy },
    {
      label: t.aiBot.status.market,
      value: data.status.market || formatPairLabel(configuration.tradingPairIds[0] ?? '') || configuration.tradingPair,
      ltr: true,
    },
    { label: t.aiBot.status.updated, value: data.status.updated, ltr: true },
  ];

  const amountNumeric = sanitizeAmountInput(tradeAmount);

  return (
    <div className={styles.page} data-figma-node={figmaNode} data-ai-bot-page="">
      <AiBotBackdrop />

      <div className={styles.content}>
        {/* Top: live signals | total balance */}
        <div className={styles.topRow}>
          <div className={styles.cardWrap}>
            <HomeTilt maxTiltDeg={6} liftPx={12}>
              <section
                className={`${styles.homeCard} ${styles.signalCard}`}
                aria-label={t.aiBot.status.aria}
                data-signal-pulse={signalPulse}
              >
                <div className={styles.statusHead}>
                  <div className={styles.botIconWrap}>
                    <img
                      className={styles.botIcon}
                      src={aiBotAssets.iconBotLarge}
                      alt=""
                      width={28}
                      height={28}
                      aria-hidden="true"
                    />
                  </div>
                  <div className={styles.statusCopy}>
                    <p className={styles.statusName}>{data.status.name}</p>
                    <div className={styles.statusMeta}>
                      <span className={`${styles.stateChip} ${stateChipClass}`}>
                        <span className={styles.stateDot} aria-hidden="true" />
                        {stateLabel}
                      </span>
                      <span className={styles.freshChip}>
                        {t.aiBot.status.fresh.replace('{seconds}', String(data.status.freshSeconds))}
                      </span>
                      {configuration.tradingPairIds.length > 1 ? (
                        <span className={styles.rotateChip}>
                          {t.aiBot.status.scanningPairs.replace(
                            '{count}',
                            String(configuration.tradingPairIds.length),
                          )}
                        </span>
                      ) : null}
                    </div>
                    {stopReasonLabel && data.status.botState === 'stopped' ? (
                      <p className={styles.stopReason}>{stopReasonLabel}</p>
                    ) : null}
                  </div>
                </div>

                <div key={signalPulse} className={`${styles.signalGrid} ${styles.signalGridPulse}`}>
                  {signalRows.map((row) => (
                    <div key={row.label} className={styles.signalCell}>
                      <p className={styles.signalLabel}>{row.label}</p>
                      <p
                        className={`${styles.signalValue}${row.tone ? ` ${row.tone}` : ''}${
                          row.ltr ? ` ${styles.ltrValue}` : ''
                        }`}
                      >
                        {row.value}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </HomeTilt>
          </div>

          <div className={styles.cardWrap}>
            <HomeTilt maxTiltDeg={5} liftPx={10}>
              <section
                className={`${styles.homeCard} ${styles.performanceCard}`}
                aria-label={t.aiBot.performance.title}
              >
                <p className={styles.balanceLabel}>{t.aiBot.performance.totalBalance}</p>
                <p className={styles.balanceValue}>{data.performance.totalBalance}</p>
                <div className={styles.statsGrid}>
                  {performanceStats.map((stat) => (
                    <div key={stat.id} className={styles.statCell}>
                      <p className={styles.statLabel}>{stat.label}</p>
                      <p className={`${styles.statValue} ${statValueClass(stat.tone)}`}>{stat.value}</p>
                    </div>
                  ))}
                </div>
              </section>
            </HomeTilt>
          </div>
        </div>

        {/* Mid: trading configuration | trade amount */}
        <div className={styles.midRow}>
          <section aria-label={t.aiBot.configuration.title}>
            <p className={`${styles.sectionLabel} ${styles.sectionLabelWhite}`}>
              {t.aiBot.configuration.title}
            </p>
            <HomeTilt maxTiltDeg={5} liftPx={8}>
              <div className={`${styles.homeCard} ${styles.configPanel}`}>
                <div className={styles.configGrid}>
                  {configRows.map((row) => (
                    <button
                      key={row.id}
                      type="button"
                      className={styles.settingRow}
                      onClick={() => openModal(row.modal)}
                    >
                      <span className={styles.settingIconWrap}>
                        <img
                          className={styles.settingIcon}
                          src={row.icon}
                          alt=""
                          width={18}
                          height={18}
                          aria-hidden="true"
                        />
                      </span>
                      <span className={styles.settingCopy}>
                        <p className={styles.settingLabel}>{row.label}</p>
                        <p className={styles.settingValue}>{row.value}</p>
                      </span>
                      <img
                        className={styles.settingChevron}
                        src={aiBotAssets.iconChevron}
                        alt=""
                        width={16}
                        height={16}
                        data-flip-rtl="true"
                        aria-hidden="true"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </HomeTilt>
          </section>

          <div className={styles.cardWrap}>
            <HomeTilt maxTiltDeg={5} liftPx={8}>
              <section
                className={`${styles.homeCard} ${styles.paramCard}`}
                aria-label={t.aiBot.parameters.tradeAmount}
              >
                <div className={styles.paramHeader}>
                  <p className={styles.paramTitle}>{t.aiBot.parameters.tradeAmount}</p>
                </div>
                <label className={styles.amountInputWrap}>
                  <span className={styles.amountCurrency}>$</span>
                  <input
                    className={styles.amountInput}
                    type="text"
                    inputMode="decimal"
                    value={amountNumeric}
                    onChange={(event) => setTradeAmount(formatAmountDisplay(event.target.value))}
                    aria-label={t.aiBot.parameters.tradeAmount}
                    placeholder="25"
                  />
                </label>
                <div className={styles.chipGrid4}>
                  {TRADE_AMOUNTS.map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      className={`${styles.chipButton}${
                        tradeAmount === amount ? ` ${styles.chipButtonActive}` : ''
                      }`}
                      onClick={() => setTradeAmount(amount)}
                    >
                      {amount}
                    </button>
                  ))}
                </div>
              </section>
            </HomeTilt>
          </div>
        </div>

        {/* Left: daily targets (editable) | Right: engine controls alone */}
        <div className={styles.opsRow}>
          <div className={styles.targetsColumn}>
            <HomeTilt maxTiltDeg={4} liftPx={8}>
              <article className={`${styles.homeCard} ${styles.targetCard}`}>
                <div className={styles.targetHead}>
                  <img
                    className={styles.targetIcon}
                    src={aiBotAssets.iconTargetUp}
                    alt=""
                    width={16}
                    height={16}
                    aria-hidden="true"
                  />
                  <p className={styles.targetTitleProfit}>{t.aiBot.targets.profitTitle}</p>
                </div>
                <label className={`${styles.targetInputWrap} ${styles.targetInputProfit}`}>
                  <span className={styles.targetSign}>+$</span>
                  <input
                    className={`${styles.targetInput} ${styles.targetInputProfit}`}
                    type="text"
                    inputMode="decimal"
                    value={profitTarget}
                    onChange={(event) => setProfitTarget(sanitizeAmountInput(event.target.value))}
                    aria-label={t.aiBot.targets.profitTitle}
                    placeholder="50"
                  />
                </label>
                <p className={styles.targetHint}>{t.aiBot.targets.profitHint}</p>
              </article>
            </HomeTilt>

            <HomeTilt maxTiltDeg={4} liftPx={8}>
              <article className={`${styles.homeCard} ${styles.targetCard}`}>
                <div className={styles.targetHead}>
                  <img
                    className={styles.targetIcon}
                    src={aiBotAssets.iconTargetDown}
                    alt=""
                    width={16}
                    height={16}
                    aria-hidden="true"
                  />
                  <p className={styles.targetTitleLoss}>{t.aiBot.targets.lossTitle}</p>
                </div>
                <label className={`${styles.targetInputWrap} ${styles.targetInputLoss}`}>
                  <span className={styles.targetSign}>−$</span>
                  <input
                    className={`${styles.targetInput} ${styles.targetInputLoss}`}
                    type="text"
                    inputMode="decimal"
                    value={lossLimit}
                    onChange={(event) => setLossLimit(sanitizeAmountInput(event.target.value))}
                    aria-label={t.aiBot.targets.lossTitle}
                    placeholder="30"
                  />
                </label>
                <p className={styles.targetHint}>{t.aiBot.targets.lossHint}</p>
              </article>
            </HomeTilt>
          </div>

          <div className={styles.cardWrap}>
            <HomeTilt maxTiltDeg={5} liftPx={8}>
              <section
                className={`${styles.homeCard} ${styles.controlsSection}`}
                aria-label={t.aiBot.controls.title}
              >
                <p className={`${styles.sectionLabel} ${styles.sectionLabelWhite} ${styles.controlsTitle}`}>
                  {t.aiBot.controls.title}
                </p>
                {controlError ? (
                  <p className={styles.controlError} role="alert">
                    {controlError}
                  </p>
                ) : null}
                {controlFeedback ? (
                  <p className={styles.controlFeedback} role="status">
                    {controlFeedback}
                  </p>
                ) : null}
                <div className={styles.controlsGrid}>
                  {(['start', 'pause', 'stop', 'apply'] as const).map((controlId) => (
                    <button
                      key={controlId}
                      type="button"
                      className={`${styles.controlButton}${
                        activeControl === controlId ? ` ${styles.controlButtonActive}` : ''
                      }`}
                      disabled={busy}
                      onClick={() => void handleControl(controlId)}
                    >
                      <img
                        className={styles.controlIcon}
                        src={controlIcons[controlId]}
                        alt=""
                        width={22}
                        height={22}
                        aria-hidden="true"
                      />
                      {t.aiBot.controls[controlId]}
                    </button>
                  ))}
                </div>
              </section>
            </HomeTilt>
          </div>
        </div>

        <div className={styles.actionsGrid}>
          <button type="button" className={styles.ghostButton} disabled>
            {t.aiBot.actions.showChart}
          </button>
          <button type="button" className={styles.ghostButton} onClick={() => openModal('botSettings')}>
            {t.aiBot.actions.botSettings}
          </button>
        </div>

        <p className={styles.disclaimer}>{t.aiBot.disclaimer}</p>
      </div>
    </div>
  );
}
