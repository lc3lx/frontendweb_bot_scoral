import { Link } from 'react-router-dom';

import { dashboardAssets } from '@assets';
import { useI18n } from '@i18n';
import { ROUTES } from '@router/routes';

import type { DashboardMockData } from '../data/dashboard.mock';
import { HomeTilt } from '../HomeTilt';
import styles from './SideWidgets.module.css';

type SideWidgetsProps = {
  botStatus: DashboardMockData['botStatus'];
  alphaPro: DashboardMockData['alphaPro'];
};

export function SideWidgets({ botStatus, alphaPro }: SideWidgetsProps) {
  const { t } = useI18n();

  const cells = [
    { label: t.dashboard.botStatus.pair, value: botStatus.pair },
    { label: t.dashboard.botStatus.indicator, value: botStatus.indicator },
    { label: t.dashboard.botStatus.strategy, value: botStatus.strategy },
    {
      label: t.dashboard.botStatus.signal,
      value: botStatus.signal,
      tone: styles.signal,
    },
  ] as const;

  return (
    <>
      <HomeTilt maxTiltDeg={6} liftPx={12}>
        <section className={styles.card} aria-labelledby="dashboard-bot-status-title">
          <div className={styles.header}>
            <div className={styles.iconWrap}>
              <img className={styles.icon} src={dashboardAssets.iconBot} alt="" width={18} height={18} aria-hidden="true" />
            </div>
            <div className={styles.titleBlock}>
              <h2 id="dashboard-bot-status-title" className={styles.title}>
                {t.dashboard.botStatus.title}
              </h2>
              <span className={styles.statusChip}>
                <span className={styles.statusDot} aria-hidden="true" />
                {t.dashboard.botStatus.running}
              </span>
            </div>
          </div>

          <div className={styles.grid}>
            {cells.map((cell) => (
              <div key={cell.label} className={styles.cell}>
                <p className={styles.cellLabel}>{cell.label}</p>
                <p className={`${styles.cellValue}${'tone' in cell ? ` ${cell.tone}` : ''}`}>{cell.value}</p>
              </div>
            ))}
          </div>

          <Link to={ROUTES.aiBot} className={styles.cta}>
            {t.dashboard.botStatus.openBot}
          </Link>
        </section>
      </HomeTilt>

      <HomeTilt maxTiltDeg={6} liftPx={10}>
        <section className={styles.proCard} aria-labelledby="dashboard-alpha-pro-title">
          <div className={styles.proIconWrap}>
            <img className={styles.proIcon} src={dashboardAssets.iconCrown} alt="" width={16} height={16} aria-hidden="true" />
          </div>
          <div className={styles.proCopy}>
            <h2 id="dashboard-alpha-pro-title" className={styles.proTitle}>
              {t.dashboard.alphaPro.title}
            </h2>
            <p className={styles.proExpiry}>{alphaPro.expiry}</p>
          </div>
          <Link to={ROUTES.account} className={styles.manageButton}>
            {t.dashboard.alphaPro.manage}
            <img
              className={styles.manageChevron}
              src={dashboardAssets.iconChevronRightSm}
              alt=""
              width={13}
              height={13}
              data-flip-rtl="true"
              aria-hidden="true"
            />
          </Link>
        </section>
      </HomeTilt>
    </>
  );
}
