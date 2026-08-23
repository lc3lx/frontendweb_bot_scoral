import { useState } from 'react';

import { dashboardAssets } from '@assets';
import { useI18n } from '@i18n';

import type { DashboardMockData } from '../data/dashboard.mock';
import styles from './PerformanceSection.module.css';

type PerformanceSectionProps = {
  data: DashboardMockData['performance'];
};

type TimeframeId = 'today' | '7d' | '30d' | 'all';

export function PerformanceSection({ data }: PerformanceSectionProps) {
  const { t } = useI18n();
  const [activeTimeframe, setActiveTimeframe] = useState<TimeframeId>(data.activeTimeframe);

  const timeframes: { id: TimeframeId; label: string }[] = [
    { id: 'today', label: t.dashboard.performance.timeframes.today },
    { id: '7d', label: t.dashboard.performance.timeframes['7d'] },
    { id: '30d', label: t.dashboard.performance.timeframes['30d'] },
    { id: 'all', label: t.dashboard.performance.timeframes.all },
  ];

  return (
    <section className={styles.card} aria-labelledby="dashboard-performance-label">
      <div className={styles.header}>
        <div className={styles.titleBlock}>
          <p id="dashboard-performance-label" className={styles.label}>
            {t.dashboard.performance.label}
          </p>
          <p className={styles.value}>{data.value}</p>
        </div>

        <div className={styles.filters} role="tablist" aria-label={t.dashboard.performance.filtersAria}>
          {timeframes.map((timeframe) => (
            <button
              key={timeframe.id}
              type="button"
              role="tab"
              aria-selected={activeTimeframe === timeframe.id}
              className={`${styles.filterButton}${activeTimeframe === timeframe.id ? ` ${styles.filterActive}` : ''}`}
              onClick={() => setActiveTimeframe(timeframe.id)}
            >
              {timeframe.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.chartWrap} aria-hidden="true">
        <div className={styles.yLabels}>
          {t.dashboard.performance.yAxis.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
        <img className={styles.chartGrid} src={dashboardAssets.performanceChartGrid} alt="" />
        <img className={styles.chartFill} src={dashboardAssets.performanceChartFill} alt="" />
        <img className={styles.chartLine} src={dashboardAssets.performanceChartLine} alt="" />
        <div className={styles.xLabels}>
          {t.dashboard.performance.xAxis.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
