import { TRADES_MOCK, type TradeCardData } from '@pages/TradesPage/data/trades.mock';
import { tradingMockData } from '@pages/TradingPage/data/trading.mock';

export type TradeTimelineEventId =
  | 'signalDetected'
  | 'tradeOpened'
  | 'tradeClosed'
  | 'resultCalculated';

export type TradeTimelineEvent = {
  id: TradeTimelineEventId;
  time: string;
};

export type TradeDetailChart = {
  candles: typeof tradingMockData.candles;
  yAxis: string[];
  xAxis: string[];
  currentPrice: string;
};

export type TradeDetailData = {
  trade: TradeCardData;
  tradeRef: string;
  entryTime: string;
  exitTime?: string;
  signalStrength: string;
  duration: string;
  timeline: TradeTimelineEvent[];
  chart: TradeDetailChart;
};

type TradeDetailSeed = Omit<TradeDetailData, 'trade'>;

const DEFAULT_CHART: TradeDetailChart = {
  candles: tradingMockData.candles,
  yAxis: tradingMockData.yAxis,
  xAxis: tradingMockData.xAxis,
  currentPrice: tradingMockData.currentPrice,
};

const COMPLETED_TIMELINE: TradeTimelineEvent[] = [
  { id: 'signalDetected', time: '12:40:58' },
  { id: 'tradeOpened', time: '12:41:02' },
  { id: 'tradeClosed', time: '12:42:02' },
  { id: 'resultCalculated', time: '12:42:03' },
];

const RUNNING_TIMELINE: TradeTimelineEvent[] = [
  { id: 'signalDetected', time: '12:17:54' },
  { id: 'tradeOpened', time: '12:18:00' },
];

const DETAIL_SEEDS: Record<string, TradeDetailSeed> = {
  '1': {
    tradeRef: 'T-2418 · Global',
    entryTime: '12:41:02',
    exitTime: '12:42:02',
    signalStrength: '82%',
    duration: '1m',
    timeline: COMPLETED_TIMELINE,
    chart: DEFAULT_CHART,
  },
  '4': {
    tradeRef: 'T-2416 · Global',
    entryTime: '12:41:02',
    exitTime: '12:46:02',
    signalStrength: '82%',
    duration: '5m',
    timeline: COMPLETED_TIMELINE,
    chart: DEFAULT_CHART,
  },
  '5': {
    tradeRef: 'T-2419 · Global',
    entryTime: '12:18:00',
    signalStrength: '78%',
    duration: '3m',
    timeline: RUNNING_TIMELINE,
    chart: DEFAULT_CHART,
  },
};

function buildDefaultDetail(trade: TradeCardData): TradeDetailSeed {
  const isRunning = trade.outcome === 'running';

  return {
    tradeRef: `T-24${trade.id.padStart(2, '0')} · ${trade.source === 'binolla' ? 'Binolla' : 'Global'}`,
    entryTime: `${trade.time}:02`,
    exitTime: isRunning ? undefined : `${trade.time}:32`,
    signalStrength: '82%',
    duration: trade.duration ?? '1m',
    timeline: isRunning ? RUNNING_TIMELINE : COMPLETED_TIMELINE,
    chart: DEFAULT_CHART,
  };
}

export function getTradeById(tradeId: string): TradeCardData | undefined {
  return TRADES_MOCK.find((trade) => trade.id === tradeId);
}

export function getTradeDetail(tradeId: string): TradeDetailData | null {
  const trade = getTradeById(tradeId);
  if (!trade) return null;

  const seed = DETAIL_SEEDS[tradeId] ?? buildDefaultDetail(trade);

  return {
    trade,
    ...seed,
  };
}
