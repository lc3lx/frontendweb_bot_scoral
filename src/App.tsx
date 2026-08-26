import { BrowserRouter, useLocation } from 'react-router-dom';
import { LanguageSwitcher } from '@components/LanguageSwitcher';
import { I18nProvider } from '@i18n';
import { AppRouter } from '@router';
import { ROUTES } from '@router/routes';
import styles from './App.module.css';

/** Landing has its own header language control — hide the floating global switcher there. */
function AppChrome() {
  const { pathname } = useLocation();
  const onLanding = pathname === ROUTES.landing;

  return (
    <>
      {!onLanding ? <LanguageSwitcher /> : null}
      <div className={styles.app} data-route={onLanding ? 'landing' : 'app'}>
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
