import { useEffect, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';

import { dashboardAssets } from '@assets';
import { useI18n } from '@i18n';
import { ROUTES } from '@router/routes';

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
      <span className={styles.aurora} />
      <span className={styles.orb} />
      <span className={styles.orbAlt} />
      <span className={styles.veil} />
    </div>
  );
}

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
      <header className={styles.hero}>
        <div>
          <p className={styles.kicker}>{t.dashboard.hero.kicker}</p>
          <h1 className={styles.heroTitle}>{t.dashboard.header.title}</h1>
          <p className={styles.heroSubtitle}>{t.dashboard.hero.subtitle}</p>
        </div>
        <span className={styles.liveBadge}>
          <span className={styles.liveDot} aria-hidden="true" />
          {t.dashboard.hero.live}
        </span>
      </header>

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
            <PerformanceSection data={data.performance} />
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
