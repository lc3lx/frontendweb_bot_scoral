import { useI18n } from '@i18n';
import type { ReferralSummaryResponse } from '@shared/api';
import { cn } from '@utils';

import styles from './TierProgressSection.module.css';

type TierProgressSectionProps = {
  summary: ReferralSummaryResponse;
};

export function TierProgressSection({ summary }: TierProgressSectionProps) {
  const { t } = useI18n();

  const iphoneProgress = Math.min(
    100,
    Math.round((summary.iPhoneQualifiedReferrals / Math.max(1, summary.iPhoneTarget)) * 100),
  );

  return (
    <section className={styles.wrap}>
      <div className={styles.tiersCard}>
        <p className={styles.title}>{t.referral.tiers.title}</p>

        <ol className={styles.ladder}>
          {summary.tiers.map((tier) => (
            <li
              key={tier.level}
              className={cn(styles.tierRow, tier.isCurrent && styles.tierRowCurrent, tier.reached && styles.tierRowReached)}
            >
              <span className={styles.tierLevel}>{t.referral.tiers.level.replace('{level}', String(tier.level))}</span>
              <span className={styles.tierPeople}>{t.referral.tiers.peopleRequired.replace('{count}', String(tier.minReferrals))}</span>
              <span className={styles.tierRate}>{tier.ratePercent.toLocaleString(undefined, { maximumFractionDigits: 2 })}%</span>
              <span className={styles.tierGift}>{t.referral.tiers.gift.replace('{amount}', tier.giftUsd.toLocaleString())}</span>
              <span className={cn(styles.tierBadge, tier.isCurrent && styles.tierBadgeCurrent)}>
                {tier.isCurrent ? t.referral.tiers.current : tier.reached ? t.referral.tiers.reached : t.referral.tiers.locked}
              </span>
            </li>
          ))}
        </ol>

        {summary.nextTier ? (
          <p className={styles.nextTierNote}>
            {t.referral.stats.nextTierProgress.replace('{count}', String(summary.referralsToNextTier))}
          </p>
        ) : (
          <p className={styles.nextTierNote}>{t.referral.stats.maxTierReached}</p>
        )}
      </div>

      <div className={styles.iphoneCard}>
        <p className={styles.title}>{t.referral.iphone.title}</p>
        <p className={styles.iphoneDescription}>{t.referral.iphone.description}</p>

        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: `${iphoneProgress}%` }} />
        </div>
        <p className={styles.iphoneProgressLabel}>
          {t.referral.iphone.progress
            .replace('{count}', String(summary.iPhoneQualifiedReferrals))
            .replace('{target}', String(summary.iPhoneTarget))}
        </p>

        {summary.iPhoneEligible ? <p className={styles.iphoneEligible}>{t.referral.iphone.eligible}</p> : null}
      </div>
    </section>
  );
}
