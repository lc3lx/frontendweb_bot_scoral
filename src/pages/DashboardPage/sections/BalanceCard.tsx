import { dashboardAssets } from '@assets';
import { useSessionProfile } from '@hooks/useSessionProfile';
import { useI18n } from '@i18n';

import type { DashboardMockData } from '../data/dashboard.mock';
import { HomeTilt } from '../HomeTilt';
import styles from './BalanceCard.module.css';

type BalanceCardProps = {
  data: DashboardMockData['balance'];
};

export function BalanceCard({ data }: BalanceCardProps) {
  const { t } = useI18n();
  const profile = useSessionProfile();
  const accountLabel =
    profile.accountType === 'Real' ? t.dashboard.user.live : t.dashboard.user.demo;

  // #region agent log
  fetch('http://127.0.0.1:7892/ingest/aea6d51e-f3e9-4c7e-b6b4-db55c4306e97',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'281dcf'},body:JSON.stringify({sessionId:'281dcf',runId:'post-fix',hypothesisId:'A,B',location:'BalanceCard.tsx:render',message:'balance card render sources',data:{profileAccountType:profile.accountType,profileBalance:profile.balance,cardBalanceValue:data.value,todayProfit:data.todayProfit,todayLoss:data.todayLoss,netToday:data.netToday},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

  return (
    <HomeTilt>
      <section className={styles.card} aria-labelledby="dashboard-balance-label">
        <div className={styles.topRow}>
          <p id="dashboard-balance-label" className={styles.label}>
            {t.dashboard.balance.label}
          </p>
          <span className={styles.liveBadge}>
            <span className={styles.liveDot} aria-hidden="true" />
            {accountLabel}
          </span>
        </div>

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
          <div className={`${styles.miniStat} ${styles.miniStatNet}`}>
            <p className={styles.miniStatLabel}>{t.dashboard.balance.netToday}</p>
            <p className={`${styles.miniStatValue} ${styles.neutral}`}>{data.netToday}</p>
          </div>
        </div>
      </section>
    </HomeTilt>
  );
}
