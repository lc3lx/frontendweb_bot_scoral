import { useCallback, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';

import { dashboardAssets } from '@assets';
import { useI18n } from '@i18n';
import { ROUTES } from '@router/routes';
import { useLiveData } from '@shared/live/useLiveData';

import { dashboardService } from './data/dashboardService';
import type { DashboardMockData } from './data/dashboard.mock';
import styles from './DashboardPage.module.css';
import { BalanceCard } from './sections/BalanceCard';
import { PerformanceSection } from './sections/PerformanceSection';
import { RecentTradesSection } from './sections/RecentTradesSection';
import { SideWidgets } from './sections/SideWidgets';
import { StatsRow } from './sections/StatsRow';

type DashboardContentProps = {
  figmaNode: string;
  scrollTarget?: boolean;
};

function HomeBackdrop() {
  return (
    <div className={styles.backdrop} aria-hidden="true">
      <img className={styles.bg} src={dashboardAssets.homeBg} alt="" />
      <span className={styles.veil} />
    </div>
  );
}

export function DashboardContent({ figmaNode, scrollTarget = false }: DashboardContentProps) {
  const { t } = useI18n();
  const [data, setData] = useState<DashboardMockData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const next = await dashboardService.fetchData();
      setData(next);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.dashboard.header.title);
    }
  }, [t.dashboard.header.title]);

  useLiveData(load, { minIntervalMs: 8_000 });

  if (!data) {
    return (
      <div className={styles.page} data-figma-node={figmaNode}>
        <HomeBackdrop />
        {error ? <p>{error}</p> : (
          <div className={styles.skeleton} aria-busy="true" aria-live="polite">
            <div className={styles.skelBlock} />
            <div className={`${styles.skelBlock} ${styles.skelBlockWide}`} />
            <div className={styles.skelBlock} />
            <div className={`${styles.skelBlock} ${styles.skelBlockWide}`} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={styles.page} data-figma-node={figmaNode}>
      <HomeBackdrop />

      <section className={styles.banner} aria-labelledby="dashboard-onboarding-title">
        <div className={styles.bannerIconWrap}>
          <img
            className={styles.bannerIcon}
            src={dashboardAssets.iconGuide}
            alt=""
            width={16}
            height={16}
            aria-hidden="true"
          />
        </div>
        <div className={styles.bannerCopy}>
          <h2 id="dashboard-onboarding-title" className={styles.bannerTitle}>
            {t.dashboard.onboarding.title}
          </h2>
          <p className={styles.bannerDescription}>{t.dashboard.onboarding.description}</p>
        </div>
        <Link to={ROUTES.aiBot} className={styles.bannerAction}>
          {t.dashboard.onboarding.cta}
          <img
            className={styles.bannerChevron}
            src={dashboardAssets.iconChevronRight}
            alt=""
            width={13}
            height={13}
            data-flip-rtl="true"
            aria-hidden="true"
          />
        </Link>
      </section>

      <div className={styles.grid}>
        <div className={styles.mainColumn}>
          <div className={styles.rise} style={{ '--home-delay': 1 } as CSSProperties}>
            <BalanceCard data={data.balance} />
          </div>
          <div className={styles.rise} style={{ '--home-delay': 2 } as CSSProperties}>
            <StatsRow data={data.stats} />
          </div>
          <div className={styles.rise} style={{ '--home-delay': 3 } as CSSProperties}>
            <PerformanceSection data={data.performance} trades={data.performanceTrades} />
          </div>
          <div
            className={styles.rise}
            style={{ '--home-delay': 4 } as CSSProperties}
            data-scroll-target={scrollTarget ? 'recent-trades' : undefined}
          >
            <RecentTradesSection trades={data.trades} />
          </div>
        </div>

        <aside className={`${styles.sideColumn} ${styles.rise}`} style={{ '--home-delay': 2 } as CSSProperties} aria-label={t.dashboard.widgetsAria}>
          <SideWidgets botStatus={data.botStatus} alphaPro={data.alphaPro} />
        </aside>
      </div>
    </div>
  );
}
