import {
  bucketPerformance,
  formatMoneyPlain,
  formatSignedMoney,
  formatWinRate,
  weekAndMonthSummaries,
} from '@shared/trades/tradeAggregates';
import { binollaApi, botApi, tradesApi } from '@shared/api';
import type { TradeDto } from '@shared/api';
import { MARKET_FETCH_MS, timedSignal } from '@shared/api/timedSignal';
import { getAccountStatusCached } from '@shared/api/botSessionCache';
import { t } from '@shared/i18n';
import {
  dashboardMockData,
  type DashboardMockData,
  type DashboardTradeRow,
  type TradePlTone,
} from '@pages/DashboardPage/data/dashboard.mock';

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function plTone(trade: TradeDto): TradePlTone {
  const s = trade.status.toLowerCase();
  if (s === 'running' || s === 'pending') return 'running';
  if (trade.pnl != null && trade.pnl >= 0) return 'profit';
  if (trade.pnl != null && trade.pnl < 0) return 'loss';
  return s === 'profit' || s === 'tie' ? 'profit' : 'loss';
}

function mapTrade(trade: TradeDto): DashboardTradeRow {
  const tone = plTone(trade);
  const pl =
    trade.pnl == null
      ? trade.status
      : `${trade.pnl >= 0 ? '+' : ''}$${Math.abs(trade.pnl).toFixed(2)}`;
  return {
    id: trade.id,
    pair: trade.asset,
    strategy: `${trade.strategyId?.toUpperCase() ?? 'RSI'} · ${trade.direction}`,
    time: formatTime(trade.createdAt),
    amount: `$${trade.amount.toFixed(2)}`,
    pl,
    plTone: tone,
    pairIcon: trade.asset.toLowerCase().includes('btc') ? 'crypto' : 'forex',
  };
}

async function fetchTrades(): Promise<{ items: TradeDto[]; total: number } | null> {
  try {
    const pageSize = 100;
    const first = await tradesApi.list({ page: 1, pageSize });
    const items = [...first.items];
    const totalPages = Math.min(5, Math.max(1, Math.ceil(first.total / pageSize)));
    for (let page = 2; page <= totalPages; page += 1) {
      const next = await tradesApi.list({ page, pageSize });
      items.push(...next.items);
    }
    return { items, total: first.total };
  } catch {
    return null;
  }
}

export const dashboardService = {
  async fetchData(): Promise<DashboardMockData> {
    const data = structuredClone(dashboardMockData);

    try {
      const [status, balance, trades, bot] = await Promise.all([
        getAccountStatusCached().catch(() => null),
        binollaApi.balance(timedSignal(MARKET_FETCH_MS)).catch(() => null),
        fetchTrades(),
        botApi.status().catch(() => null),
      ]);

      if (balance) {
        data.balance.value = formatMoneyPlain(balance.currentBalance);
      } else {
        data.balance.value = '—';
      }

      if (trades) {
        const buckets = weekAndMonthSummaries(trades.items);
        data.balance.todayProfit =
          buckets.today.profit > 0 ? formatSignedMoney(buckets.today.profit) : '$0.00';
        data.balance.todayLoss =
          buckets.today.lossAbs > 0 ? formatSignedMoney(-buckets.today.lossAbs) : '$0.00';
        data.balance.netToday = formatSignedMoney(buckets.today.net);
        data.stats.weekProfit = {
          value: formatSignedMoney(buckets.week.net),
          secondary: `${buckets.week.count} trades`,
        };
        data.stats.monthProfit = {
          value: formatSignedMoney(buckets.month.net),
          secondary: `${buckets.month.count} trades`,
        };
        data.stats.totalTrades = {
          value: String(trades.total),
          secondary: `${buckets.today.count} today`,
        };
        data.stats.winRate = {
          value: formatWinRate(buckets.all.wins, buckets.all.settled),
          secondary: `${buckets.all.settled} settled`,
        };
        data.performance.value = formatSignedMoney(buckets.today.net);
        data.performanceTrades = trades.items;
        data.trades = trades.items.slice(0, 5).map(mapTrade);
      }

      if (bot) {
        data.botStatus.pair = bot.asset || bot.assets?.[0] || '—';
        data.botStatus.strategy = bot.strategyId?.toUpperCase() ?? 'RSI';
        data.botStatus.signal = bot.state;
      }

      if (status?.botAccess === 'AdminApprovalRequired') {
        data.balance.growth = t('dashboard.waitingApproval');
      } else if (status?.adminApproved) {
        data.balance.growth = t('dashboard.adminApproved');
      }
    } catch {
      /* keep defaults */
    }

    return data;
  },

  performanceSeries(trades: TradeDto[], timeframe: 'today' | '7d' | '30d' | 'all') {
    return bucketPerformance(trades, timeframe === 'today' ? 'today' : timeframe);
  },
};
