import { dashboardAssets } from '@assets';
import { useI18n } from '@i18n';

import type { DashboardMockData } from '../data/dashboard.mock';
import styles from './BalanceCard.module.css';

type BalanceCardProps = {
  data: DashboardMockData['balance'];
};

export function BalanceCard({ data }: BalanceCardProps) {
  const { t } = useI18n();

  return (
    <section className={styles.card} aria-labelledby="dashboard-balance-label">
      <p id="dashboard-balance-label" className={styles.label}>
        {t.dashboard.balance.label}
      </p>

      <div className={styles.valueRow}>
        <p className={styles.value}>{data.value}</p>
        <span className={styles.growth}>
          <img
            className={styles.growthIcon}
            src={dashboardAssets.iconGrowth}
            alt=""
            width={15}
            height={15}
            aria-hidden="true"
          />
          {data.growth}
        </span>
      </div>

      <div className={styles.miniStats}>
        <div className={styles.miniStat}>
          <p className={styles.miniStatLabel}>{t.dashboard.balance.todayProfit}</p>
          <p className={`${styles.miniStatValue} ${styles.profit}`}>{data.todayProfit}</p>
        </div>
        <div className={styles.miniStat}>
          <p className={styles.miniStatLabel}>{t.dashboard.balance.todayLoss}</p>
          <p className={`${styles.miniStatValue} ${styles.loss}`}>{data.todayLoss}</p>
        </div>
        <div className={styles.miniStat}>
          <p className={styles.miniStatLabel}>{t.dashboard.balance.netToday}</p>
          <p className={`${styles.miniStatValue} ${styles.neutral}`}>{data.netToday}</p>
        </div>
      </div>
    </section>
  );
}
