import { FIGMA_LANDING_NODES } from '@landing/constants/figma';
import { LANDING_SECTION_IDS } from '../constants/sectionIds';

/**
 * Section ↔ Figma node map.
 * UI mounts one section at a time in Phase 4.
 */
export const LANDING_SECTIONS = [
  {
    id: LANDING_SECTION_IDS.header,
    figmaNodeId: FIGMA_LANDING_NODES.header,
    folder: 'Header',
  },
  {
    id: LANDING_SECTION_IDS.hero,
    figmaNodeId: FIGMA_LANDING_NODES.heroCopy,
    folder: 'Hero',
  },
  {
    id: LANDING_SECTION_IDS.featureStrip,
    figmaNodeId: FIGMA_LANDING_NODES.featureStrip,
    folder: 'FeatureStrip',
  },
  {
    id: LANDING_SECTION_IDS.features,
    figmaNodeId: FIGMA_LANDING_NODES.featuresGrid,
    folder: 'Features',
  },
  {
    id: LANDING_SECTION_IDS.pricing,
    figmaNodeId: FIGMA_LANDING_NODES.pricing,
    folder: 'Pricing',
  },
  {
    id: LANDING_SECTION_IDS.botEngine,
    figmaNodeId: FIGMA_LANDING_NODES.botEngineTitle,
    folder: 'BotEngine',
  },
  {
    id: LANDING_SECTION_IDS.trading,
    figmaNodeId: FIGMA_LANDING_NODES.tradingCopy,
    folder: 'Trading',
  },
  {
    id: LANDING_SECTION_IDS.statistics,
    figmaNodeId: FIGMA_LANDING_NODES.statisticsTitle,
    folder: 'Statistics',
  },
  {
    id: LANDING_SECTION_IDS.tradeTracking,
    figmaNodeId: FIGMA_LANDING_NODES.tradeTracking,
    folder: 'TradeTracking',
  },
  {
    id: LANDING_SECTION_IDS.security,
    figmaNodeId: FIGMA_LANDING_NODES.security,
    folder: 'Security',
  },
  {
    id: LANDING_SECTION_IDS.footer,
    figmaNodeId: FIGMA_LANDING_NODES.footer,
    folder: 'Footer',
  },
] as const;

export type LandingSectionMeta = (typeof LANDING_SECTIONS)[number];
