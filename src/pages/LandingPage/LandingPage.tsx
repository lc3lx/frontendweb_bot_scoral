import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { I18nProvider } from '@landing/i18n';
import { LandingPage as LandingContent } from '@landing/pages/Landing';
import { tokenStore } from '@shared/auth/tokenStore';

import { ROUTES } from '@router/routes';

/**
 * Public marketing home at `/`.
 *
 * The landing was a separate Vite app on its own port; it now lives inside this app
 * under `src/landing` with its own i18n and component set, wrapped here so its
 * providers stay scoped to this route and cannot leak into the authenticated pages.
 *
 * A signed-in visitor is sent straight to their dashboard — the marketing page is for
 * people who are not logged in yet.
 */
export function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    if (tokenStore.isAuthenticated()) {
      navigate(ROUTES.home, { replace: true });
    }
  }, [navigate]);

  return (
    <I18nProvider>
      <LandingContent />
    </I18nProvider>
  );
}
