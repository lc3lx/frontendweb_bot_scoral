import { useEffect } from 'react';

import { AppShell } from '@components/AppShell';
import { useI18n } from '@i18n';

import { TradingContent } from './TradingContent';

/** Figma frame "7" (736:414) — live trading terminal with AI signal panel. */
export function TradingPage() {
  const { t } = useI18n();

  useEffect(() => {
    document.title = t.trading.seo.title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', t.trading.seo.description);
  }, [t.trading.seo.description, t.trading.seo.title]);

  return (
    <AppShell title={t.trading.header.title} activeNav="trading">
      <TradingContent figmaNode="736:414" />
    </AppShell>
  );
}
