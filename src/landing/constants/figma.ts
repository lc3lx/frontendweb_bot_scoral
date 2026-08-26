/**
 * Figma source of truth for the Landing Page project.
 * File: Scar Alpha Bot
 */
export const FIGMA_FILE_KEY = '2Xub9DUc8qXvRygoo6mBDv';

export const FIGMA_PAGES = {
  thumbnail: '0:1',
  fontAndColor: '1:2',
  bot: '1:3',
  landing: '1:5',
  dashboardAdmin: '1:30327',
} as const;

/** Landing page nodes — Desktop - 1 and section roots (Phase 1). */
export const FIGMA_LANDING_NODES = {
  desktopRoot: '385:1473',
  header: '55:584',
  heroCopy: '55:515',
  heroPhones: '388:1507',
  featureStrip: '388:1766',
  featuresTitle: '55:31',
  featuresSubtitle: '475:130',
  featuresGrid: '523:1840',
  pricing: '596:1316',
  pricingPlan50: '641:182',
  pricingPlan250: '642:445',
  pricingPlan1000: '642:463',
  pricingPlan2500: '642:481',
  botEngineTitle: '55:134',
  botEngineCol1: '524:1949',
  botEngineCol2: '524:1948',
  botEngineCol3: '524:1947',
  tradingCopy: '55:224',
  tradingBinolla: '55:231',
  tradingSignal: '55:246',
  tradingCandles: '488:1266',
  statisticsTitle: '55:266',
  statisticsMetrics: '55:274',
  statisticsChart: '491:1487',
  statisticsTrades: '55:299',
  tradeTracking: '488:1479',
  security: '491:1572',
  footer: '385:1415',
} as const;

export type FigmaLandingNodeId =
  (typeof FIGMA_LANDING_NODES)[keyof typeof FIGMA_LANDING_NODES];
