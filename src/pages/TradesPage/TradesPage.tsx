import { useEffect } from 'react';

import { AppShell } from '@components/AppShell';
import { useI18n } from '@i18n';

import { TradesContent } from './TradesContent';

/** Figma frame "8" (737:911) — AI trading history with filters and trade cards. */
export function TradesPage() {
  const { t } = useI18n();

  useEffect(() => {
    document.title = t.trades.seo.title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', t.trades.seo.description);
  }, [t.trades.seo.description, t.trades.seo.title]);

  return (
    <AppShell title={t.trades.header.title} activeNav="trades">
      <TradesContent figmaNode="737:911" />
    </AppShell>
  );
}
