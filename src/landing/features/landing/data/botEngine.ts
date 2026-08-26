import iconDuration from '@landing/assets/icons/bot-engine/duration.svg';
import iconDailyProfit from '@landing/assets/icons/bot-engine/daily-profit.svg';
import iconStrategy from '@landing/assets/icons/bot-engine/strategy.svg';
import iconMarketType from '@landing/assets/icons/bot-engine/market-type.svg';
import iconDailyLoss from '@landing/assets/icons/bot-engine/daily-loss.svg';
import iconSignalStrength from '@landing/assets/icons/bot-engine/signal-strength.svg';
import iconTradingPair from '@landing/assets/icons/bot-engine/trading-pair.svg';
import iconTechnicalIndicator from '@landing/assets/icons/bot-engine/technical-indicator.svg';
import iconBotStatus from '@landing/assets/icons/bot-engine/bot-status.svg';
import { registerAsset } from '@landing/assets';

registerAsset({
  id: 'icon-bot-engine-duration',
  kind: 'icon',
  src: iconDuration,
  alt: '',
  format: 'svg',
  figmaNodeId: '639:162',
  width: 65,
  height: 65,
});

registerAsset({
  id: 'icon-bot-engine-daily-profit',
  kind: 'icon',
  src: iconDailyProfit,
  alt: '',
  format: 'svg',
  figmaNodeId: '639:164',
  width: 65,
  height: 65,
});

registerAsset({
  id: 'icon-bot-engine-strategy',
  kind: 'icon',
  src: iconStrategy,
  alt: '',
  format: 'svg',
  figmaNodeId: '639:166',
  width: 65,
  height: 65,
});

registerAsset({
  id: 'icon-bot-engine-market-type',
  kind: 'icon',
  src: iconMarketType,
  alt: '',
  format: 'svg',
  figmaNodeId: '639:168',
  width: 59,
  height: 66,
});

registerAsset({
  id: 'icon-bot-engine-daily-loss',
  kind: 'icon',
  src: iconDailyLoss,
  alt: '',
  format: 'svg',
  figmaNodeId: '643:504',
  width: 67,
  height: 40,
});

registerAsset({
  id: 'icon-bot-engine-signal-strength',
  kind: 'icon',
  src: iconSignalStrength,
  alt: '',
  format: 'svg',
  figmaNodeId: '639:174',
  width: 61,
  height: 53,
});

registerAsset({
  id: 'icon-bot-engine-trading-pair',
  kind: 'icon',
  src: iconTradingPair,
  alt: '',
  format: 'svg',
  figmaNodeId: '639:176',
  width: 65,
  height: 65,
});

registerAsset({
  id: 'icon-bot-engine-technical-indicator',
  kind: 'icon',
  src: iconTechnicalIndicator,
  alt: '',
  format: 'svg',
  figmaNodeId: '639:178',
  width: 52,
  height: 65,
});

registerAsset({
  id: 'icon-bot-engine-bot-status',
  kind: 'icon',
  src: iconBotStatus,
  alt: '',
  format: 'svg',
  figmaNodeId: '639:180',
  width: 65,
  height: 65,
});

export type BotEngineCard = {
  id: string;
  icon: string;
  figmaNodeId: string;
  iconWidth: number;
  iconHeight: number;
  iconOffsetX: number;
  iconOffsetY: number;
};

/**
 * Desktop 3×3 order matches Figma columns 524:1949 / 524:1948 / 524:1947.
 * Vector icons sit inside the 85×85 plate (offsets = icon x/y − plate x/y).
 */
export const BOT_ENGINE_CARDS: readonly BotEngineCard[] = [
  {
    id: 'duration',
    icon: iconDuration,
    figmaNodeId: '488:89',
    iconWidth: 65,
    iconHeight: 65,
    iconOffsetX: 10,
    iconOffsetY: 10,
  },
  {
    id: 'market-type',
    icon: iconMarketType,
    figmaNodeId: '55:172',
    iconWidth: 59,
    iconHeight: 66,
    iconOffsetX: 13,
    iconOffsetY: 10,
  },
  {
    id: 'trading-pair',
    icon: iconTradingPair,
    figmaNodeId: '488:17',
    iconWidth: 65,
    iconHeight: 65,
    iconOffsetX: 10,
    iconOffsetY: 10,
  },
  {
    id: 'daily-profit-target',
    icon: iconDailyProfit,
    figmaNodeId: '488:97',
    iconWidth: 65,
    iconHeight: 65,
    iconOffsetX: 10,
    iconOffsetY: 9,
  },
  {
    id: 'daily-loss-limit',
    icon: iconDailyLoss,
    figmaNodeId: '488:105',
    iconWidth: 67,
    iconHeight: 40,
    iconOffsetX: 9,
    iconOffsetY: 23,
  },
  {
    id: 'technical-indicator',
    icon: iconTechnicalIndicator,
    figmaNodeId: '488:25',
    iconWidth: 52,
    iconHeight: 65,
    iconOffsetX: 17,
    iconOffsetY: 10,
  },
  {
    id: 'strategy',
    icon: iconStrategy,
    figmaNodeId: '488:33',
    iconWidth: 65,
    iconHeight: 65,
    iconOffsetX: 10,
    iconOffsetY: 10,
  },
  {
    id: 'signal-strength',
    icon: iconSignalStrength,
    figmaNodeId: '488:113',
    iconWidth: 61,
    iconHeight: 53,
    iconOffsetX: 12,
    iconOffsetY: 16,
  },
  {
    id: 'current-bot-status',
    icon: iconBotStatus,
    figmaNodeId: '488:121',
    iconWidth: 65,
    iconHeight: 65,
    iconOffsetX: 10,
    iconOffsetY: 10,
  },
] as const;
