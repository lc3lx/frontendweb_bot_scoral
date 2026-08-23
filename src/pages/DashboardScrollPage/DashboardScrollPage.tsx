import { useEffect, useRef } from 'react';

import { AppShell } from '@components/AppShell';
import { useI18n } from '@i18n';
import { DashboardContent } from '@pages/DashboardPage/DashboardContent';

/** Figma frame "6" (736:8) — dashboard scrolled with profile account menu open. */
export function DashboardScrollPage() {
  const { t } = useI18n();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = t.dashboardScroll.seo.title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', t.dashboardScroll.seo.description);
  }, [t.dashboardScroll.seo.description, t.dashboardScroll.seo.title]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    const target = container?.querySelector('[data-scroll-target="recent-trades"]');
    if (!container || !target) return;

    const containerRect = container.getBoundingClientRect();
    const targetRect = (target as HTMLElement).getBoundingClientRect();
    const nextScrollTop = container.scrollTop + (targetRect.top - containerRect.top) - 24;
    container.scrollTop = Math.max(0, nextScrollTop);
  }, []);

  return (
    <AppShell
      title={t.dashboard.header.title}
      activeNav="home"
      profileDropdownOpen
      scrollContainerRef={scrollContainerRef}
    >
      <DashboardContent figmaNode="736:8" scrollTarget />
    </AppShell>
  );
}
