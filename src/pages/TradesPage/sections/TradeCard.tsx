import { Link } from 'react-router-dom';

import { dashboardAssets, tradingAssets } from '@assets';
import { useI18n } from '@i18n';

import type { TradeCardData } from '../data/trades.mock';
import styles from '../TradesPage.module.css';

type TradeCardProps = {
  trade: TradeCardData;
};

function sourceChipClass(source: TradeCardData['source']) {
  return source === 'binolla' ? styles.sourceChipBinolla : styles.sourceChipGlobal;
}

function sourceDotClass(source: TradeCardData['source']) {
  return source === 'binolla' ? styles.sourceDotBinolla : styles.sourceDotGlobal;
}

function resolveTradeSourceLabel(
  tradeSource: TradeCardData['tradeSource'],
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

export function TradeCard({ trade }: TradeCardProps) {
  const { t } = useI18n();
  const isRunning = trade.outcome === 'running';

  const outcomeBoxClass =
    trade.outcome === 'profit'
      ? styles.outcomeBoxProfit
      : trade.outcome === 'loss'
        ? styles.outcomeBoxLoss
        : styles.outcomeBoxRunning;

  const outcomeChipClass =
    trade.outcome === 'profit'
      ? styles.outcomeChipProfit
      : trade.outcome === 'loss'
        ? styles.outcomeChipLoss
        : styles.outcomeChipRunning;

  const outcomeChipDotClass =
    trade.outcome === 'profit'
      ? styles.outcomeChipDotProfit
      : trade.outcome === 'loss'
        ? styles.outcomeChipDotLoss
        : styles.outcomeChipDotRunning;

  const outcomeBadgeLabel =
    trade.outcome === 'profit'
      ? t.trades.outcome.profit
      : trade.outcome === 'loss'
        ? t.trades.outcome.loss
        : t.trades.outcome.running;

  const sourceLabel =
    trade.source === 'binolla' ? t.trades.source.binolla : t.trades.source.global;

  return (
    <article className={styles.card}>
      <div className={styles.cardHead}>
        <div
          className={`${styles.directionWrap} ${
            trade.direction === 'up' ? styles.directionWrapUp : styles.directionWrapDown
          }`}
        >
          <img
            className={styles.directionIcon}
            src={trade.direction === 'up' ? tradingAssets.iconUp : tradingAssets.iconDown}
            alt=""
            width={18}
            height={18}
            aria-hidden="true"
          />
        </div>

        <div className={styles.pairBlock}>
          <p className={styles.pairName}>{trade.pair}</p>
          <p className={styles.pairTime}>{trade.time}</p>
        </div>

        <span className={`${styles.sourceChip} ${sourceChipClass(trade.source)}`}>
          <span className={`${styles.sourceDot} ${sourceDotClass(trade.source)}`} aria-hidden="true" />
          {sourceLabel}
        </span>
      </div>

      <div className={`${styles.outcomeBox} ${outcomeBoxClass}`}>
        <div>
          <p className={styles.outcomeLabel}>
            {isRunning ? t.trades.fields.status : t.trades.fields.profitLoss}
          </p>
          {isRunning ? (
            <div className={styles.runningValueRow}>
              <span className={styles.runningPulse} aria-hidden="true" />
              <p className={styles.runningTimer}>{trade.runningTimer}</p>
            </div>
          ) : (
            <p
              className={`${styles.outcomeValue} ${
                trade.outcome === 'profit' ? styles.outcomeValueProfit : styles.outcomeValueLoss
              }`}
            >
              {trade.pl}
            </p>
          )}
        </div>

        <span className={`${styles.outcomeChip} ${outcomeChipClass}`}>
          <span className={`${styles.sourceDot} ${outcomeChipDotClass}`} aria-hidden="true" />
          {outcomeBadgeLabel}
        </span>
      </div>

      <div className={styles.metaGrid}>
        <div className={styles.metaCell}>
          <p className={styles.metaLabel}>{t.trades.fields.strategy}</p>
          <p className={styles.metaValue}>{trade.strategy}</p>
        </div>
        <div className={styles.metaCell}>
          <p className={styles.metaLabel}>{t.trades.fields.indicator}</p>
          <p className={styles.metaValue}>{trade.indicator}</p>
        </div>
        <div className={styles.metaCell}>
          <p className={styles.metaLabel}>{t.trades.fields.amount}</p>
          <p className={styles.metaValue}>{trade.amount}</p>
        </div>
        <div className={styles.metaCell}>
          <p className={styles.metaLabel}>
            {isRunning ? t.trades.fields.duration : t.trades.fields.source}
          </p>
          <p className={styles.metaValue}>
            {isRunning
              ? trade.duration ?? '—'
              : resolveTradeSourceLabel(trade.tradeSource, t.trades.tradeSource)}
          </p>
        </div>
      </div>

      <Link
        className={styles.cardAction}
        to={isRunning ? `/trades/${trade.id}?live=1` : `/trades/${trade.id}`}
      >
        {isRunning ? t.trades.actions.viewChart : t.trades.actions.details}
        <img
          className={styles.cardActionIcon}
          src={dashboardAssets.iconChevronRightSm}
          alt=""
          width={14}
          height={14}
          data-flip-rtl="true"
          aria-hidden="true"
        />
      </Link>
    </article>
  );
}
