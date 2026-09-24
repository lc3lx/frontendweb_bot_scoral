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
  formatSelectedPairsLabel,
  pairTypeFromSymbol,
  parseFxPair,
} from '@shared/market/pairDisplay';
import { isTradablePairPayout } from '@shared/market/pairPayout';
import { t } from '@shared/i18n';
import {
  AI_BOT_MOCK,
  type AiBotMockData,
  type BotRunState,
  type EngineControlId,
} from './aiBot.mock';
import {
  BRANDED_STRATEGY_OPTIONS,
  getStrategyPresentation,
  isBrandedStrategyId,
  type BrandedStrategyId,
  type StrategyGridOption,
} from '../modals/aiBotModals.data';
import type { BotSettingsState } from '../modals/BotSettingsModal';
import type { StrategyDto, StrategySignalResponse } from '@shared/api/types';

const RUNNABLE_STRATEGY_IDS = new Set(['rsi', 'ema', 'smart', 'alt5', 'time_analysis']);

function resolveStrategyId(strategyId?: string | null): string {
  const id = strategyId?.trim().toLowerCase();
  if (id && RUNNABLE_STRATEGY_IDS.has(id)) return id;
  return 'rsi';
}

function mapRiskLevel(level: BotSettingsState['riskLevel']): string {
  return `risk-${level}`;
}

function toBotPreferences(settings: BotSettingsState, strategyId?: string) {
  return {
    autoStopAtProfit: settings.toggles['auto-profit'],
    autoStopAtLoss: settings.toggles['auto-loss'],
    signalConfirmationEnabled: settings.toggles['signal-confirm'],
    notificationsEnabled: settings.toggles.notifications,
    riskLevel: mapRiskLevel(settings.riskLevel),
    strategyId: resolveStrategyId(strategyId),
  };
}

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

export type AiBotSignalSnapshot = {
  signal: string;
  signalSide: 'up' | 'down' | 'none';
  strength: string;
  updated: string;
  freshSeconds: number;
  market: string;
  marketLabel: string;
  rsi: number | null;
  live: boolean;
  backtestLabel: string;
  backtestReady: boolean;
  skipReason: string;
  candleTimeMs: number;
};

export type AiBotPairRsi = {
  asset: string;
  marketLabel: string;
  rsi: number | null;
  rsiLabel: string;
  signal: string;
  signalSide: 'up' | 'down' | 'none';
  live: boolean;
  backtestLabel: string;
  backtestReady: boolean;
  skipReason: string;
  candleTimeMs: number;
};

const EMPTY_AUTOMATION = new Set([
  'NOT_CONNECTED',
  'INSUFFICIENT_HISTORY',
  'PAYOUT_TOO_LOW',
]);
const BOARD_FETCH_MS = 8_000;

