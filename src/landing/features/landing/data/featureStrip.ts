import checkIconUrl from '@landing/assets/icons/feature-strip/check.svg';
import { registerAsset } from '@landing/assets';

registerAsset({
  id: 'icon-feature-strip-check',
  kind: 'icon',
  src: checkIconUrl,
  alt: '',
  format: 'svg',
  figmaNodeId: '55:11',
  width: 20,
  height: 20,
});

/** Feature Strip items — Figma Group 3221 (388:1766) */
export const FEATURE_STRIP_ITEMS = [
  {
    id: 'ai-bot-controls',
    label: 'AI Bot Controls',
    iconSrc: checkIconUrl,
    figmaNodeId: '55:10',
  },
  {
    id: 'technical-indicators',
    label: 'Technical Indicators',
    iconSrc: checkIconUrl,
    figmaNodeId: '55:14',
  },
  {
    id: 'binolla-trading',
    label: 'Binolla Trading Integration',
    iconSrc: checkIconUrl,
    figmaNodeId: '55:18',
  },
  {
    id: 'trade-tracking',
    label: 'Real-Time Trade Tracking',
    iconSrc: checkIconUrl,
    figmaNodeId: '55:22',
  },
  {
    id: 'activation-key',
    label: 'Activation Key Access',
    iconSrc: checkIconUrl,
    figmaNodeId: '55:26',
  },
] as const;

export const featureStripAssets = {
  check: checkIconUrl,
} as const;
