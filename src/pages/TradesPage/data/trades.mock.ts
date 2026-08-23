export type TradeSource = 'global' | 'binolla';
export type TradeDirection = 'up' | 'down';
export type TradeOutcome = 'profit' | 'loss' | 'running';
export type TradeFilterId = 'all' | 'live' | 'profit' | 'loss' | 'today';
export type TradeOrigin = 'bot' | 'manual' | 'user' | 'demo';

export type TradeCardData = {
  id: string;
  pair: string;
  time: string;
  source: TradeSource;
  direction: TradeDirection;
  outcome: TradeOutcome;
  pl: string;
  strategy: string;
  indicator: string;
  amount: string;
  tradeSource: TradeOrigin;
  runningTimer?: string;
  duration?: string;
  isToday: boolean;
};

export const TRADES_MOCK: TradeCardData[] = [
  {
    id: '1',
    pair: 'EUR/USD',
    time: '12:41',
    source: 'global',
    direction: 'up',
    outcome: 'profit',
    pl: '+$22.5',
    strategy: 'Alpha Momentum',
    indicator: 'MACD',
    amount: '$25',
    tradeSource: 'bot',
    isToday: true,
  },
  {
    id: '2',
    pair: 'USD/IDR OTC',
    time: '12:34',
    source: 'binolla',
    direction: 'up',
    outcome: 'profit',
    pl: '+$18.7',
    strategy: 'Alpha Momentum',
    indicator: 'RSI',
    amount: '$25',
    tradeSource: 'bot',
    isToday: true,
  },
  {
    id: '3',
    pair: 'GBP/JPY',
    time: '12:28',
    source: 'global',
    direction: 'up',
    outcome: 'profit',
    pl: '+$15.0',
    strategy: 'Scalper Pro',
    indicator: 'MACD',
    amount: '$50',
    tradeSource: 'manual',
    isToday: true,
  },
  {
    id: '4',
    pair: 'BTC/USD',
    time: '12:22',
    source: 'global',
    direction: 'down',
    outcome: 'loss',
    pl: '-$100',
    strategy: 'Scar Precision',
    indicator: 'Bollinger',
    amount: '$100',
    tradeSource: 'bot',
    duration: '5m',
    isToday: true,
  },
  {
    id: '5',
    pair: 'GBP/USD',
    time: '12:18',
    source: 'global',
    direction: 'up',
    outcome: 'running',
    pl: '—',
    strategy: 'Alpha Momentum',
    indicator: 'MACD',
    amount: '$25',
    tradeSource: 'bot',
    runningTimer: '00:24',
    duration: '3m',
    isToday: true,
  },
  {
    id: '6',
    pair: 'EUR/GBP',
    time: '12:11',
    source: 'global',
    direction: 'up',
    outcome: 'profit',
    pl: '+$12.5',
    strategy: 'Trend Rider',
    indicator: 'EMA',
    amount: '$25',
    tradeSource: 'bot',
    isToday: true,
  },
  {
    id: '7',
    pair: 'NZD/USD',
    time: '12:05',
    source: 'global',
    direction: 'down',
    outcome: 'profit',
    pl: '+$9.8',
    strategy: 'Alpha Momentum',
    indicator: 'RSI',
    amount: '$25',
    tradeSource: 'bot',
    isToday: true,
  },
  {
    id: '8',
    pair: 'USD/JPY OTC',
    time: '11:59',
    source: 'binolla',
    direction: 'down',
    outcome: 'loss',
    pl: '-$10',
    strategy: 'Scalper Pro',
    indicator: 'MACD',
    amount: '$10',
    tradeSource: 'manual',
    isToday: true,
  },
  {
    id: '9',
    pair: 'EUR/JPY',
    time: '09:15',
    source: 'global',
    direction: 'up',
    outcome: 'profit',
    pl: '+$31.2',
    strategy: 'Alpha Momentum',
    indicator: 'RSI',
    amount: '$50',
    tradeSource: 'bot',
    isToday: false,
  },
];

export function filterTrades(
  trades: TradeCardData[],
  filter: TradeFilterId,
): TradeCardData[] {
  switch (filter) {
    case 'live':
      return trades.filter((t) => t.outcome === 'running');
    case 'profit':
      return trades.filter((t) => t.outcome === 'profit');
    case 'loss':
      return trades.filter((t) => t.outcome === 'loss');
    case 'today':
      return trades.filter((t) => t.isToday);
    default:
      return trades;
  }
}
