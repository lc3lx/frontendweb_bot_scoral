import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import {
  LOCALE_META as APP_LOCALE_META,
  useI18n as useAppI18n,
  type Locale,
} from '@i18n';
import { ar } from './locales/ar';
import { en } from './locales/en';
import { LOCALE_META, type Messages } from './types';

const MESSAGES: Record<Locale, Messages> = { en, ar };

type I18nContextValue = {
  locale: Locale;
  dir: 'ltr' | 'rtl';
  t: Messages;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
};

const I18nContext = createContext<I18nContextValue | null>(null);

/**
 * Bridges the app-wide locale (Arabic/English + document dir) into landing copy.
 * One storage key, one dir on <html>/<body> — no nested locale fight with login/dashboard.
 */
export function I18nProvider({ children }: { children: ReactNode }) {
  const app = useAppI18n();

  useEffect(() => {
    const meta = APP_LOCALE_META[app.locale];
    document.documentElement.lang = meta.htmlLang;
    document.documentElement.dir = meta.dir;
    document.body.lang = meta.htmlLang;
    document.body.dir = meta.dir;
  }, [app.locale]);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale: app.locale,
      dir: app.dir,
      t: MESSAGES[app.locale],
      setLocale: app.setLocale,
      toggleLocale: app.toggleLocale,
    }),
    [app.dir, app.locale, app.setLocale, app.toggleLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within landing I18nProvider');
  }
  return ctx;
}

export { LOCALE_META };
