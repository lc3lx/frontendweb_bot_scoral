import { aiBotAssets } from '@assets';

export type RiskLevel = 'low' | 'medium' | 'high' | 'highPlus';

/**
 * Market scope.
 *
 * `otc-market` was called `binolla-market` while Binolla was the only venue. Both brokers
 * run OTC books, so the scope was never really about Binolla — and saved bot settings
 * still carry the old id, which is why it is accepted below rather than dropped.
 */
export type MarketTypeId = 'global-indicators' | 'otc-market' | 'all-markets';

/** The id saved by bots configured before the scope stopped naming a broker. */
export const LEGACY_OTC_MARKET_ID = 'binolla-market';

/** Backend strategy catalog id (e.g. rsi, ema, smart). */
export type StrategyGridId = string;

export type BrandedStrategyId =
  | 'alpha-momentum'
  | 'scar-precision'
  | 'red-signal-pro'
  | 'trend-breaker';

export type BotRiskLevelId = 'low' | 'medium' | 'high';

export type MarketTypeOption = {
  id: MarketTypeId;
  icon: string;
  titleKey: 'globalIndicators' | 'otcMarket' | 'allMarkets';
  descriptionKey: 'globalIndicatorsDesc' | 'otcMarketDesc' | 'allMarketsDesc';
};

export type StrategyPresentationKey =
  | 'rsi'
  | 'ema'
  | 'smart'
  | 'alt5'
  | 'macd'
  | 'ai'
  | 'bollinger'
  | 'stochastic';

export type StrategyGridOption = {
  id: StrategyGridId;
  name: string;
  status: string;
  enabled: boolean;
  preview: string;
  risk: RiskLevel;
  descriptionKey: StrategyPresentationKey;
  bestForKey: StrategyPresentationKey;
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
    id: 'otc-market',
    icon: aiBotAssets.iconBinollaMarket,
    titleKey: 'otcMarket',
    descriptionKey: 'otcMarketDesc',
  },
  {
    // Both feeds at once — the widest set of pairs the bot can choose from.
    id: 'all-markets',
    icon: aiBotAssets.iconGlobalMarket,
    titleKey: 'allMarkets',
    descriptionKey: 'allMarketsDesc',
  },
];

type StrategyPresentation = {
  preview: string;
  risk: RiskLevel;
  descriptionKey: StrategyPresentationKey;
  bestForKey: StrategyPresentationKey;
};

/** Visual metadata for backend strategy ids — design stays the same. */
export const STRATEGY_PRESENTATION: Record<string, StrategyPresentation> = {
  smart: {
    preview: aiBotAssets.previewBollinger,
    risk: 'medium',
    descriptionKey: 'smart',
    bestForKey: 'smart',
  },
  rsi: {
    preview: aiBotAssets.previewRsi,
    risk: 'low',
    descriptionKey: 'rsi',
    bestForKey: 'rsi',
  },
  ema: {
    preview: aiBotAssets.previewStochastic,
    risk: 'medium',
    descriptionKey: 'ema',
    bestForKey: 'ema',
  },
  alt5: {
    preview: aiBotAssets.previewBollinger,
    risk: 'medium',
    descriptionKey: 'alt5',
    bestForKey: 'alt5',
  },
  macd: {
    preview: aiBotAssets.previewMacd,
    risk: 'medium',
    descriptionKey: 'macd',
    bestForKey: 'macd',
  },
  ai: {
    preview: aiBotAssets.previewStochastic,
    risk: 'high',
    descriptionKey: 'ai',
    bestForKey: 'ai',
  },
};

const DEFAULT_STRATEGY_PRESENTATION: StrategyPresentation = {
  preview: aiBotAssets.previewRsi,
  risk: 'medium',
  descriptionKey: 'rsi',
  bestForKey: 'rsi',
};

export function getStrategyPresentation(id: string): StrategyPresentation {
  return STRATEGY_PRESENTATION[id.trim().toLowerCase()] ?? DEFAULT_STRATEGY_PRESENTATION;
}

/** @deprecated Prefer listStrategies() from aiBotService — kept as empty fallback. */
export const STRATEGY_GRID_OPTIONS: StrategyGridOption[] = [];

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
  return 'all-markets';
}

/**
 * Normalises a saved scope id.
 *
 * A bot configured before the rename holds `binolla-market`. Left unmapped it matches no
 * known option, so the picker would show nothing selected and the pair filter would fall
 * through to the global branch — quietly switching a Quotex user's OTC bot onto
 * exchange-hours pairs.
 */
export function normalizeMarketTypeId(value: string | null | undefined): MarketTypeId {
  const id = String(value ?? '').trim();
  if (id === LEGACY_OTC_MARKET_ID) return 'otc-market';
  if (id === 'otc-market' || id === 'global-indicators' || id === 'all-markets') {
    return id;
  }
  return getDefaultMarketTypeId();
}

/**
 * Whether a pair belongs to the selected market scope.
 *
 * Both brokers mark their synthetic books with an `_otc` suffix; everything else is an
 * exchange-hours pair. `all-markets` accepts both, which is the point of it existing.
 */
export function pairMatchesMarketType(
  symbol: string,
  marketTypeId: MarketTypeId | string,
): boolean {
  const scope = normalizeMarketTypeId(marketTypeId);
  if (scope === 'all-markets') return true;
  const isOtc = /_otc$/i.test(symbol.trim());
  return scope === 'otc-market' ? isOtc : !isOtc;
}

export function getDefaultStrategyGridId(): StrategyGridId {
  return 'rsi';
}

export function getDefaultBrandedStrategyId(): BrandedStrategyId {
  return 'red-signal-pro';
}

export function getDefaultTradingPairIds(): string[] {
  return ['EURUSD_otc'];
}

const BRANDED_STRATEGY_IDS = new Set<BrandedStrategyId>(
  BRANDED_STRATEGY_OPTIONS.map((option) => option.id),
);

export function isBrandedStrategyId(value: string | null | undefined): value is BrandedStrategyId {
  return Boolean(value && BRANDED_STRATEGY_IDS.has(value as BrandedStrategyId));
}
