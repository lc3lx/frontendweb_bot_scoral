import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { I18nProvider } from '@landing/i18n';
import { LandingPage as LandingContent } from '@landing/pages/Landing';
import { tokenStore } from '@shared/auth/tokenStore';

import { ROUTES } from '@router/routes';

import '@landing/styles/index.css';

/**
 * Public marketing home at `/`.
 *
 * Lives under `src/landing` with its own copy tables, bridged to the app locale
 * so Arabic/English dir stays in sync with login and the rest of the product.
 */
export function LandingPage() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (tokenStore.isAuthenticated()) {
      navigate(ROUTES.home, { replace: true });
    }
  }, [navigate, location.pathname]);

  return (
    <I18nProvider>
      <LandingContent />
    </I18nProvider>
  );
}
