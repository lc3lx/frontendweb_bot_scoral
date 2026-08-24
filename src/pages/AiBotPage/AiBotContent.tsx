import { useCallback, useEffect, useState } from 'react';

import { aiBotAssets } from '@assets';
import { useI18n } from '@i18n';

import { useAiBotModals } from './AiBotModalContext';
import {
  TRADE_AMOUNTS,
  TRADE_DURATIONS,
  type AiBotMockData,
  type EngineControlId,
} from './data/aiBot.mock';
import { aiBotService } from './data/aiBotService';
import styles from './AiBotPage.module.css';

type AiBotContentProps = {
  figmaNode: string;
};

export function AiBotContent({ figmaNode }: AiBotContentProps) {
  const { t } = useI18n();
  const [data, setData] = useState<AiBotMockData | null>(null);
  const { configuration, openModal, syncBotSettingsFromPage } = useAiBotModals();

  const load = useCallback(async () => {
    const next = await aiBotService.fetchData();
    setData(next);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const [activeControl, setActiveControl] = useState<EngineControlId>('start');
  const [tradeAmount, setTradeAmount] = useState('$25');
  const [duration, setDuration] = useState('1m');

  useEffect(() => {
    syncBotSettingsFromPage(tradeAmount, duration);
  }, [duration, syncBotSettingsFromPage, tradeAmount]);

  if (!data) {
    return (
      <div className={styles.page} data-figma-node={figmaNode}>
        <p>…</p>
      </div>
    );
  }

  async function handleControl(controlId: EngineControlId) {
    setActiveControl(controlId);
    await aiBotService.applyControl(controlId);
    await load();
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

  return (
    <div className={styles.page} data-figma-node={figmaNode}>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>{t.aiBot.header.title}</h2>
        <p className={styles.pageSubtitle}>{t.aiBot.header.subtitle}</p>
      </div>

      <div className={styles.grid}>
        <div className={styles.leftColumn}>
          <section className={styles.statusCard} aria-label={t.aiBot.status.aria}>
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
                  <span className={styles.runningChip}>
                    <span className={styles.runningDot} aria-hidden="true" />
                    {t.aiBot.status.running}
                  </span>
                  <p className={styles.engineLabel}>{t.aiBot.status.neuralEngine}</p>
                </div>
              </div>
            </div>

            <div className={styles.metricsGrid}>
              <div className={styles.metricCell}>
                <p className={styles.metricLabel}>{t.aiBot.status.signal}</p>
                <p className={`${styles.metricValue} ${styles.metricValueUp}`}>{data.status.signal}</p>
              </div>
              <div className={styles.metricCell}>
                <p className={styles.metricLabel}>{t.aiBot.status.strength}</p>
                <p className={styles.metricValue}>{data.status.strength}</p>
              </div>
              <div className={styles.metricCell}>
                <p className={styles.metricLabel}>{t.aiBot.status.updated}</p>
                <p className={styles.metricValue}>{data.status.updated}</p>
              </div>
            </div>
          </section>

          <section aria-label={t.aiBot.controls.title}>
            <p className={styles.sectionLabel}>{t.aiBot.controls.title}</p>
            <div className={styles.controlsGrid}>
              {(['start', 'pause', 'stop', 'apply'] as const).map((controlId) => (
                <button
                  key={controlId}
                  type="button"
                  className={`${styles.controlButton}${
                    activeControl === controlId ? ` ${styles.controlButtonActive}` : ''
                  }`}
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

          <section aria-label={t.aiBot.performance.title}>
            <p className={styles.sectionLabel}>{t.aiBot.performance.title}</p>
            <div className={styles.performanceCard}>
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
            </div>
          </section>
        </div>

        <div className={styles.rightColumn}>
          <section aria-label={t.aiBot.configuration.title}>
            <p className={styles.sectionLabel}>{t.aiBot.configuration.title}</p>
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

          <div className={styles.paramsRow}>
            <section className={styles.paramCard} aria-label={t.aiBot.parameters.tradeAmount}>
              <div className={styles.paramHeader}>
                <p className={styles.paramTitle}>{t.aiBot.parameters.tradeAmount}</p>
                <p className={styles.paramValue}>{tradeAmount}</p>
              </div>
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

            <section className={styles.paramCard} aria-label={t.aiBot.parameters.duration}>
              <p className={styles.paramTitle}>{t.aiBot.parameters.duration}</p>
              <div className={styles.chipGrid6}>
                {TRADE_DURATIONS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`${styles.chipButton}${
                      duration === item ? ` ${styles.chipButtonActive}` : ''
                    }`}
                    onClick={() => setDuration(item)}
                  >
                    {item === 'Custom' ? t.aiBot.parameters.custom : item}
                  </button>
                ))}
              </div>
            </section>
          </div>

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
      </div>
    </div>
  );
}

