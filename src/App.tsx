import { BrowserRouter, useLocation } from 'react-router-dom';
import { LanguageSwitcher } from '@components/LanguageSwitcher';
import { PageTransition } from '@components/PageTransition';
import { I18nProvider } from '@i18n';
import { AppRouter } from '@router';
import { ROUTES } from '@router/routes';
import styles from './App.module.css';

const AUTH_ROUTES = new Set<string>([
  ROUTES.login,
  ROUTES.signup,
  ROUTES.pendingApproval,
  ROUTES.linkBinolla,
]);

function routeDataAttr(pathname: string): 'landing' | 'auth' | 'app' {
  if (pathname === ROUTES.landing) return 'landing';
  if (AUTH_ROUTES.has(pathname)) return 'auth';
  return 'app';
}

/**
 * Landing has its own header language control.
 * App shell pages put the switcher in DashboardHeader so it cannot cover the title.
 * Auth screens keep the floating control.
 */
function AppChrome() {
  const { pathname } = useLocation();
  const route = routeDataAttr(pathname);

  return (
    <>
      <PageTransition />
      {route === 'auth' ? <LanguageSwitcher /> : null}
      <div className={styles.app} data-route={route}>
        <AppRouter />
      </div>
    </>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <BrowserRouter>
        <AppChrome />
      </BrowserRouter>
    </I18nProvider>
  );
}
