export type EngineControlId = 'start' | 'pause' | 'stop' | 'apply';

export type AiBotMockData = {
  status: {
    name: string;
    engineLabel: string;
    signal: string;
    strength: string;
    updated: string;
  };
  performance: {
    totalBalance: string;
    todayPlus: string;
    todayMinus: string;
    net: string;
    active: string;
    winRate: string;
    trades: string;
  };
  configuration: {
    marketType: string;
    tradingPair: string;
    indicator: string;
    strategy: string;
  };
  targets: {
    profitTarget: string;
    lossLimit: string;
  };
};

export const AI_BOT_MOCK: AiBotMockData = {
  status: {
    name: 'Scar Alpha AI',
    engineLabel: 'Neural engine',
    signal: 'UP ↑',
    strength: '82%',
    updated: '2s ago',
  },
  performance: {
    totalBalance: '$4,821',
    todayPlus: '+$142',
    todayMinus: '-$44',
    net: '+$98',
    active: '3',
    winRate: '78%',
    trades: '24',
  },
  configuration: {
    marketType: 'Global Indicators',
    tradingPair: 'EUR/USD',
    indicator: 'Bollinger Bands',
    strategy: 'Alpha Momentum',
  },
  targets: {
    profitTarget: '+$50',
    lossLimit: '-$30',
  },
};

export const TRADE_AMOUNTS = ['$10', '$25', '$50', '$100'] as const;
export const TRADE_DURATIONS = ['30s', '1m', '3m', '5m', '15m', 'Custom'] as const;
