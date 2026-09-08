import { useEffect } from 'react';

import { AppShell } from '@components/AppShell';
import { useI18n } from '@i18n';

import { ReferralContent } from './ReferralContent';

/** Referral program page — share link, commission tiers, referred members, earnings, payouts. */
export function ReferralPage() {
  const { t } = useI18n();

  useEffect(() => {
    document.title = t.referral.seo.title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', t.referral.seo.description);
  }, [t.referral.seo.description, t.referral.seo.title]);

  return (
    <AppShell title={t.referral.header.title} activeNav="referral">
      <ReferralContent />
    </AppShell>
  );
}
