import { useI18n } from '@i18n';

import type { DashboardMockData } from '../data/dashboard.mock';
import styles from './StatsRow.module.css';

type StatsRowProps = {
  data: DashboardMockData['stats'];
};

export function StatsRow({ data }: StatsRowProps) {
  const { t } = useI18n();

  const items = [
    {
      label: t.dashboard.stats.weekProfit,
      value: data.weekProfit.value,
      secondary: data.weekProfit.secondary,
      tone: styles.profit,
    },
    {
      label: t.dashboard.stats.monthProfit,
      value: data.monthProfit.value,
      secondary: data.monthProfit.secondary,
      tone: styles.profit,
    },
    {
      label: t.dashboard.stats.totalTrades,
      value: data.totalTrades.value,
      secondary: data.totalTrades.secondary,
      tone: styles.primary,
    },
    {
      label: t.dashboard.stats.winRate,
      value: data.winRate.value,
      secondary: data.winRate.secondary,
      tone: styles.warning,
    },
  ] as const;

  return (
    <section className={styles.row} aria-label={t.dashboard.stats.aria}>
      {items.map((item) => (
        <article key={item.label} className={styles.card}>
          <p className={styles.label}>{item.label}</p>
          <p className={`${styles.value} ${item.tone}`}>{item.value}</p>
          <p className={styles.secondary}>{item.secondary}</p>
        </article>
      ))}
    </section>
  );
}
