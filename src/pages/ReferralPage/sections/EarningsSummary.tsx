import { useI18n } from '@i18n';
import type { ReferralSummaryResponse } from '@shared/api';

import styles from './EarningsSummary.module.css';

type EarningsSummaryProps = {
  summary: ReferralSummaryResponse;
};

function formatUsd(amount: number): string {
  return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function EarningsSummary({ summary }: EarningsSummaryProps) {
  const { t } = useI18n();

  const items = [
    { label: t.referral.stats.qualified, value: String(summary.qualifiedReferrals), tone: styles.primary },
    { label: t.referral.stats.pending, value: String(summary.pendingReferrals), tone: styles.warning },
    {
      label: t.referral.stats.currentTier,
      value: summary.currentTier > 0 ? t.referral.tiers.level.replace('{level}', String(summary.currentTier)) : '—',
      tone: styles.primary,
    },
    {
      label: t.referral.stats.currentRate,
      value: `${summary.currentRatePercent.toLocaleString(undefined, { maximumFractionDigits: 2 })}%`,
      tone: styles.profit,
    },
    { label: t.referral.stats.totalEarned, value: formatUsd(summary.totalCommissionEarned + summary.totalRewardsEarned), tone: styles.profit },
    { label: t.referral.stats.available, value: formatUsd(summary.availableBalance), tone: styles.profit },
  ];

  return (
    <section className={styles.row}>
      {items.map((item) => (
        <article key={item.label} className={styles.card}>
          <p className={styles.label}>{item.label}</p>
          <p className={`${styles.value} ${item.tone}`}>{item.value}</p>
        </article>
      ))}
    </section>
  );
}
