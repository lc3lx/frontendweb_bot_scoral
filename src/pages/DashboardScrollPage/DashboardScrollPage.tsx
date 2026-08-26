import { useEffect } from 'react';

import { AppShell } from '@components/AppShell';
import { useI18n } from '@i18n';
import { DashboardContent } from '@pages/DashboardPage/DashboardContent';

/** Figma frame "6" (736:8) — dashboard scrolled with profile account menu open. */
export function DashboardScrollPage() {
  const { t } = useI18n();

  useEffect(() => {
    document.title = t.dashboardScroll.seo.title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', t.dashboardScroll.seo.description);
  }, [t.dashboardScroll.seo.description, t.dashboardScroll.seo.title]);

  useEffect(() => {
    const target = document.querySelector('[data-scroll-target="recent-trades"]');
    if (!(target instanceof HTMLElement)) return;

    target.scrollIntoView({ block: 'start', behavior: 'auto' });
    window.scrollBy(0, -24);
  }, []);

  return (
    <AppShell title={t.dashboard.header.title} activeNav="home" profileDropdownOpen>
      <DashboardContent figmaNode="736:8" scrollTarget />
    </AppShell>
  );
}
