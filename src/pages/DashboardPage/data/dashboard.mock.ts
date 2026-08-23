export type TradePlTone = 'profit' | 'loss' | 'running';

export type DashboardTradeRow = {
  id: string;
  pair: string;
  strategy: string;
  time: string;
  amount: string;
  pl: string;
  plTone: TradePlTone;
  pairIcon: 'forex' | 'crypto';
};

export type DashboardMockData = {
  balance: {
    value: string;
    growth: string;
    todayProfit: string;
    todayLoss: string;
    netToday: string;
  };
  stats: {
    weekProfit: { value: string; secondary: string };
    monthProfit: { value: string; secondary: string };
    totalTrades: { value: string; secondary: string };
    winRate: { value: string; secondary: string };
  };
  performance: {
    value: string;
    activeTimeframe: 'today' | '7d' | '30d' | 'all';
  };
  botStatus: {
    pair: string;
    indicator: string;
    strategy: string;
    signal: string;
  };
  alphaPro: {
    expiry: string;
  };
  trades: DashboardTradeRow[];
};

export const dashboardMockData: DashboardMockData = {
  balance: {
    value: '$4,821.44',
    growth: '+8.4%',
    todayProfit: '+$142.20',
    todayLoss: '-$44.00',
    netToday: '+$98.20',
  },
  stats: {
    weekProfit: { value: '+$482.10', secondary: '↑ vs last week' },
    monthProfit: { value: '+$1,824', secondary: '14 days remaining' },
    totalTrades: { value: '1,248', secondary: '82 today' },
    winRate: { value: '78.4%', secondary: '↑ 2.1% today' },
  },
  performance: {
    value: '+$1,824.60',
    activeTimeframe: 'today',
  },
  botStatus: {
    pair: 'EUR/USD',
    indicator: 'MACD',
    strategy: 'Alpha Momentum',
    signal: '82% ↑',
  },
  alphaPro: {
    expiry: '30 days left · Aug 3, 2026',
  },
  trades: [
    {
      id: '1',
      pair: 'EUR/USD',
      strategy: 'MACD · Alpha Momentum',
      time: '12:41',
      amount: '$25.00',
      pl: '+$22.50',
      plTone: 'profit',
      pairIcon: 'forex',
    },
    {
      id: '2',
      pair: 'USD/IDR OTC',
      strategy: 'RSI · OTC Hunter',
      time: '12:34',
      amount: '$50.00',
      pl: '+$45.00',
      plTone: 'profit',
      pairIcon: 'forex',
    },
    {
      id: '3',
      pair: 'BTC/USD',
      strategy: 'Bollinger · Scar Precision',
      time: '12:22',
      amount: '$100.00',
      pl: '-$100.00',
      plTone: 'loss',
      pairIcon: 'crypto',
    },
    {
      id: '4',
      pair: 'GBP/USD',
      strategy: 'MACD · Alpha Momentum',
      time: '12:18',
      amount: '$25.00',
      pl: 'Running',
      plTone: 'running',
      pairIcon: 'forex',
    },
    {
      id: '5',
      pair: 'USD/JPY',
      strategy: 'MA · Trend Breaker',
      time: '12:02',
      amount: '$50.00',
      pl: '+$44.00',
      plTone: 'profit',
      pairIcon: 'crypto',
    },
  ],
};
