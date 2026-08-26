import iconDashboard from '@landing/assets/icons/features/user-dashboard.svg';
import iconBotEngine from '@landing/assets/icons/features/ai-bot-engine.svg';
import iconEmbeddedTrading from '@landing/assets/icons/features/embedded-trading.svg';
import iconTradeTracking from '@landing/assets/icons/features/trade-tracking.svg';
import { registerAsset } from '@landing/assets';

registerAsset({
  id: 'icon-features-user-dashboard',
  kind: 'icon',
  src: iconDashboard,
  alt: '',
  format: 'svg',
  figmaNodeId: '523:1842',
  width: 32,
  height: 32,
});

registerAsset({
  id: 'icon-features-ai-bot-engine',
  kind: 'icon',
  src: iconBotEngine,
  alt: '',
  format: 'svg',
  figmaNodeId: '523:1850',
  width: 32,
  height: 32,
});

registerAsset({
  id: 'icon-features-embedded-trading',
  kind: 'icon',
  src: iconEmbeddedTrading,
  alt: '',
  format: 'svg',
  figmaNodeId: '523:1862',
  width: 32,
  height: 32,
});

registerAsset({
  id: 'icon-features-trade-tracking',
  kind: 'icon',
  src: iconTradeTracking,
  alt: '',
  format: 'svg',
  figmaNodeId: '523:1875',
  width: 32,
  height: 32,
});

export const FEATURES_COPY = {
  eyebrow: 'Product overview',
  title: 'One interface for AI-powered trading control',
  description:
    'Manage your AI bot, trading view, performance, and live trade insights from one premium interface.',
} as const;

export const FEATURE_CARDS = [
  {
    id: 'user-dashboard',
    title: 'User Dashboard',
    description:
      'Track your balance, profits, losses, win rate, active trades, and bot status from one clear dashboard.',
    iconSrc: iconDashboard,
    figmaNodeId: '523:1841',
  },
  {
    id: 'ai-bot-engine',
    title: 'AI Bot Engine',
    description:
      'Choose market type, trading pair, technical indicator, strategy, amount, duration, profit target, and loss limit.',
    iconSrc: iconBotEngine,
    figmaNodeId: '523:1849',
  },
  {
    id: 'embedded-trading',
    title: 'Embedded Trading',
    description:
      'Trade through the integrated Binolla view while keeping Scar Alpha AI signals and bot insights accessible.',
    iconSrc: iconEmbeddedTrading,
    figmaNodeId: '523:1861',
  },
  {
    id: 'trade-tracking',
    title: 'Trade Tracking',
    description:
      'Follow live and completed trades with detailed results, strategies, indicators, and signal strength.',
    iconSrc: iconTradeTracking,
    figmaNodeId: '523:1874',
  },
] as const;

export const featuresAssets = {
  userDashboard: iconDashboard,
  aiBotEngine: iconBotEngine,
  embeddedTrading: iconEmbeddedTrading,
  tradeTracking: iconTradeTracking,
} as const;
