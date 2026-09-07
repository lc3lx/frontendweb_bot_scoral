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
import { CACHE_KEYS, fetchCached } from '@shared/api/dataCache';
import { t } from '@shared/i18n';
import type {
  DashboardMockData,
  DashboardTradeRow,
  TradePlTone,
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
    const result = await fetchCached(
      CACHE_KEYS.dashboardTrades,
      async () => {
        const pageSize = 100;
        const first = await tradesApi.list({ page: 1, pageSize });
        const totalPages = Math.min(5, Math.max(1, Math.ceil(first.total / pageSize)));

        // Pages 2..n used to be awaited one after another — up to four extra sequential
        // round trips before Home could render anything. They do not depend on each
        // other, so they go out together.
        const rest = await Promise.all(
          Array.from({ length: totalPages - 1 }, (_, i) =>
            tradesApi.list({ page: i + 2, pageSize }),
          ),
        );

        return {
          items: [...first.items, ...rest.flatMap((page) => page.items)],
          total: first.total,
        };
      },
      { freshMs: 2_000 },
    );
    return result.value;
  } catch {
    return null;
  }
}

/**
 * An empty Home payload: correct shape, no invented values.
 *
 * Every figure here is a placeholder the user can recognise as "not loaded" rather than
 * a plausible-looking number. Anything the API returns overwrites it; anything it does
 * not stays visibly blank.
 */
function blankDashboard(): DashboardMockData {
  const none = '—';
  return {
    balance: { value: none, growth: '', todayProfit: none, todayLoss: none, netToday: none },
    stats: {
      weekProfit: { value: none, secondary: '' },
      monthProfit: { value: none, secondary: '' },
      totalTrades: { value: none, secondary: '' },
      winRate: { value: none, secondary: '' },
    },
    performance: { value: none, activeTimeframe: 'today' },
    performanceTrades: [],
    botStatus: { pair: none, indicator: none, strategy: none, signal: none },
    alphaPro: { expiry: '' },
    trades: [],
  };
}

export const dashboardService = {
  async fetchData(): Promise<DashboardMockData> {
    // Start from a BLANK copy, never the mock values. This used to be
    // `structuredClone(dashboardMockData)`, so whenever a request failed the mock's
    // invented balances and trades stayed on screen looking like real data. Placeholders
    // are honest; fabricated numbers are not.
    const data = blankDashboard();

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
      // Blank baseline already shows placeholders — nothing to keep.
    }

    return data;
  },

  performanceSeries(trades: TradeDto[], timeframe: 'today' | '7d' | '30d' | 'all') {
    return bucketPerformance(trades, timeframe === 'today' ? 'today' : timeframe);
  },
};
