import { useCallback, useEffect, useState } from 'react';

import { aiBotAssets } from '@assets';
import { useI18n } from '@i18n';

import { useAiBotModals } from './AiBotModalContext';
import {
  SIGNAL_POLL_MS,
  TRADE_AMOUNTS,
  type AiBotMockData,
  type EngineControlId,
} from './data/aiBot.mock';
import { aiBotService } from './data/aiBotService';
import styles from './AiBotPage.module.css';

type AiBotContentProps = {
  figmaNode: string;
};

const DEFAULT_DURATION = '1m';

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
  const { configuration, openModal, syncBotSettingsFromPage } = useAiBotModals();

  const [activeControl, setActiveControl] = useState<EngineControlId>('stop');
  const [tradeAmount, setTradeAmount] = useState('$25');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const next = await aiBotService.fetchData(configuration.tradingPairId);
    setData(next);
    if (next.status.botState === 'running') setActiveControl('start');
    else if (next.status.botState === 'paused') setActiveControl('pause');
    else setActiveControl('stop');
  }, [configuration.tradingPairId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const id = window.setInterval(() => {
      void load();
    }, SIGNAL_POLL_MS);
    return () => window.clearInterval(id);
  }, [load]);

  useEffect(() => {
    syncBotSettingsFromPage(tradeAmount, DEFAULT_DURATION);
  }, [syncBotSettingsFromPage, tradeAmount]);

  async function handleControl(controlId: EngineControlId) {
    if (busy) return;
    setBusy(true);
    setActiveControl(controlId);
    try {
      await aiBotService.applyControl(controlId, {
        pairs: [configuration.tradingPairId],
        amount: aiBotService.parseAmount(tradeAmount),
        durationSeconds: 60,
        profitTarget: aiBotService.parseTargetAbs(data?.targets.profitTarget ?? '+$50', 50),
        lossLimit: aiBotService.parseTargetAbs(data?.targets.lossLimit ?? '-$30', 30),
      });
      await load();
    } finally {
      setBusy(false);
    }
  }

  if (!data) {
    return (
      <div className={styles.page} data-figma-node={figmaNode}>
        <p>…</p>
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
    { label: t.aiBot.status.indicator, value: data.status.indicator },
    { label: t.aiBot.status.strategy, value: data.status.strategy },
    { label: t.aiBot.status.market, value: data.status.market || configuration.tradingPair, ltr: true },
    { label: t.aiBot.status.updated, value: data.status.updated, ltr: true },
  ];

  const amountNumeric = sanitizeAmountInput(tradeAmount);

  return (
    <div className={styles.page} data-figma-node={figmaNode}>
      {/* Top: live signals | total balance */}
      <div className={styles.topRow}>
        <section className={styles.signalCard} aria-label={t.aiBot.status.aria}>
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
              </div>
            </div>
          </div>

          <div className={styles.signalGrid}>
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

        <section className={styles.performanceCard} aria-label={t.aiBot.performance.title}>
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
      </div>

      {/* Mid: trading configuration | trade amount */}
      <div className={styles.midRow}>
        <section aria-label={t.aiBot.configuration.title}>
          <p className={`${styles.sectionLabel} ${styles.sectionLabelWhite}`}>
            {t.aiBot.configuration.title}
          </p>
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
        </section>

        <section className={styles.paramCard} aria-label={t.aiBot.parameters.tradeAmount}>
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
      </div>

      {/* Center: engine controls */}
      <section className={styles.controlsSection} aria-label={t.aiBot.controls.title}>
        <p className={`${styles.sectionLabel} ${styles.sectionLabelWhite} ${styles.controlsTitle}`}>
          {t.aiBot.controls.title}
        </p>
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

      <div className={styles.targetsGrid}>
        <article className={styles.targetCard}>
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
          <p className={styles.targetValueProfit}>{data.targets.profitTarget}</p>
          <p className={styles.targetHint}>{t.aiBot.targets.profitHint}</p>
        </article>

        <article className={styles.targetCard}>
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
          <p className={styles.targetValueLoss}>{data.targets.lossLimit}</p>
          <p className={styles.targetHint}>{t.aiBot.targets.lossHint}</p>
        </article>
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
  );
}
