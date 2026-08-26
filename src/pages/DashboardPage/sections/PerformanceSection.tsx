import { useMemo, useState } from 'react';

import type { TradeDto } from '@shared/api';
import {
  bucketPerformance,
  formatSignedMoney,
  summarizeByTimeframe,
  type PerformanceBucket,
  type TradeAggTimeframe,
} from '@shared/trades/tradeAggregates';
import { useI18n } from '@i18n';

import type { DashboardMockData } from '../data/dashboard.mock';
import { HomeTilt } from '../HomeTilt';
import styles from './PerformanceSection.module.css';

type PerformanceSectionProps = {
  data: DashboardMockData['performance'];
  trades: TradeDto[];
};

type TimeframeId = TradeAggTimeframe;

const CHART_W = 640;
const CHART_H = 180;
const PAD_X = 8;
const PAD_Y = 12;

function formatAxisMoney(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1000) {
    const compact = abs / 1000;
    const text = compact >= 10 ? compact.toFixed(0) : compact.toFixed(1).replace(/\.0$/, '');
    return `${value < 0 ? '-' : ''}$${text}K`;
  }
  return `${value < 0 ? '-' : ''}$${Math.round(abs)}`;
}

function pickXLabels(buckets: PerformanceBucket[]): string[] {
  if (buckets.length === 0) return [];
  if (buckets.length <= 5) return buckets.map((bucket) => bucket.label);
  const indexes = [0, Math.floor((buckets.length - 1) / 3), Math.floor(((buckets.length - 1) * 2) / 3), buckets.length - 1];
  const unique = [...new Set(indexes)];
  return unique.map((index) => buckets[index]?.label ?? '');
}

function buildChartPaths(buckets: PerformanceBucket[]) {
  if (buckets.length === 0) {
    return {
      linePath: '',
      fillPath: '',
      yLabels: ['$0', '$0', '$0', '$0'],
      xLabels: [] as string[],
      maxAbs: 0,
    };
  }

  let cumulative = 0;
  const points = buckets.map((bucket) => {
    cumulative += bucket.net;
    return cumulative;
  });

  const maxAbs = Math.max(...points.map((value) => Math.abs(value)), 1);
  const top = maxAbs;
  const bottom = -maxAbs;
  const range = top - bottom || 1;
  const stepX = buckets.length === 1 ? 0 : (CHART_W - PAD_X * 2) / (buckets.length - 1);

  const coords = points.map((value, index) => {
    const x = PAD_X + index * stepX;
    const y = PAD_Y + ((top - value) / range) * (CHART_H - PAD_Y * 2);
    return { x, y };
  });

  const linePath = coords
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(' ');

  const first = coords[0]!;
  const last = coords[coords.length - 1]!;
  const baselineY = PAD_Y + ((top - 0) / range) * (CHART_H - PAD_Y * 2);
  const fillPath = `${linePath} L ${last.x.toFixed(2)} ${baselineY.toFixed(2)} L ${first.x.toFixed(2)} ${baselineY.toFixed(2)} Z`;

  return {
    linePath,
    fillPath,
    yLabels: [formatAxisMoney(top), formatAxisMoney(top / 2), '$0', formatAxisMoney(bottom)],
    xLabels: pickXLabels(buckets),
    maxAbs,
  };
}

export function PerformanceSection({ data, trades }: PerformanceSectionProps) {
  const { t } = useI18n();
  const [activeTimeframe, setActiveTimeframe] = useState<TimeframeId>(data.activeTimeframe);

  const timeframes: { id: TimeframeId; label: string }[] = [
    { id: 'today', label: t.dashboard.performance.timeframes.today },
    { id: '7d', label: t.dashboard.performance.timeframes['7d'] },
    { id: '30d', label: t.dashboard.performance.timeframes['30d'] },
    { id: 'all', label: t.dashboard.performance.timeframes.all },
  ];

  const buckets = useMemo(
    () => bucketPerformance(trades, activeTimeframe),
    [trades, activeTimeframe],
  );

  const summary = useMemo(
    () => summarizeByTimeframe(trades, activeTimeframe),
    [trades, activeTimeframe],
  );

  const chart = useMemo(() => buildChartPaths(buckets), [buckets]);
  const value = trades.length > 0 ? formatSignedMoney(summary.net) : data.value;
  const valueTone =
    summary.net > 0 ? styles.valueProfit : summary.net < 0 ? styles.valueLoss : styles.valueNeutral;
  const empty = trades.length === 0 || buckets.length === 0;

  return (
    <HomeTilt maxTiltDeg={5} liftPx={8}>
      <section className={styles.card} aria-labelledby="dashboard-performance-label">
        <div className={styles.header}>
          <div className={styles.titleBlock}>
            <p id="dashboard-performance-label" className={styles.label}>
              {t.dashboard.performance.label}
            </p>
            <p className={`${styles.value} ${valueTone}`}>{value}</p>
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

        <div className={styles.chartWrap}>
          <div className={styles.yLabels} aria-hidden="true">
            {chart.yLabels.map((label, index) => (
              <span key={`${label}-${index}`}>{label}</span>
            ))}
          </div>

          {empty ? (
            <div className={styles.emptyChart}>
              <p className={styles.emptyText}>{t.dashboard.performance.empty}</p>
            </div>
          ) : (
            <svg
              className={styles.chartSvg}
              viewBox={`0 0 ${CHART_W} ${CHART_H}`}
              preserveAspectRatio="none"
              role="img"
              aria-label={t.dashboard.performance.label}
            >
              {[0.25, 0.5, 0.75].map((ratio) => (
                <line
                  key={ratio}
                  className={styles.gridLine}
                  x1={PAD_X}
                  x2={CHART_W - PAD_X}
                  y1={PAD_Y + ratio * (CHART_H - PAD_Y * 2)}
                  y2={PAD_Y + ratio * (CHART_H - PAD_Y * 2)}
                />
              ))}
              <path className={styles.chartFillPath} d={chart.fillPath} />
              <path className={styles.chartLinePath} d={chart.linePath} />
            </svg>
          )}

          <div className={styles.xLabels} aria-hidden="true">
            {(chart.xLabels.length > 0 ? chart.xLabels : ['—']).map((label, index) => (
              <span key={`${label}-${index}`}>{label}</span>
            ))}
          </div>
        </div>
      </section>
    </HomeTilt>
  );
}
