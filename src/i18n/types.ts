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



/** Arabic is the primary locale for Scar Alpha web. */

export const DEFAULT_LOCALE: Locale = 'ar';

export const LOCALE_STORAGE_KEY = 'scar-alpha-web-locale';



export type LoginFeatureMessages = {

  title: string;

  description: string;

};



export type Messages = {

  seo: {

    title: string;

    description: string;

  };

  a11y: {

    switchLanguage: string;

    splashLoading: string;

    showPassword: string;

    hidePassword: string;

    backToLogin: string;

  };

  brand: {

    logoAlt: string;

  };

  login: {

    seo: {

      title: string;

      description: string;

    };

    hero: {

      line1: string;

      line2Prefix: string;

      line2Highlight: string;

      subtitle: string;

      copyright: string;

    };

    features: [LoginFeatureMessages, LoginFeatureMessages, LoginFeatureMessages];

    form: {

      welcome: string;

      subtitle: string;

      emailLabel: string;

      emailPlaceholder: string;

      passwordLabel: string;

      forgotPassword: string;

      submit: string;

      disclaimer: string;

      noAccount: string;

      createAccount: string;

    };

  };

  signup: {

    seo: {

      title: string;

      description: string;

    };

    topBar: {

      title: string;

    };

    form: {

      heading: string;

      subtitle: string;

      fullNameLabel: string;

      fullNamePlaceholder: string;

      emailLabel: string;

      emailPlaceholder: string;

      passwordLabel: string;

      passwordPlaceholder: string;

      countryLabel: string;

      countryPlaceholder: string;

      telegramLabel: string;

      telegramPlaceholder: string;

      binollaLabel: string;

      binollaPlaceholder: string;

      submit: string;

      disclaimer: string;

    };

  };

  pendingApproval: {

    seo: {

      title: string;

      description: string;

    };

    topBar: {

      title: string;

    };

    status: {

      chip: string;

      heading: string;

      description: string;

    };

    details: {

      submittedLabel: string;

      submittedValue: string;

      estimatedLabel: string;

      estimatedValue: string;

      reviewerLabel: string;

      reviewerValue: string;

    };

    actions: {

      refresh: string;

      backToLogin: string;

    };

  };

  dashboard: {

    seo: {

      title: string;

      description: string;

    };

    sidebarAria: string;

    widgetsAria: string;

    profileAria: string;

    notificationsAria: string;

    header: {

      title: string;

    };

    hero: {

      kicker: string;

      subtitle: string;

      live: string;

    };

    nav: {

      home: string;

      trading: string;

      trades: string;

      aiBot: string;

      account: string;

      logout: string;

    };

    user: {

      name: string;

      balance: string;

      demo: string;

    };

    accountMenu: {

      aria: string;

      email: string;

      realAccount: string;

      demoAccount: string;

      active: string;

      openAccount: string;

    };

    onboarding: {

      title: string;

      description: string;

      cta: string;

    };

    balance: {

      label: string;

      todayProfit: string;

      todayLoss: string;

      netToday: string;

    };

    stats: {

      aria: string;

      weekProfit: string;

      monthProfit: string;

      totalTrades: string;

      winRate: string;

    };

    performance: {

      label: string;

      filtersAria: string;

      timeframes: {

        today: string;

        '7d': string;

        '30d': string;

        all: string;

      };

      yAxis: [string, string, string, string, string, string];

      xAxis: [string, string, string, string, string];

    };

    botStatus: {

      title: string;

      running: string;

      pair: string;

      indicator: string;

      strategy: string;

      signal: string;

      openBot: string;

    };

    alphaPro: {

      title: string;

      manage: string;

    };

    recentTrades: {

      title: string;

      seeAll: string;

      empty: string;

      columns: {

        pair: string;

        strategy: string;

        time: string;

        amount: string;

        pl: string;

        action: string;

      };

    };

  };

  dashboardScroll: {

    seo: {

      title: string;

      description: string;

    };

  };

  trading: {

    seo: {

      title: string;

      description: string;

    };

    header: {

      title: string;

      subtitle: string;

    };

    status: {

      connected: string;

      demo: string;

      refreshAria: string;

      externalAria: string;

    };

    terminal: {

      binolla: string;

      embeddedTerminal: string;

      balance: string;

      expiry: string;

      amount: string;

      duration: string;

      up: string;

      down: string;

      placing: string;

      placed: string;

      placeFailed: string;

      selectPair: string;

      noPairs: string;

      chartEntry: string;

    };

    signal: {

      aria: string;

      title: string;

      subtitle: string;

      fresh: string;

      lastSignal: string;

      strength: string;

      indicator: string;

      strategy: string;

      market: string;

      openBot: string;

    };

  };

  trades: {

    seo: {

      title: string;

      description: string;

    };

    header: {

      title: string;

      subtitle: string;

    };

    filters: {

      all: string;

      live: string;

      profit: string;

      loss: string;

      today: string;

    };

    fields: {

      profitLoss: string;

      status: string;

      strategy: string;

      indicator: string;

      amount: string;

      source: string;

      duration: string;

    };

    outcome: {

      profit: string;

      loss: string;

      running: string;

    };

    source: {

      global: string;

      binolla: string;

    };

    tradeSource: {

      bot: string;

      manual: string;

      user: string;

      demo: string;

    };

    actions: {

      details: string;

      viewChart: string;

    };

    empty: string;

  };

  tradeDetail: {

    seo: {

      title: string;

      description: string;

    };

    subTitle: string;

    back: string;

    notFound: string;

    summary: {

      aria: string;

      onAmount: string;

    };

    specs: {

      aria: string;

    };

    fields: {

      direction: string;

      amount: string;

      duration: string;

      entryTime: string;

      exitTime: string;

      indicator: string;

      strategy: string;

      signalStrength: string;

      tradeSource: string;

      status: string;

    };

    direction: {

      up: string;

      down: string;

    };

    timeline: {

      aria: string;

      title: string;

      signalDetected: string;

      tradeOpened: string;

      tradeClosed: string;

      resultCalculated: string;

    };

  };

  aiBot: {

    seo: {

      title: string;

      description: string;

    };

    header: {

      pageTitle: string;

      title: string;

      subtitle: string;

    };

    status: {

      aria: string;

      running: string;

      paused: string;

      stopped: string;

      neuralEngine: string;

      signal: string;

      strength: string;

      updated: string;

      indicator: string;

      strategy: string;

      market: string;

      fresh: string;

    };

    controls: {

      title: string;

      start: string;

      pause: string;

      stop: string;

      apply: string;

    };

    performance: {

      title: string;

      totalBalance: string;

      todayPlus: string;

      todayMinus: string;

      net: string;

      active: string;

      winRate: string;

      trades: string;

    };

    configuration: {

      title: string;

      marketType: string;

      tradingPair: string;

      indicator: string;

      strategy: string;

    };

    parameters: {

      tradeAmount: string;

      duration: string;

      custom: string;

    };

    targets: {

      profitTitle: string;

      profitHint: string;

      lossTitle: string;

      lossHint: string;

    };

    actions: {

      showChart: string;

      botSettings: string;

    };

    modals: {

      riskLevels: {

        low: string;

        medium: string;

        high: string;

        highPlus: string;

      };

      marketType: {

        title: string;

        subtitle: string;

        globalIndicators: string;

        globalIndicatorsDesc: string;

        binollaMarket: string;

        binollaMarketDesc: string;

      };

      strategyGrid: {

        titlePrefix: string;

        titleEmphasis: string;

        subtitle: string;

        rsi: string;

        bollinger: string;

        macd: string;

        stochastic: string;

        rsiDesc: string;

        bollingerDesc: string;

        macdDesc: string;

        stochasticDesc: string;

        rsiBestFor: string;

        bollingerBestFor: string;

        macdBestFor: string;

        stochasticBestFor: string;

      };

      tradingPair: {

        title: string;

        subtitle: string;

        searchPlaceholder: string;

        chooseAll: string;

      };

      technicalIndicator: {

        titlePrefix: string;

        titleEmphasis: string;

        subtitle: string;

        balanceLabel: string;

        viewDetails: string;

      };

      brandedStrategy: {

        alphaMomentum: string;

        scarPrecision: string;

        redSignalPro: string;

        trendBreaker: string;

        alphaMomentumDesc: string;

        scarPrecisionDesc: string;

        redSignalProDesc: string;

        trendBreakerDesc: string;

      };

      strategyDetail: {

        back: string;

        recommended: string;

        riskLevel: string;

        aboutTitle: string;

        howTitle: string;

        select: string;

        selected: string;

        alphaMomentumAbout: string;

        scarPrecisionAbout: string;

        redSignalProAbout: string;

        trendBreakerAbout: string;

        alphaMomentumHow: string;

        scarPrecisionHow: string;

        redSignalProHow: string;

        trendBreakerHow: string;

        bulletTrending: string;

        bulletSwings: string;

        bulletBalanced: string;

        bulletMeanReversion: string;

        bulletScalping: string;

        bulletBreakouts: string;

      };

      botSettings: {

        title: string;

        subtitle: string;

        cancel: string;

        save: string;

        behaviorTitle: string;

        tradeConfigTitle: string;

        riskTitle: string;

        riskLevel: string;

        riskHint: string;

        toggles: {

          'auto-profit': { title: string; description: string };

          'auto-loss': { title: string; description: string };

          'signal-confirm': { title: string; description: string };

          notifications: { title: string; description: string };

        };

      };

    };

    disclaimer: string;

  };

  account: {

    seo: {

      title: string;

      description: string;

    };

    header: {

      title: string;

      subtitle: string;

      subPageTitle: string;

    };

    subPages: {

      editProfile: {

        seo: {

          title: string;

          description: string;

        };

      };

      changePassword: {

        seo: {

          title: string;

          description: string;

        };

      };

      notifications: {

        seo: {

          title: string;

          description: string;

        };

      };

    };

    subBar: {

      editProfile: string;

      changePassword: string;

      notifications: string;

    };

    profile: {

      approved: string;

      alphaPro: string;

    };

    sections: {

      accountDetails: string;

      settings: string;

      session: string;

    };

    fields: {

      country: string;

      telegram: string;

      binollaId: string;

      fullName: string;

      telegramId: string;

      binollaAccountId: string;

      currentPassword: string;

      newPassword: string;

      confirmPassword: string;

    };

    settings: {

      editProfile: string;

      changePassword: string;

      notifications: string;

    };

    actions: {

      saveChanges: string;

      updatePassword: string;

      logout: string;

      markAll: string;

      back: string;

    };

    footer: {

      version: string;

    };

    notifications: {

      items: {

        accountApproved: { title: string; description: string; timeAgo: string };

        activationSuccess: { title: string; description: string; timeAgo: string };

        botStarted: { title: string; description: string; timeAgo: string };

        newSignalDetected: { title: string; description: string; timeAgo: string };

        liveTradeStarted: { title: string; description: string; timeAgo: string };

        tradeProfit: { title: string; description: string; timeAgo: string };

        tradeLoss: { title: string; description: string; timeAgo: string };

        profitTargetReached: { title: string; description: string; timeAgo: string };

        lossLimitReached: { title: string; description: string; timeAgo: string };

        strategyUpdated: { title: string; description: string; timeAgo: string };

        botStopped: { title: string; description: string; timeAgo: string };

        indicatorUpdated: { title: string; description: string; timeAgo: string };

      };

    };

  };

};


