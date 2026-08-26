import { aiBotAssets } from '@assets';

export type RiskLevel = 'low' | 'medium' | 'high' | 'highPlus';

export type MarketTypeId = 'global-indicators' | 'binolla-market';

export type StrategyGridId = 'rsi' | 'bollinger' | 'macd' | 'stochastic';

export type BrandedStrategyId =
  | 'alpha-momentum'
  | 'scar-precision'
  | 'red-signal-pro'
  | 'trend-breaker';

export type BotRiskLevelId = 'low' | 'medium' | 'high';

export type MarketTypeOption = {
  id: MarketTypeId;
  icon: string;
  titleKey: 'globalIndicators' | 'binollaMarket';
  descriptionKey: 'globalIndicatorsDesc' | 'binollaMarketDesc';
};

export type StrategyGridOption = {
  id: StrategyGridId;
  preview: string;
  titleKey: 'rsi' | 'bollinger' | 'macd' | 'stochastic';
  descriptionKey: 'rsiDesc' | 'bollingerDesc' | 'macdDesc' | 'stochasticDesc';
  bestForKey: 'rsiBestFor' | 'bollingerBestFor' | 'macdBestFor' | 'stochasticBestFor';
  risk: RiskLevel;
};

export type TradingPairOption = {
  id: string;
  badge: string;
  symbol: string;
  price: string;
  change: string;
  positive: boolean;
};

export type BrandedStrategyOption = {
  id: BrandedStrategyId;
  preview: string;
  titleKey: 'alphaMomentum' | 'scarPrecision' | 'redSignalPro' | 'trendBreaker';
  descriptionKey:
    | 'alphaMomentumDesc'
    | 'scarPrecisionDesc'
    | 'redSignalProDesc'
    | 'trendBreakerDesc';
  risk: RiskLevel;
  balance: string;
  detailModalNode: string;
};

export type StrategyDetailContent = {
  id: BrandedStrategyId;
  figmaNode: string;
  preview: string;
  titleKey: BrandedStrategyOption['titleKey'];
  subtitleKey: BrandedStrategyOption['descriptionKey'];
  risk: RiskLevel;
  recommendedBalance: string;
  riskLabelKey: 'medium' | 'low' | 'high' | 'highPlus';
  aboutKey: 'alphaMomentumAbout' | 'scarPrecisionAbout' | 'redSignalProAbout' | 'trendBreakerAbout';
  howItWorksKey:
    | 'alphaMomentumHow'
    | 'scarPrecisionHow'
    | 'redSignalProHow'
    | 'trendBreakerHow';
  bullets: Array<
    | 'bulletTrending'
    | 'bulletSwings'
    | 'bulletBalanced'
    | 'bulletMeanReversion'
    | 'bulletScalping'
    | 'bulletBreakouts'
  >;
};

export type BotSettingsToggleId =
  | 'auto-profit'
  | 'auto-loss'
  | 'signal-confirm'
  | 'notifications';

export const MARKET_TYPE_OPTIONS: MarketTypeOption[] = [
  {
    id: 'global-indicators',
    icon: aiBotAssets.iconGlobalMarket,
    titleKey: 'globalIndicators',
    descriptionKey: 'globalIndicatorsDesc',
  },
  {
    id: 'binolla-market',
    icon: aiBotAssets.iconBinollaMarket,
    titleKey: 'binollaMarket',
    descriptionKey: 'binollaMarketDesc',
  },
];

export const STRATEGY_GRID_OPTIONS: StrategyGridOption[] = [
  {
    id: 'bollinger',
    preview: aiBotAssets.previewBollinger,
    titleKey: 'bollinger',
    descriptionKey: 'bollingerDesc',
    bestForKey: 'bollingerBestFor',
    risk: 'medium',
  },
  {
    id: 'rsi',
    preview: aiBotAssets.previewRsi,
    titleKey: 'rsi',
    descriptionKey: 'rsiDesc',
    bestForKey: 'rsiBestFor',
    risk: 'low',
  },
  {
    id: 'macd',
    preview: aiBotAssets.previewMacd,
    titleKey: 'macd',
    descriptionKey: 'macdDesc',
    bestForKey: 'macdBestFor',
    risk: 'medium',
  },
  {
    id: 'stochastic',
    preview: aiBotAssets.previewStochastic,
    titleKey: 'stochastic',
    descriptionKey: 'stochasticDesc',
    bestForKey: 'stochasticBestFor',
    risk: 'medium',
  },
];

export const TRADING_PAIR_OPTIONS: TradingPairOption[] = [
  {
    id: 'eur-usd',
    badge: 'EU',
    symbol: 'EUR/USD',
    price: '1.08423',
    change: '+0.12%',
    positive: true,
  },
  {
    id: 'gbp-usd',
    badge: 'GB',
    symbol: 'GBP/USD',
    price: '1.27182',
    change: '-0.08%',
    positive: false,
  },
  {
    id: 'usd-jpy',
    badge: 'US',
    symbol: 'USD/JPY',
    price: '156.442',
    change: '+0.24%',
    positive: true,
  },
  {
    id: 'usd-idr',
    badge: 'US',
    symbol: 'USD/IDR OTC',
    price: '16,241.5',
    change: '+0.44%',
    positive: true,
  },
  {
    id: 'eur-jpy',
    badge: 'EU',
    symbol: 'EUR/JPY',
    price: '169.812',
    change: '-0.11%',
    positive: false,
  },
  {
    id: 'btc-usd',
    badge: 'BT',
    symbol: 'BTC/USD',
    price: '68,421.2',
    change: '+1.82%',
    positive: true,
  },
];

