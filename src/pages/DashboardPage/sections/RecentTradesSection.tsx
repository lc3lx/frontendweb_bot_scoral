import { dashboardAssets } from '@assets';
import { useI18n } from '@i18n';

import type { DashboardTradeRow } from '../data/dashboard.mock';
import styles from './RecentTradesSection.module.css';

type RecentTradesSectionProps = {
  trades: DashboardTradeRow[];
};

function plClass(tone: DashboardTradeRow['plTone']) {
  if (tone === 'profit') return styles.plProfit;
  if (tone === 'loss') return styles.plLoss;
  return styles.plRunning;
}

export function RecentTradesSection({ trades }: RecentTradesSectionProps) {
  const { t } = useI18n();

  return (
    <section className={styles.section} aria-labelledby="dashboard-recent-trades-title">
      <div className={styles.header}>
        <h2 id="dashboard-recent-trades-title" className={styles.title}>
          {t.dashboard.recentTrades.title}
        </h2>
        <button type="button" className={styles.seeAll}>
          {t.dashboard.recentTrades.seeAll}
        </button>
      </div>

      <div className={styles.card}>
        <div className={styles.tableHead} role="row">
          <span role="columnheader">{t.dashboard.recentTrades.columns.pair}</span>
          <span role="columnheader">{t.dashboard.recentTrades.columns.strategy}</span>
          <span role="columnheader">{t.dashboard.recentTrades.columns.time}</span>
          <span role="columnheader">{t.dashboard.recentTrades.columns.amount}</span>
          <span className={styles.headPl} role="columnheader">
            {t.dashboard.recentTrades.columns.pl}
          </span>
          <span className={styles.headAction} role="columnheader">
            {t.dashboard.recentTrades.columns.action}
          </span>
        </div>

        {trades.map((trade) => (
          <div key={trade.id} className={styles.tableRow} role="row">
            <div className={styles.pairCell} role="cell">
              <span
                className={`${styles.pairIconWrap} ${
                  trade.pairIcon === 'forex' ? styles.pairIconWrapForex : styles.pairIconWrapCrypto
                }`}
              >
                <img
                  className={styles.pairIcon}
                  src={trade.pairIcon === 'forex' ? dashboardAssets.iconPairForex : dashboardAssets.iconPairCrypto}
                  alt=""
                  width={16}
                  height={16}
                  aria-hidden="true"
                />
              </span>
              <span className={styles.pairName}>{trade.pair}</span>
            </div>
            <span className={styles.strategy} role="cell">
              {trade.strategy}
            </span>
            <span className={styles.meta} role="cell">
              {trade.time}
            </span>
            <span className={styles.meta} role="cell">
              {trade.amount}
            </span>
            <span className={`${styles.cellPl} ${plClass(trade.plTone)}`} role="cell">
              {trade.pl}
            </span>
            <span className={styles.cellAction} role="cell">
              <img
                className={styles.menuIcon}
                src={dashboardAssets.iconRowMenu}
                alt=""
                width={16}
                height={16}
                aria-hidden="true"
              />
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
