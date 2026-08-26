import balanceChartUrl from '@landing/assets/images/statistics/balance-chart.png';
import { registerAsset } from '@landing/assets';

registerAsset({
  id: 'img-statistics-balance-chart',
  kind: 'image',
  src: balanceChartUrl,
  alt: 'Current balance performance chart preview',
  format: 'png',
  figmaNodeId: '491:1487',
  width: 791,
  height: 315,
});

export const STATISTICS_COPY = {
  eyebrow: 'Dashboard preview',
  title: 'Readable performance overview without clutter',
} as const;

export type StatisticsMetricTone = 'positive' | 'neutral' | 'negative';

export type StatisticsMetric = {
  id: string;
  label: string;
  value: string;
  tone: StatisticsMetricTone;
  figmaNodeId: string;
};

/** Metric strip — Figma 55:274 (four cards). */
export const STATISTICS_METRICS: readonly StatisticsMetric[] = [
  {
    id: 'current-balance',
    label: 'Current Balance',
    value: '$12,480',
    tone: 'positive',
    figmaNodeId: '55:275',
  },
  {
    id: 'today-profit',
    label: 'Today Profit',
    value: '+$186',
    tone: 'neutral',
    figmaNodeId: '55:280',
  },
  {
    id: 'today-loss',
    label: 'Today Loss',
    value: '-$42',
    tone: 'negative',
    figmaNodeId: '55:285',
  },
  {
    id: 'win-rate',
    label: 'Win Rate',
    value: '68%',
    tone: 'positive',
    figmaNodeId: '55:290',
  },
] as const;

export type StatisticsTrade = {
  id: string;
  pair: string;
  strategy: string;
  result: string;
};

export const STATISTICS_TRADES = {
  title: 'Recent Trades — Demo',
  status: 'Bot Active · Subscription Monthly',
  figmaNodeId: '55:299',
  items: [
    {
      id: 'eur-usd',
      pair: 'EUR/USD',
      strategy: 'Trend Filter',
      result: '+$22',
    },
    {
      id: 'gbp-jpy',
      pair: 'GBP/JPY',
      strategy: 'RSI Reversal',
      result: '-$10',
    },
    {
      id: 'aud-cad',
      pair: 'AUD/CAD',
      strategy: 'MACD Flow',
      result: '+$18',
    },
  ] as const satisfies readonly StatisticsTrade[],
} as const;

export const STATISTICS_CHART = {
  src: balanceChartUrl,
  width: 791,
  height: 315,
  figmaNodeId: '491:1487',
  alt: 'Current balance chart with 7-day range selected',
} as const;
