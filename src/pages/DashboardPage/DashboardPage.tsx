import { useEffect } from 'react';

import { AppShell } from '@components/AppShell';
import { useI18n } from '@i18n';

import { DashboardContent } from './DashboardContent';

/** Figma frame "5" (736:6) — dashboard home with sidebar shell and trading overview. */
export function DashboardPage() {
  const { t } = useI18n();

  useEffect(() => {
    document.title = t.dashboard.seo.title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', t.dashboard.seo.description);
  }, [t.dashboard.seo.description, t.dashboard.seo.title]);

  return (
    <AppShell title={t.dashboard.header.title} activeNav="home">
      <DashboardContent figmaNode="736:6" />
    </AppShell>
  );
}
