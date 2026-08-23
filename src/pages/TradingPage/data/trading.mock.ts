export type TradingCandle = {
  open: number;
  close: number;
  high: number;
  low: number;
};

export type TradingMockData = {
  pair: string;
  pairType: string;
  price: string;
  change: string;
  expiry: string;
  balance: string;
  amount: string;
  duration: string;
  currentPrice: string;
  yAxis: string[];
  xAxis: string[];
  candles: TradingCandle[];
  signal: {
    lastSignal: string;
    strength: string;
    indicator: string;
    strategy: string;
    market: string;
    freshSeconds: number;
  };
};

export const tradingMockData: TradingMockData = {
  pair: 'EUR/USD',
  pairType: 'OTC',
  price: '1.08423',
  change: '+0.12%',
  expiry: '00:43',
  balance: '$4,821.44',
  amount: '25',
  duration: '1 min',
  currentPrice: '1.0847',
  yAxis: ['1.0872', '1.0855', '1.0838', '1.0821', '1.0804'],
  xAxis: ['09:00', '10:00', '11:00', '12:00', 'Now'],
  candles: [
    { open: 1.0825, close: 1.0832, high: 1.0836, low: 1.0821 },
    { open: 1.0832, close: 1.0828, high: 1.0838, low: 1.0824 },
    { open: 1.0828, close: 1.0835, high: 1.084, low: 1.0826 },
    { open: 1.0835, close: 1.0831, high: 1.0842, low: 1.0829 },
    { open: 1.0831, close: 1.0838, high: 1.0841, low: 1.0828 },
    { open: 1.0838, close: 1.0834, high: 1.0843, low: 1.083 },
    { open: 1.0834, close: 1.084, high: 1.0844, low: 1.0832 },
    { open: 1.084, close: 1.0836, high: 1.0846, low: 1.0833 },
    { open: 1.0836, close: 1.0842, high: 1.0848, low: 1.0834 },
    { open: 1.0842, close: 1.0839, high: 1.0849, low: 1.0837 },
    { open: 1.0839, close: 1.0845, high: 1.085, low: 1.0836 },
    { open: 1.0845, close: 1.0841, high: 1.0852, low: 1.0838 },
    { open: 1.0841, close: 1.0847, high: 1.0851, low: 1.0839 },
    { open: 1.0847, close: 1.0843, high: 1.0853, low: 1.084 },
    { open: 1.0843, close: 1.0849, high: 1.0854, low: 1.0841 },
    { open: 1.0849, close: 1.0845, high: 1.0855, low: 1.0842 },
    { open: 1.0845, close: 1.0851, high: 1.0856, low: 1.0843 },
    { open: 1.0851, close: 1.0847, high: 1.0858, low: 1.0845 },
    { open: 1.0847, close: 1.0853, high: 1.0859, low: 1.0844 },
    { open: 1.0853, close: 1.0848, high: 1.086, low: 1.0846 },
  ],
  signal: {
    lastSignal: 'UP ↑',
    strength: '82%',
    indicator: 'Bollinger',
    strategy: 'Alpha Momentum',
    market: 'Binolla Market',
    freshSeconds: 4,
  },
};
