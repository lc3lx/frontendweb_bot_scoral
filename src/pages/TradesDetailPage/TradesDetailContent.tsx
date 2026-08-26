import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

import { signupAssets, tradingAssets } from '@assets';
import { useI18n } from '@i18n';
import { ROUTES } from '@router/routes';
import { CandlestickChart } from '@pages/TradingPage/sections/CandlestickChart';

import { fetchTradeDetail } from './data/tradeDetailService';
import type { TradeDetailData } from './data/tradeDetail.mock';
import styles from './TradesDetailPage.module.css';

type TradesDetailContentProps = {
  tradeId: string;
  isLiveView: boolean;
  figmaNode: string;
};

function resolveTradeSourceLabel(
  tradeSource: TradeDetailData['trade']['tradeSource'],
  labels: {
    bot: string;
    manual: string;
    user: string;
    demo: string;
  },
) {
  switch (tradeSource) {
    case 'bot':
      return labels.bot;
    case 'manual':
      return labels.manual;
    case 'user':
      return labels.user;
    case 'demo':
      return labels.demo;
    default:
      return tradeSource;
  }
}

export function TradesDetailContent({ tradeId, isLiveView, figmaNode }: TradesDetailContentProps) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<TradeDetailData | null | undefined>(undefined);

  useEffect(() => {
    let active = true;
    void (async () => {
      const next = await fetchTradeDetail(tradeId);
      if (active) setDetail(next);
    })();
    return () => {
      active = false;
    };
  }, [tradeId]);

  if (detail === undefined) {
    return (
      <div className={styles.page} data-figma-node={figmaNode}>
        <p>…</p>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className={styles.page} data-figma-node={figmaNode}>
        <p className={styles.notFound}>{t.tradeDetail.notFound}</p>
        <Link className={styles.backLink} to={ROUTES.trades}>
          {t.tradeDetail.back}
        </Link>
      </div>
    );
  }

  const { trade } = detail;
  const showLive = isLiveView;
  const displayOutcome = showLive ? 'running' : trade.outcome;

  const statusChipClass =
    displayOutcome === 'profit'
      ? styles.statusChipProfit
      : displayOutcome === 'loss'
        ? styles.statusChipLoss
        : styles.statusChipRunning;

  const statusChipDotClass =
    displayOutcome === 'profit'
      ? styles.statusChipDotProfit
      : displayOutcome === 'loss'
        ? styles.statusChipDotLoss
        : styles.statusChipDotRunning;

  const statusLabel =
    displayOutcome === 'profit'
      ? t.trades.outcome.profit
      : displayOutcome === 'loss'
        ? t.trades.outcome.loss
        : t.trades.outcome.running;

  const directionLabel =
    trade.direction === 'up' ? t.tradeDetail.direction.up : t.tradeDetail.direction.down;

  const statusValueClass =
    displayOutcome === 'profit'
      ? styles.specValueProfit
      : displayOutcome === 'loss'
        ? styles.specValueLoss
        : styles.specValueRunning;

  const specRows = [
    { id: 'direction', label: t.tradeDetail.fields.direction, value: directionLabel },
    { id: 'amount', label: t.tradeDetail.fields.amount, value: trade.amount },
    { id: 'duration', label: t.tradeDetail.fields.duration, value: detail.duration },
    { id: 'entryTime', label: t.tradeDetail.fields.entryTime, value: detail.entryTime },
    ...(showLive || !detail.exitTime
      ? []
      : [{ id: 'exitTime', label: t.tradeDetail.fields.exitTime, value: detail.exitTime }]),
    { id: 'indicator', label: t.tradeDetail.fields.indicator, value: trade.indicator },
    { id: 'strategy', label: t.tradeDetail.fields.strategy, value: trade.strategy },
    {
      id: 'signalStrength',
      label: t.tradeDetail.fields.signalStrength,
      value: detail.signalStrength,
    },
    {
      id: 'tradeSource',
      label: t.tradeDetail.fields.tradeSource,
      value: resolveTradeSourceLabel(trade.tradeSource, t.trades.tradeSource),
    },
    {
      id: 'status',
      label: t.tradeDetail.fields.status,
      value: statusLabel.toLowerCase(),
      valueClass: statusValueClass,
    },
  ];

  const timelineEvents = showLive
    ? detail.timeline.filter((event) => event.id === 'signalDetected' || event.id === 'tradeOpened')
    : detail.timeline;

  return (
    <div className={styles.page} data-figma-node={figmaNode}>
      <header className={styles.subTopBar}>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => navigate(ROUTES.trades)}
          aria-label={t.tradeDetail.back}
        >
          <img
            className={styles.backIcon}
            src={signupAssets.iconBack}
            alt=""
            width={18}
            height={18}
            data-flip-rtl="true"
            aria-hidden="true"
          />
        </button>
        <h2 className={styles.subTopBarTitle}>{t.tradeDetail.subTitle}</h2>
        <span className={`${styles.statusChip} ${statusChipClass}`}>
          <span className={`${styles.statusChipDot} ${statusChipDotClass}`} aria-hidden="true" />
          {statusLabel.toLowerCase()}
        </span>
      </header>

      <article className={styles.summaryCard} aria-label={t.tradeDetail.summary.aria}>
        <div className={styles.summaryHead}>
          <div
            className={`${styles.directionWrap} ${
              trade.direction === 'up' ? styles.directionWrapUp : styles.directionWrapDown
            }`}
          >
            <img
              className={styles.directionIcon}
              src={trade.direction === 'up' ? tradingAssets.iconUp : tradingAssets.iconDown}
              alt=""
              width={24}
              height={24}
              aria-hidden="true"
            />
          </div>

          <div className={styles.pairBlock}>
            <p className={styles.pairName}>{trade.pair}</p>
            <p className={styles.tradeRef}>{detail.tradeRef}</p>
          </div>

          <div className={styles.plBlock}>
            {showLive ? (
              <div className={styles.runningValueRow}>
                <span className={styles.runningPulse} aria-hidden="true" />
                <p className={styles.runningTimer}>{trade.runningTimer ?? '00:00'}</p>
              </div>
            ) : (
              <>
                <p
                  className={`${styles.plValue} ${
                    trade.outcome === 'profit' ? styles.plValueProfit : styles.plValueLoss
                  }`}
                >
                  {trade.pl}
                </p>
                <p className={styles.plHint}>
                  {t.tradeDetail.summary.onAmount.replace('{amount}', trade.amount)}
                </p>
              </>
            )}
          </div>
        </div>

        <div className={styles.chartWrap}>
          <CandlestickChart candles={detail.chart.candles} height={240} />
        </div>
      </article>

      <div className={styles.bottomGrid}>
        <section className={styles.specsCard} aria-label={t.tradeDetail.specs.aria}>
          {specRows.map((row) => (
            <div key={row.id} className={styles.specRow}>
              <p className={styles.specLabel}>{row.label}</p>
              <p className={`${styles.specValue}${row.valueClass ? ` ${row.valueClass}` : ''}`}>
                {row.value}
              </p>
            </div>
          ))}
        </section>

        <section className={styles.timelineSection} aria-label={t.tradeDetail.timeline.aria}>
          <h3 className={styles.timelineTitle}>{t.tradeDetail.timeline.title}</h3>
          <article className={styles.timelineCard}>
            {timelineEvents.map((event) => (
              <div key={event.id} className={styles.timelineRow}>
                <div className={styles.timelineDotWrap}>
                  <span className={styles.timelineDot} aria-hidden="true" />
                </div>
                <div className={styles.timelineCopy}>
                  <p className={styles.timelineEvent}>{t.tradeDetail.timeline[event.id]}</p>
                  <p className={styles.timelineTime}>{event.time}</p>
                </div>
                <span className={styles.timelineCheck} aria-hidden="true">
                  ✓
                </span>
              </div>
            ))}
          </article>
        </section>
      </div>
    </div>
  );
}
