export const LANDING_SECTION_IDS = {
  header: 'header',
  hero: 'hero',
  featureStrip: 'feature-strip',
  features: 'features',
  pricing: 'pricing',
  botEngine: 'bot-engine',
  trading: 'trading',
  statistics: 'statistics',
  tradeTracking: 'trade-tracking',
  security: 'security',
  footer: 'footer',
} as const;

export type LandingSectionId =
  (typeof LANDING_SECTION_IDS)[keyof typeof LANDING_SECTION_IDS];
