import iconLive from '@landing/assets/icons/trade-tracking/live-trades.svg';
import iconCompleted from '@landing/assets/icons/trade-tracking/completed-trades.svg';
import iconProfitLoss from '@landing/assets/icons/trade-tracking/profit-loss.svg';
import iconTimeline from '@landing/assets/icons/trade-tracking/timeline.svg';
import { registerAsset } from '@landing/assets';

registerAsset({
  id: 'icon-trade-tracking-live',
  kind: 'icon',
  src: iconLive,
  alt: '',
  format: 'svg',
  figmaNodeId: '55:324',
  width: 29,
  height: 29,
});

registerAsset({
  id: 'icon-trade-tracking-completed',
  kind: 'icon',
  src: iconCompleted,
  alt: '',
  format: 'svg',
  figmaNodeId: '55:334',
  width: 29,
  height: 29,
});

registerAsset({
  id: 'icon-trade-tracking-profit-loss',
  kind: 'icon',
  src: iconProfitLoss,
  alt: '',
  format: 'svg',
  figmaNodeId: '55:344',
  width: 29,
  height: 29,
});

registerAsset({
  id: 'icon-trade-tracking-timeline',
  kind: 'icon',
  src: iconTimeline,
  alt: '',
  format: 'svg',
  figmaNodeId: '55:354',
  width: 29,
  height: 29,
});

export const TRADE_TRACKING_COPY = {
  eyebrow: 'Trade tracking',
  title: 'Live and completed trades, clearly labeled',
} as const;

export type TradeTrackingCard = {
  id: string;
  title: string;
  description: string;
  iconSrc: string;
  figmaNodeId: string;
};

/** Four cards — Figma 55:323 / 55:333 / 55:343 / 55:353 */
export const TRADE_TRACKING_CARDS: readonly TradeTrackingCard[] = [
  {
    id: 'live-trades',
    title: 'Live Trades',
    description:
      'Demo preview with signal strength, strategy used, indicator used, market type, and result context.',
    iconSrc: iconLive,
    figmaNodeId: '55:323',
  },
  {
    id: 'completed-trades',
    title: 'Completed Trades',
    description:
      'Demo preview with signal strength, strategy used, indicator used, market type, and result context.',
    iconSrc: iconCompleted,
    figmaNodeId: '55:333',
  },
  {
    id: 'profit-loss',
    title: 'Profit / Loss Results',
    description:
      'Demo preview with signal strength, strategy used, indicator used, market type, and result context.',
    iconSrc: iconProfitLoss,
    figmaNodeId: '55:343',
  },
  {
    id: 'timeline',
    title: 'Trade Details Timeline',
    description:
      'Demo preview with signal strength, strategy used, indicator used, market type, and result context.',
    iconSrc: iconTimeline,
    figmaNodeId: '55:353',
  },
] as const;
