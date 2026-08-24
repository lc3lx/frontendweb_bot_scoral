import {
  binollaApi,
  botApi,
  marketApi,
  strategiesApi,
  tradesApi,
} from '@shared/api';
import { canBrowseMarket } from '@shared/access/webAccess';
import { MARKET_FETCH_MS, timedSignal } from '@shared/api/timedSignal';
import { getAccountStatusCached } from '@shared/api/botSessionCache';
import {
  formatMoneyPlain,
  formatSignedMoney,
  formatWinRate,
  weekAndMonthSummaries,
} from '@shared/trades/tradeAggregates';
import { t } from '@shared/i18n';
import { AI_BOT_MOCK, type AiBotMockData, type EngineControlId } from './aiBot.mock';

function formatSignal(signal: string): string {
  const s = signal.toLowerCase();
  if (s === 'call') return t('common.callUp');
  if (s === 'put') return t('common.putDown');
  return t('common.none');
}

export const aiBotService = {
  async fetchData(): Promise<AiBotMockData> {
    const data = structuredClone(AI_BOT_MOCK);

    try {
      const [status, balance, trades, bot, strategies] = await Promise.all([
        getAccountStatusCached().catch(() => null),
        binollaApi.balance(timedSignal(MARKET_FETCH_MS)).catch(() => null),
        tradesApi.list({ page: 1, pageSize: 100 }).catch(() => null),
        botApi.status().catch(() => null),
        strategiesApi.list().catch(() => null),
      ]);

      if (balance) {
        data.performance.totalBalance = formatMoneyPlain(balance.currentBalance);
      }

      if (trades) {
        const buckets = weekAndMonthSummaries(trades.items);
        data.performance.todayPlus =
          buckets.today.profit > 0 ? formatSignedMoney(buckets.today.profit) : '$0';
        data.performance.todayMinus =
          buckets.today.lossAbs > 0 ? formatSignedMoney(-buckets.today.lossAbs) : '$0';
        data.performance.net = formatSignedMoney(buckets.today.net);
        data.performance.active = String(buckets.all.active);
        data.performance.winRate = formatWinRate(buckets.all.wins, buckets.all.settled);
        data.performance.trades = String(trades.total);
      }

      const asset = bot?.asset ?? bot?.assets?.[0] ?? '';
      if (asset && canBrowseMarket(status?.botAccess)) {
        const rsi = await strategiesApi
          .rsiSignal(asset, 60, timedSignal(MARKET_FETCH_MS))
          .catch(() => null);
        if (rsi) {
          data.status.signal = formatSignal(rsi.signal);
          data.status.strength = Number(rsi.liveRsi ?? rsi.rsi).toFixed(2);
          data.status.updated = new Date(rsi.candleTime).toLocaleTimeString('en-GB', {
            hour12: false,
          });
        }
      }

      if (bot) {
        data.status.engineLabel = bot.state;
        data.configuration.tradingPair = bot.asset || bot.assets?.join(', ') || '—';
        data.configuration.strategy =
          strategies?.strategies.find((s) => s.id === bot.strategyId)?.name ??
          bot.strategyId?.toUpperCase() ??
          'RSI';
        data.targets.profitTarget = `+$${bot.dailyProfitTarget}`;
        data.targets.lossLimit = `-$${bot.dailyLossLimit}`;
      }
    } catch {
      /* defaults */
    }

    return data;
  },

  async applyControl(control: EngineControlId, config?: {
    pairs?: string[];
    amount?: number;
    durationSeconds?: number;
    profitTarget?: number;
    lossLimit?: number;
  }): Promise<void> {
    const amount = config?.amount ?? 25;
    const durationSeconds = config?.durationSeconds ?? 300;
    const pairs = config?.pairs?.length ? config.pairs : ['EURUSD_otc'];
    const profitTarget = config?.profitTarget ?? 50;
    const lossLimit = config?.lossLimit ?? 30;

    if (control === 'start') {
      await botApi.start(pairs, amount, durationSeconds, profitTarget, lossLimit, {
        strategyId: 'rsi',
      });
      return;
    }
    if (control === 'pause') {
      await botApi.pause();
      return;
    }
    if (control === 'stop') {
      await botApi.stop();
      return;
    }
    if (control === 'apply') {
      await botApi.apply({
        asset: pairs[0],
        assets: pairs,
        amount,
        durationSeconds,
        dailyProfitTarget: profitTarget,
        dailyLossLimit: lossLimit,
        strategyId: 'rsi',
      });
    }
  },

  async listPairs() {
    const assets = await marketApi.assets(timedSignal(MARKET_FETCH_MS)).catch(() => null);
    return assets?.assets ?? [];
  },
};
