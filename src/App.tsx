import { BrowserRouter } from 'react-router-dom';
import { LanguageSwitcher } from '@components/LanguageSwitcher';
import { I18nProvider } from '@i18n';
import { AppRouter } from '@router';
import styles from './App.module.css';

export default function App() {
  return (
    <I18nProvider>
      <LanguageSwitcher />
      <div className={styles.app}>
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </div>
    </I18nProvider>
  );
}