export const BRANDED_STRATEGY_OPTIONS: BrandedStrategyOption[] = [
  {
    id: 'red-signal-pro',
    preview: aiBotAssets.previewRedSignalPro,
    titleKey: 'redSignalPro',
    descriptionKey: 'redSignalProDesc',
    risk: 'low',
    balance: '$50+',
    detailModalNode: '737:8458',
  },
  {
    id: 'alpha-momentum',
    preview: aiBotAssets.previewAlphaMomentum,
    titleKey: 'alphaMomentum',
    descriptionKey: 'alphaMomentumDesc',
    risk: 'medium',
    balance: '$250+',
    detailModalNode: '737:7760',
  },
  {
    id: 'scar-precision',
    preview: aiBotAssets.previewScarPrecision,
    titleKey: 'scarPrecision',
    descriptionKey: 'scarPrecisionDesc',
    risk: 'high',
    balance: '$1000+',
    detailModalNode: '737:8109',
  },
  {
    id: 'trend-breaker',
    preview: aiBotAssets.previewTrendBreaker,
    titleKey: 'trendBreaker',
    descriptionKey: 'trendBreakerDesc',
    risk: 'highPlus',
    balance: '$2500+',
    detailModalNode: '737:8807',
  },
];

export const STRATEGY_DETAIL_CONTENT: Record<BrandedStrategyId, StrategyDetailContent> = {
  'alpha-momentum': {
    id: 'alpha-momentum',
    figmaNode: '737:7760',
    preview: aiBotAssets.detailAlphaMomentum,
    titleKey: 'alphaMomentum',
    subtitleKey: 'alphaMomentumDesc',
    risk: 'medium',
    recommendedBalance: '$250+',
    riskLabelKey: 'medium',
    aboutKey: 'alphaMomentumAbout',
    howItWorksKey: 'alphaMomentumHow',
    bullets: ['bulletTrending', 'bulletSwings', 'bulletBalanced'],
  },
  'scar-precision': {
    id: 'scar-precision',
    figmaNode: '737:8109',
    preview: aiBotAssets.detailScarPrecision,
    titleKey: 'scarPrecision',
    subtitleKey: 'scarPrecisionDesc',
    risk: 'high',
    recommendedBalance: '$1000+',
    riskLabelKey: 'high',
    aboutKey: 'scarPrecisionAbout',
    howItWorksKey: 'scarPrecisionHow',
    bullets: ['bulletMeanReversion', 'bulletSwings', 'bulletBalanced'],
  },
  'red-signal-pro': {
    id: 'red-signal-pro',
    figmaNode: '737:8458',
    preview: aiBotAssets.detailRedSignalPro,
    titleKey: 'redSignalPro',
    subtitleKey: 'redSignalProDesc',
    risk: 'low',
    recommendedBalance: '$50+',
    riskLabelKey: 'low',
    aboutKey: 'redSignalProAbout',
    howItWorksKey: 'redSignalProHow',
    bullets: ['bulletScalping', 'bulletSwings', 'bulletBalanced'],
  },
  'trend-breaker': {
    id: 'trend-breaker',
    figmaNode: '737:8807',
    preview: aiBotAssets.detailTrendBreaker,
    titleKey: 'trendBreaker',
    subtitleKey: 'trendBreakerDesc',
    risk: 'highPlus',
    recommendedBalance: '$2500+',
    riskLabelKey: 'highPlus',
    aboutKey: 'trendBreakerAbout',
    howItWorksKey: 'trendBreakerHow',
    bullets: ['bulletBreakouts', 'bulletSwings', 'bulletBalanced'],
  },
};

export const BOT_SETTINGS_TOGGLES: BotSettingsToggleId[] = [
  'auto-profit',
  'auto-loss',
  'signal-confirm',
  'notifications',
];

export const BOT_RISK_LEVELS: BotRiskLevelId[] = ['low', 'medium', 'high'];

export function getDefaultMarketTypeId(): MarketTypeId {
  return 'global-indicators';
}

export function getDefaultStrategyGridId(): StrategyGridId {
  return 'bollinger';
}

export function getDefaultBrandedStrategyId(): BrandedStrategyId {
  return 'red-signal-pro';
}

export function getDefaultTradingPairId(): string {
  return 'eur-usd';
}

const BRANDED_STRATEGY_IDS = new Set<BrandedStrategyId>(
  BRANDED_STRATEGY_OPTIONS.map((option) => option.id),
);

export function isBrandedStrategyId(value: string | null | undefined): value is BrandedStrategyId {
  return Boolean(value && BRANDED_STRATEGY_IDS.has(value as BrandedStrategyId));
}
