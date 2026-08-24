import { tradeService } from '@services/trades';
import { mapTradeToCard } from '@pages/TradesPage/data/tradesService';
import type { TradeDetailData } from './tradeDetail.mock';
import { tradingMockData } from '@pages/TradingPage/data/trading.mock';

function mapTimeline(id: string): TradeDetailData['timeline'][number]['id'] {
  if (id.includes('signal')) return 'signalDetected';
  if (id.includes('opened')) return 'tradeOpened';
  if (id.includes('closed')) return 'tradeClosed';
  return 'resultCalculated';
}

export async function fetchTradeDetail(tradeId: string): Promise<TradeDetailData | null> {
  const record = await tradeService.getTradeById(tradeId);
  if (!record) return null;

  const detail = await tradeService.getTradeDetail(tradeId);
  const trade = mapTradeToCard(record);

  return {
    trade,
    tradeRef: detail?.hero.tradeRef ?? trade.id.slice(0, 8),
    entryTime: record.entryTime ?? record.timeLabel,
    exitTime: record.exitTime,
    signalStrength: record.signalStrength,
    duration: record.duration,
    timeline:
      detail?.timeline.map((entry) => ({
        id: mapTimeline(entry.id),
        time: entry.timestamp,
      })) ?? [],
    chart: {
      candles: record.candleData.length
        ? record.candleData
        : tradingMockData.candles,
      yAxis: tradingMockData.yAxis,
      xAxis: tradingMockData.xAxis,
      currentPrice: tradingMockData.currentPrice,
    },
  };
}
