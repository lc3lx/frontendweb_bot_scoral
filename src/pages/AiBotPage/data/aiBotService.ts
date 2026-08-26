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
import {
  filterFxCurrencyAssets,
  isPreferredMarketSymbol,
} from '@shared/market/preferAsset';
import {
  formatPairLabel,
  pairTypeFromSymbol,
  parseFxPair,
} from '@shared/market/pairDisplay';
import { t } from '@shared/i18n';
import {
  AI_BOT_MOCK,
  type AiBotMockData,
  type BotRunState,
  type EngineControlId,
} from './aiBot.mock';
import {
  BRANDED_STRATEGY_OPTIONS,
  isBrandedStrategyId,
  type BrandedStrategyId,
} from '../modals/aiBotModals.data';

function formatSignal(signal: string): string {
  const s = signal.toLowerCase();
  if (s === 'call') return t('common.callUp');
  if (s === 'put') return t('common.putDown');
  return t('common.none');
}

function signalSide(signal: string): 'up' | 'down' | 'none' {
  const s = signal.toLowerCase();
  if (s === 'call') return 'up';
  if (s === 'put') return 'down';
  return 'none';
}

function mapBotState(state: string | undefined): BotRunState {
  const s = (state ?? '').toLowerCase();
  if (s === 'running') return 'running';
  if (s === 'paused') return 'paused';
  return 'stopped';
}

function parseMoney(label: string | undefined, fallback: number): number {
  if (!label) return fallback;
  const n = Number.parseFloat(label.replace(/[^\d.-]/g, ''));
  return Number.isFinite(n) ? Math.abs(n) : fallback;
}

function mapStakeModeLabel(stakeMode: string | null | undefined): string | null {
  if (!isBrandedStrategyId(stakeMode)) return null;
  const option = BRANDED_STRATEGY_OPTIONS.find((item) => item.id === stakeMode);
  if (!option) return null;
  return t(`aiBot.modals.brandedStrategy.${option.titleKey}`);
}

export const aiBotService = {
  async fetchData(preferredAsset?: string | null): Promise<AiBotMockData> {
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

      const strategyName =
        strategies?.strategies.find((s) => s.id === (bot?.strategyId ?? 'rsi'))?.name ??
        bot?.strategyId?.toUpperCase() ??
        t('common.rsi');

      if (bot) {
        data.status.botState = mapBotState(bot.state);
        data.status.engineLabel = bot.state;
        data.configuration.tradingPair = bot.asset || bot.assets?.join(', ') || '—';
        data.configuration.strategy = strategyName;
        data.targets.profitTarget = `+$${bot.dailyProfitTarget}`;
        data.targets.lossLimit = `-$${bot.dailyLossLimit}`;
        data.status.strategy = strategyName;
        const indicatorLabel = mapStakeModeLabel(bot.stakeMode);
        if (indicatorLabel) {
          data.status.indicator = indicatorLabel;
          data.configuration.indicator = indicatorLabel;
        }
      }

      const asset =
        (bot?.asset ?? bot?.assets?.[0] ?? preferredAsset ?? '').trim() || null;

      if (asset) {
        data.status.market = asset;
        if (!bot?.asset && !bot?.assets?.[0]) {
          data.configuration.tradingPair = preferredAsset ?? asset;
        }
      }

      if (asset && canBrowseMarket(status?.botAccess)) {
        const rsi = await strategiesApi
          .rsiSignal(asset, 60, timedSignal(MARKET_FETCH_MS))
          .catch(() => null);
        if (rsi) {
          data.status.signal = formatSignal(rsi.signal);
          data.status.signalSide = signalSide(rsi.signal);
          data.status.strength = Number(rsi.liveRsi ?? rsi.rsi).toFixed(2);
          const candleMs = Date.parse(rsi.candleTime);
          data.status.updated = Number.isFinite(candleMs)
            ? new Date(candleMs).toLocaleTimeString('en-GB', { hour12: false })
            : new Date().toLocaleTimeString('en-GB', { hour12: false });
          data.status.freshSeconds = Number.isFinite(candleMs)
            ? Math.max(0, Math.floor((Date.now() - candleMs) / 1000))
            : 0;
          data.status.indicator = t('common.rsi');
          data.status.strategy = strategyName;
          data.status.market = rsi.asset || asset;
        }
      }
    } catch {
      /* defaults */
    }

    return data;
  },

  async applyControl(
    control: EngineControlId,
    config?: {
      pairs?: string[];
      amount?: number;
      durationSeconds?: number;
      profitTarget?: number;
      lossLimit?: number;
      stakeMode?: BrandedStrategyId;
      strategyId?: string;
    },
  ): Promise<void> {
    const amount = config?.amount ?? 25;
    const durationSeconds = config?.durationSeconds ?? 60;
    const pairs = config?.pairs?.length ? config.pairs : ['EURUSD_otc'];
    const profitTarget = config?.profitTarget ?? 50;
    const lossLimit = config?.lossLimit ?? 30;
    const stakeMode = config?.stakeMode ?? 'red-signal-pro';
    const strategyId = config?.strategyId ?? 'rsi';
    const preferences = { strategyId, stakeMode };

    if (control === 'start') {
      await botApi.start(pairs, amount, durationSeconds, profitTarget, lossLimit, preferences);
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
        ...preferences,
      });
    }
  },

  parseAmount(label: string): number {
    return parseMoney(label, 25);
  },

  parseTargetAbs(label: string, fallback: number): number {
    return parseMoney(label, fallback);
  },

  async listTradingPairs() {
    const assets = await marketApi.assets(timedSignal(MARKET_FETCH_MS)).catch(() => null);
    if (!assets?.assets?.length) return [];

    const fxAssets = filterFxCurrencyAssets(assets.assets);
    return fxAssets
      .map((asset) => {
        const parsed = parseFxPair(asset.symbol);
        return {
          id: asset.symbol,
          label: formatPairLabel(asset.symbol, asset.name),
          type: pairTypeFromSymbol(asset.symbol),
          base: parsed?.base ?? '',
          quote: parsed?.quote ?? '',
          available: asset.available,
        };
      })
      .sort((a, b) => {
        const aPreferred = isPreferredMarketSymbol(a.id) ? 0 : 1;
        const bPreferred = isPreferredMarketSymbol(b.id) ? 0 : 1;
        if (aPreferred !== bPreferred) return aPreferred - bPreferred;
        return a.label.localeCompare(b.label);
      });
  },

  async fetchBotRuntime() {
    return botApi.status().catch(() => null);
  },
};
