import { useEffect, useState } from 'react';

import { dashboardAssets } from '@assets';
import { useI18n } from '@i18n';

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

export function DashboardContent({ figmaNode, scrollTarget = false }: DashboardContentProps) {
  const { t } = useI18n();
  const [data, setData] = useState<DashboardMockData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const next = await dashboardService.fetchData();
        if (active) setData(next);
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : t.dashboard.header.title);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [t.dashboard.header.title]);

  if (!data) {
    return (
      <div className={styles.page} data-figma-node={figmaNode}>
        <p>{error ?? '…'}</p>
      </div>
    );
  }

  return (
    <div className={styles.page} data-figma-node={figmaNode}>
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
        <button type="button" className={styles.bannerAction}>
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
        </button>
      </section>

      <div className={styles.grid}>
        <div className={styles.mainColumn}>
          <BalanceCard data={data.balance} />
          <StatsRow data={data.stats} />
          <PerformanceSection data={data.performance} />
          <div data-scroll-target={scrollTarget ? 'recent-trades' : undefined}>
            <RecentTradesSection trades={data.trades} />
          </div>
        </div>

        <aside className={styles.sideColumn} aria-label={t.dashboard.widgetsAria}>
          <SideWidgets botStatus={data.botStatus} alphaPro={data.alphaPro} />
        </aside>
      </div>
    </div>
  );
}
