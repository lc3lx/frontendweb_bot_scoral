import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { setLocale as setSharedLocale } from '@shared/i18n';
import { useBroker } from '@shared/market/useBroker';
import { withBrokerName } from './brokerNames';
import { ar } from './locales/ar';
import { en } from './locales/en';
import {
  DEFAULT_LOCALE,
  LOCALE_META,
  LOCALE_STORAGE_KEY,
  type Locale,
  type Messages,
} from './types';

const MESSAGES: Record<Locale, Messages> = { en, ar };

type I18nContextValue = {
  locale: Locale;
  dir: 'ltr' | 'rtl';
  /**
   * Translations with the broker's name already resolved to the user's own venue, so no
   * screen has to remember to substitute it.
   */
  t: Messages;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function readStoredLocale(): Locale {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored === 'en' || stored === 'ar') return stored;
  } catch {
    /* ignore */
  }
  return DEFAULT_LOCALE;
}

function applyDocumentLocale(locale: Locale) {
  const meta = LOCALE_META[locale];
  document.documentElement.lang = meta.htmlLang;
  document.documentElement.dir = meta.dir;
  document.body.lang = meta.htmlLang;
  document.body.dir = meta.dir;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() =>
    typeof window === 'undefined' ? DEFAULT_LOCALE : readStoredLocale(),
  );

  useEffect(() => {
    applyDocumentLocale(locale);
    setSharedLocale(locale);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
      /* ignore */
    }
  }, [locale]);

  const broker = useBroker();

  // One pass per locale/broker change. Copy naming a broker is naming THIS user's broker,
  // and doing it centrally is what stops a Quotex user seeing Binolla on their own trades.
  const messages = useMemo(() => withBrokerName(MESSAGES[locale], broker), [locale, broker]);

  const value = useMemo<I18nContextValue>(() => {
    const setLocale = (next: Locale) => setLocaleState(next);
    return {
      locale,
      dir: LOCALE_META[locale].dir,
      t: messages,
      setLocale,
      toggleLocale: () => setLocaleState((prev) => (prev === 'en' ? 'ar' : 'en')),
    };
  }, [locale, messages]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return ctx;
}
