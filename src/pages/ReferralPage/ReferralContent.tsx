import { useCallback, useEffect, useState } from 'react';

import { dashboardAssets } from '@assets';
import { useI18n } from '@i18n';
import { referralApi } from '@shared/api';
import type {
  ReferralCommissionDto,
  ReferralMemberDto,
  ReferralPayoutDto,
  ReferralRewardDto,
  ReferralSummaryResponse,
} from '@shared/api';

import styles from './ReferralPage.module.css';
import { CommissionsTable } from './sections/CommissionsTable';
import { EarningsSummary } from './sections/EarningsSummary';
import { MembersTable } from './sections/MembersTable';
import { PayoutSection } from './sections/PayoutSection';
import { ReferralLinkCard } from './sections/ReferralLinkCard';
import { TierProgressSection } from './sections/TierProgressSection';

type ReferralPageData = {
  summary: ReferralSummaryResponse;
  members: ReferralMemberDto[];
  commissions: ReferralCommissionDto[];
  rewards: ReferralRewardDto[];
  payouts: ReferralPayoutDto[];
};

function ReferralBackdrop() {
  return (
    <div className={styles.backdrop} aria-hidden="true">
      <img className={styles.bg} src={dashboardAssets.homeBg} alt="" />
      <span className={styles.veil} />
    </div>
  );
}

export function ReferralContent() {
  const { t, locale } = useI18n();
  const [data, setData] = useState<ReferralPageData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [summary, members, commissions, rewards, payouts] = await Promise.all([
        referralApi.summary(),
        referralApi.members({ pageSize: 50 }),
        referralApi.commissions({ pageSize: 20 }),
        referralApi.rewards(),
        referralApi.payouts({ pageSize: 20 }),
      ]);
      setData({
        summary,
        members: members.items,
        commissions: commissions.items,
        rewards: rewards.items,
        payouts: payouts.items,
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.referral.header.title);
    }
  }, [t.referral.header.title]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleRequestPayout(input: { amount: number; method: string; destination: string }) {
    await referralApi.requestPayout(input);
    await load();
  }

  if (!data) {
    return (
      <div className={styles.page}>
        <ReferralBackdrop />
        {error ? <p className={styles.errorNote}>{error}</p> : <p className={styles.loadingNote}>…</p>}
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <ReferralBackdrop />

      <p className={styles.subtitle}>{t.referral.header.subtitle}</p>

      <div className={styles.content}>
        <div className={styles.grid}>
          <ReferralLinkCard
            code={data.summary.referralCode}
            link={data.summary.referralLink}
            telegramShareLink={data.summary.telegramShareLink}
          />

          <section className={styles.requirementsCard}>
            <p className={styles.requirementsTitle}>{t.referral.requirements.title}</p>
            <ul className={styles.requirementsList}>
              <li>{t.referral.requirements.deposit}</li>
              <li>{t.referral.requirements.days}</li>
              <li>{t.referral.requirements.trading}</li>
            </ul>
          </section>
        </div>

        <EarningsSummary summary={data.summary} />

        <TierProgressSection summary={data.summary} />

        <MembersTable members={data.members} locale={locale} />

        <CommissionsTable commissions={data.commissions} rewards={data.rewards} locale={locale} />

        <PayoutSection
          availableBalance={data.summary.availableBalance}
          minPayoutUsd={data.summary.minPayoutUsd}
          payouts={data.payouts}
          locale={locale}
          onSubmit={handleRequestPayout}
        />
      </div>
    </div>
  );
}
