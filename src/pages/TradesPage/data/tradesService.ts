import { tradeService } from '@services/trades';
import type { TradeRecord } from '@services/trades/types';
import type { TradeCardData, TradeFilterId, TradeOrigin, TradeOutcome, TradeSource } from '@pages/TradesPage/data/trades.mock';

function mapOutcome(status: TradeRecord['status']): TradeOutcome {
  if (status === 'running') return 'running';
  if (status === 'profit') return 'profit';
  return 'loss';
}

function mapOrigin(source: TradeRecord['source']): TradeOrigin {
  if (source === 'bot') return 'bot';
  if (source === 'user') return 'user';
  return 'manual';
}

export function mapTradeToCard(trade: TradeRecord): TradeCardData {
  return {
    id: trade.id,
    pair: trade.pair,
    time: trade.timeLabel,
    source: 'binolla' as TradeSource,
    direction: trade.direction,
    outcome: mapOutcome(trade.status),
    pl: trade.result ?? '—',
    strategy: trade.strategy,
    indicator: trade.indicator,
    amount: trade.stakeLabel,
    tradeSource: mapOrigin(trade.source),
    runningTimer:
      trade.liveTimerSeconds != null ? `${trade.liveTimerSeconds}s` : undefined,
    duration: trade.duration,
    isToday: trade.isToday,
  };
}

export const tradesPageService = {
  async list(filter: TradeFilterId): Promise<TradeCardData[]> {
    const result = await tradeService.listTrades({ filter, page: 1, pageSize: 50 });
    return result.items.map(mapTradeToCard);
  },

  async getDetail(tradeId: string) {
    return tradeService.getTradeDetail(tradeId);
  },
};
