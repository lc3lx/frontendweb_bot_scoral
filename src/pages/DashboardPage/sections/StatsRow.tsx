import { useI18n } from '@i18n';

import type { DashboardMockData } from '../data/dashboard.mock';
import { HomeTilt } from '../HomeTilt';
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
      emphasize: false,
    },
    {
      label: t.dashboard.stats.monthProfit,
      value: data.monthProfit.value,
      secondary: data.monthProfit.secondary,
      tone: styles.profit,
      emphasize: false,
    },
    {
      label: t.dashboard.stats.totalTrades,
      value: data.totalTrades.value,
      secondary: data.totalTrades.secondary,
      tone: styles.primary,
      emphasize: true,
    },
    {
      label: t.dashboard.stats.winRate,
      value: data.winRate.value,
      secondary: data.winRate.secondary,
      tone: styles.warning,
      emphasize: false,
    },
  ] as const;

  return (
    <section className={styles.row} aria-label={t.dashboard.stats.aria}>
      {items.map((item) => (
        <HomeTilt key={item.label} maxTiltDeg={8} liftPx={8}>
          <article className={`${styles.card}${item.emphasize ? ` ${styles.cardEmphasis}` : ''}`}>
            <p className={styles.label}>{item.label}</p>
            <p className={`${styles.value} ${item.tone}`}>{item.value}</p>
            <p className={styles.secondary}>{item.secondary}</p>
          </article>
        </HomeTilt>
      ))}
    </section>
  );
}
