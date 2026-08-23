import { useEffect } from 'react';

import { AppShell } from '@components/AppShell';
import { useI18n } from '@i18n';

import { AiBotContent } from './AiBotContent';
import { AiBotModalHost } from './AiBotModalHost';
import { AiBotModalProvider } from './AiBotModalContext';

/** Figma frame "10" (737:912) — AI Bot Engine control panel. */
export function AiBotPage() {
  const { t } = useI18n();

  useEffect(() => {
    document.title = t.aiBot.seo.title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', t.aiBot.seo.description);
  }, [t.aiBot.seo.description, t.aiBot.seo.title]);

  return (
    <AppShell title={t.aiBot.header.pageTitle} activeNav="aiBot">
      <AiBotModalProvider>
        <AiBotContent figmaNode="737:912" />
        <AiBotModalHost />
      </AiBotModalProvider>
    </AppShell>
  );
}
