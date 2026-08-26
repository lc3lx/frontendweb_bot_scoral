export type Locale = 'en' | 'ar';

export type LocaleMeta = {
  locale: Locale;
  htmlLang: string;
  dir: 'ltr' | 'rtl';
  label: string;
  switchToLabel: string;
};

export const LOCALE_META: Record<Locale, LocaleMeta> = {
  en: {
    locale: 'en',
    htmlLang: 'en',
    dir: 'ltr',
    label: 'English',
    switchToLabel: 'العربية',
  },
  ar: {
    locale: 'ar',
    htmlLang: 'ar',
    dir: 'rtl',
    label: 'العربية',
    switchToLabel: 'English',
  },
};

export const DEFAULT_LOCALE: Locale = 'ar';
/** Same key as the main web app so language + dir survive login/home navigation. */
export const LOCALE_STORAGE_KEY = 'scar-alpha-web-locale';

export type NavKey =
  | 'home'
  | 'howItWorks'
  | 'aiBot'
  | 'trading'
  | 'dashboard'
  | 'pricing';

export type Messages = {
  seo: {
    title: string;
    description: string;
  };
  a11y: {
    primaryNav: string;
    footerNav: string;
    backToTop: string;
    switchLanguage: string;
    openMenu: string;
    closeMenu: string;
    productHighlights: string;
    tradeDirection: string;
    splashLoading: string;
  };
  header: {
    logoAlt: string;
    createAccount: string;
    login: string;
    nav: Record<NavKey, string>;
  };
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
    phonesDuoAlt: string;
    phoneSplashAlt: string;
    phoneDashboardAlt: string;
  };
  featureStrip: {
    items: Record<
      | 'ai-bot-controls'
      | 'technical-indicators'
      | 'binolla-trading'
      | 'trade-tracking'
      | 'activation-key',
      string
    >;
  };
  features: {
    eyebrow: string;
    title: string;
    description: string;
    cards: Record<
      | 'user-dashboard'
      | 'ai-bot-engine'
      | 'embedded-trading'
      | 'trade-tracking',
      { title: string; description: string }
    >;
  };
  pricing: {
    eyebrow: string;
    title: string;
    description: string;
    cta: string;
    popular: string;
    plans: Record<
      'starter-50' | 'starter-250' | 'starter-1000' | 'starter-2500',
      {
        title: string;
        rows: Partial<Record<'deposit' | 'bonus' | 'balance' | 'profit' | 'turnover', string>>;
      }
    >;
  };
  botEngine: {
    eyebrow: string;
    title: string;
    description: string;
    cards: Record<
      | 'duration'
      | 'market-type'
      | 'trading-pair'
      | 'daily-profit-target'
      | 'daily-loss-limit'
      | 'technical-indicator'
      | 'strategy'
      | 'signal-strength'
      | 'current-bot-status',
      { title: string; description: string }
    >;
  };
  trading: {
    eyebrow: string;
    title: string;
    description: string;
    binollaTitle: string;
    upLabel: string;
    downLabel: string;
    signalTitle: string;
    rows: Record<
      'indicator' | 'strategy' | 'market-type' | 'strength',
      { label: string; value: string }
    >;
  };
  statistics: {
    eyebrow: string;
    title: string;
    metrics: Record<
      'current-balance' | 'today-profit' | 'today-loss' | 'win-rate',
      string
    >;
    tradesTitle: string;
    tradesStatus: string;
    tradeStrategies: Record<'eur-usd' | 'gbp-jpy' | 'aud-cad', string>;
    chartAlt: string;
  };
  tradeTracking: {
    eyebrow: string;
    title: string;
    cards: Record<
      'live-trades' | 'completed-trades' | 'profit-loss' | 'timeline',
      { title: string; description: string }
    >;
  };
  security: {
    eyebrow: string;
    title: string;
    cards: Record<
      'secure-login' | 'admin-approval' | 'activation-key',
      { title: string; description: string }
    >;
  };
  footer: {
    disclaimerBefore: string;
    disclaimerLinkLabel: string;
    disclaimerAfter: string;
    copyrightBefore: string;
    copyrightCompany: string;
    logoAlt: string;
    groups: {
      general: { title: string; links: Record<string, string> };
      additional: { title: string; links: Record<string, string> };
      'follow-us': { title: string; links: Record<string, string> };
    };
  };
};