function readRsi(rsi: { liveRsi?: number | null; rsi: number }): number | null {
  const n = Number(rsi.liveRsi ?? rsi.rsi);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

function sampleCount(bt: { totalSignals?: number } | null | undefined): number {
  const total = Number(bt?.totalSignals ?? 0);
  return Number.isFinite(total) && total > 0 ? total : 0;
}

function pickBacktest(rsi: StrategySignalResponse) {
  const shown = readRsi(rsi);
  const closed = Number(rsi.rsi);
  const pivot = shown != null ? shown : Number.isFinite(closed) ? closed : NaN;
  const call = rsi.callBacktest;
  const put = rsi.putBacktest;
  const atCall = Number.isFinite(pivot) && pivot <= 25;
  const atPut = Number.isFinite(pivot) && pivot >= 75;
  const nearer = Number.isFinite(pivot) && pivot >= 50 ? put : call;
  const preferred = atCall ? call : atPut ? put : nearer ?? rsi.backtest;
  const withSamples = (bt: typeof call) => (sampleCount(bt) > 0 ? bt : null);
  const bt =
    withSamples(preferred) ??
    withSamples(call) ??
    withSamples(put) ??
    preferred ??
    call ??
    put ??
    rsi.backtest;
  if (!bt) return null;
  const total = sampleCount(bt);
  const rate = Number(bt.successRate ?? 0);
  if (!Number.isFinite(rate)) return null;
  const atExtreme = Number.isFinite(pivot) && (pivot <= 25 || pivot >= 75);
  return {
    rate,
    total,
    passed: bt.passed === true && rate >= 75 && atExtreme && total > 0,
  };
}

function formatBacktestLabel(
  bits: { rate: number; passed: boolean } | null,
): string {
  if (!bits) return '—';
  const rounded = Math.round(bits.rate);
  if (!Number.isFinite(rounded)) return '—';
  return `${rounded}%`;
}

function toSnapshot(
  symbol: string,
  rsi: StrategySignalResponse,
): AiBotSignalSnapshot {
  const value = readRsi(rsi);
    const dead = Boolean(rsi.automationError && EMPTY_AUTOMATION.has(rsi.automationError));
    const live = value != null && !dead;
    const candleMs = Date.parse(rsi.candleTime);
    const backtest = pickBacktest(rsi);
    return {
      signal: live ? formatSignal(rsi.signal) : t('common.none'),
      signalSide: live ? signalSide(rsi.signal) : 'none',
      strength: value != null ? value.toFixed(2) : '—',
    updated:
      live && Number.isFinite(candleMs)
        ? new Date(candleMs).toLocaleTimeString('en-GB', { hour12: false })
        : new Date().toLocaleTimeString('en-GB', { hour12: false }),
    freshSeconds:
      live && Number.isFinite(candleMs)
        ? Math.max(0, Math.floor((Date.now() - candleMs) / 1000))
        : 0,
    market: rsi.asset || symbol,
    marketLabel: formatPairLabel(rsi.asset || symbol),
    rsi: live ? value : null,
    live,
    backtestLabel: formatBacktestLabel(backtest),
    backtestReady: Boolean(backtest?.passed),
    skipReason: rsi.entryBlockReason?.trim() || '',
    candleTimeMs: Number.isFinite(candleMs) ? candleMs : Date.now(),
  };
}

function toPairRow(snapshot: AiBotSignalSnapshot): AiBotPairRsi {
  return {
    asset: snapshot.market,
    marketLabel: snapshot.marketLabel,
    rsi: snapshot.rsi,
    rsiLabel: snapshot.rsi != null ? snapshot.rsi.toFixed(2) : '—',
    signal: snapshot.signal,
    signalSide: snapshot.signalSide,
    live: snapshot.live,
    backtestLabel: snapshot.backtestLabel,
    backtestReady: snapshot.backtestReady,
    skipReason: snapshot.skipReason,
    candleTimeMs: snapshot.candleTimeMs,
  };
}

export const aiBotService = {
  async fetchData(preferredAsset?: string | null): Promise<AiBotMockData> {
    // Blank the numbers the API is responsible for. Cloning the mock wholesale meant a
    // failed balance or trades call left invented performance figures on the page,
    // indistinguishable from real ones.
    const data = structuredClone(AI_BOT_MOCK);
    data.performance = {
      totalBalance: '—',
      todayPlus: '—',
      todayMinus: '—',
      net: '—',
      active: '—',
      winRate: '—',
      trades: '—',
    };

    try {
      const [balance, trades, bot, strategies] = await Promise.all([
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
        const botPairs = bot.assets?.length ? bot.assets : bot.asset ? [bot.asset] : [];
        data.configuration.tradingPair = formatSelectedPairsLabel(botPairs);
        data.configuration.strategy = strategyName;
        data.targets.profitTarget = `+$${bot.dailyProfitTarget}`;
        data.targets.lossLimit = `-$${bot.dailyLossLimit}`;
        data.stopReason = bot.stopReason ?? null;
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
        data.status.market = formatPairLabel(asset);
        if (!bot?.asset && !bot?.assets?.[0]) {
          data.configuration.tradingPair = preferredAsset ?? asset;
        }
      }
    } catch {
      /* defaults */
    }

    return data;
  },

  async fetchSignalSnapshot(asset: string): Promise<AiBotSignalSnapshot | null> {
    const symbol = asset.trim();
    if (!symbol) return null;

    try {
      const status = await getAccountStatusCached().catch(() => null);
      if (!canBrowseMarket(status?.botAccess)) return null;

      const rsi = await strategiesApi
        .rsiSignal(symbol, 60, timedSignal(MARKET_FETCH_MS), {
          expiryCandles: 5,
          backtestCandles: 400,
        })
        .catch(() => null);
      if (!rsi) return null;

      return toSnapshot(symbol, rsi);
    } catch {
      return null;
    }
  },

  async fetchSignalBoard(assets: string[], signal?: AbortSignal): Promise<AiBotPairRsi[]> {
    const unique = [...new Set(assets.map((asset) => asset.trim()).filter(Boolean))];
    const status = await getAccountStatusCached().catch(() => null);
    if (!canBrowseMarket(status?.botAccess)) return [];

    const board = await strategiesApi
      .rsiBoard(unique, signal ?? timedSignal(BOARD_FETCH_MS))
      .catch(() => null);
    const pairs = board?.pairs ?? [];
    if (pairs.length === 0) return [];

    const rows = pairs.map((rsi) => toPairRow(toSnapshot(rsi.asset || '', rsi)));
    return rows.sort((a, b) => {
      if (a.backtestReady !== b.backtestReady) return a.backtestReady ? -1 : 1;
      if (a.signalSide !== b.signalSide) {
        if (a.signalSide !== 'none' && b.signalSide === 'none') return -1;
        if (b.signalSide !== 'none' && a.signalSide === 'none') return 1;
      }
      if (a.live !== b.live) return a.live ? -1 : 1;
      return (b.rsi ?? -1) - (a.rsi ?? -1);
    });
  },

  pickLiveSnapshot(rows: AiBotPairRsi[], rotateIndex = 0): AiBotPairRsi | null {
    const ready = rows.filter((row) => row.live && row.signalSide !== 'none' && row.backtestReady);
    const live = rows.filter((row) => row.live);
    const pool = ready.length > 0 ? ready : live.length > 0 ? live : rows;
    if (pool.length === 0) return null;
    return pool[Math.abs(rotateIndex) % pool.length] ?? pool[0] ?? null;
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
      marketTypeId?: string;
      settings?: BotSettingsState;
    },
  ): Promise<void> {
    const amount = config?.amount ?? 25;
    const durationSeconds = config?.durationSeconds ?? 300;
    const pairs = config?.pairs?.length ? config.pairs : ['EURUSD_otc'];
    const profitTarget = config?.profitTarget ?? 50;
    const lossLimit = config?.lossLimit ?? 30;
    const stakeMode = config?.stakeMode ?? 'red-signal-pro';
    const marketTypeId = config?.marketTypeId ?? 'all-markets';
    const preferences = {
      ...toBotPreferences(config?.settings ?? {
        toggles: {
          'auto-profit': true,
          'auto-loss': true,
          'signal-confirm': false,
          notifications: true,
        },
        riskLevel: 'medium',
        tradeAmount: '$25',
        duration: '5m',
        profitTarget: '50',
        lossLimit: '30',
      }, config?.strategyId),
      stakeMode,
      marketTypeId,
    };

    if (control === 'start') {
      if (!config?.pairs?.length) {
        throw new Error('Select at least one trading pair before starting the bot.');
      }
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
      const hasPairs = Boolean(config?.pairs?.length);
      await botApi.apply({
        ...(hasPairs ? { asset: pairs[0], assets: pairs } : {}),
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
          payout: asset.payout,
          tradable: asset.available && isTradablePairPayout(asset.payout),
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

  async listStrategies(): Promise<StrategyGridOption[]> {
    const response = await strategiesApi.list().catch(() => null);
    const items: StrategyDto[] = response?.strategies ?? [];
    return items.map((item) => {
      const id = item.id.trim().toLowerCase();
      const presentation = getStrategyPresentation(id);
      const status = (item.status ?? '').toLowerCase();
      const enabled = Boolean(item.enabled) && status !== 'comingsoon';
      return {
        id,
        name: item.name || id.toUpperCase(),
        status: item.status,
        enabled,
        preview: presentation.preview,
        risk: presentation.risk,
        descriptionKey: presentation.descriptionKey,
        bestForKey: presentation.bestForKey,
      };
    });
  },
};
