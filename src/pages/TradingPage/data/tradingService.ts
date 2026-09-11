import {
  ApiClientError,
  binollaApi,
  marketApi,
  strategiesApi,
  type MarketAssetsResponse,
} from '@shared/api';
import { canBrowseMarket, canTrade, getAdminNotApprovedTradeMessage } from '@shared/access/webAccess';
import { MARKET_FETCH_MS, timedSignal } from '@shared/api/timedSignal';
import { getAccountStatusCached } from '@shared/api/botSessionCache';
import { pickPreferredMarketAsset, filterFxCurrencyAssets, isPreferredMarketSymbol } from '@shared/market/preferAsset';
import { formatPairLabel, parseFxPair, pairTypeFromSymbol } from '@shared/market/pairDisplay';
import { isTradablePairPayout } from '@shared/market/pairPayout';
import { t } from '@shared/i18n';
import { tradingMockData, type TradingCandle, type TradingMockData, type TradingPairOption } from './trading.mock';
import { tradeService, type TradePlatform } from '@services/trades';
import type { TradeRecord } from '@services/trades';

const PERIOD_SEC = 60;
/** 3 hours of 1-minute candles (3 * 60 = 180). Rolling window: new added, oldest dropped. */
const MAX_CANDLES = 180;
const THREE_HOURS_SEC = 3 * 3600;
const LIVE_REFRESH_MS = 10_000;
const LIVE_TICK_MS = 3_000;

let selectedAsset: string | null = null;
let currentSeriesAsset: string | null = null;
const SELECTED_ASSET_STORAGE_KEY = 'scar-alpha-selected-asset';

function readStoredAsset(): string | null {
  try {
    return localStorage.getItem(SELECTED_ASSET_STORAGE_KEY);
  } catch {
    return null;
  }
}

function storeAsset(val: string): void {
  try {
    localStorage.setItem(SELECTED_ASSET_STORAGE_KEY, val);
  } catch {
    /* ignore */
  }
}

let amount = '25';
let durationLabel = '1 min';
let durationSeconds = 60;
/** In-memory forming series so ticks survive full refresh merge. */
let liveCandleSeries: TradingCandle[] = [];
let cachedTradingData: TradingMockData | null = null;
let lastKnownBalance: string | null = null;
let cachedAssets: MarketAssetsResponse | null = null;
let cachedAssetsAt = 0;
const ASSETS_CACHE_TTL = 60_000;

function readStoredBalance(): string | null {
  try {
    return localStorage.getItem('scar-alpha-last-balance');
  } catch {
    return null;
  }
}

function storeBalance(val: string): void {
  lastKnownBalance = val;
  try {
    localStorage.setItem('scar-alpha-last-balance', val);
  } catch {
    /* ignore */
  }
}

export { LIVE_REFRESH_MS, LIVE_TICK_MS, PERIOD_SEC, MAX_CANDLES, THREE_HOURS_SEC };

export function formatMmSs(totalSec: number): string {
  const s = Math.max(0, Math.floor(totalSec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
}

/** Seconds left in the current candle bucket (periodSec). */
export function candleExpiryRemaining(periodSec = PERIOD_SEC): number {
  const nowSec = Math.floor(Date.now() / 1000);
  const rem = periodSec - (nowSec % periodSec);
  return rem === periodSec ? periodSec : rem;
}

const DURATION_OPTIONS = [
  { label: '1 min', seconds: 60 },
  { label: '2 min', seconds: 120 },
  { label: '5 min', seconds: 300 },
] as const;

export function resolveEntryFromCandles(
  candles: TradingCandle[],
  createdAtMs: number,
): { timeSec: number; price: number | undefined } {
  const timeSec = Math.floor(createdAtMs / 1000);
  let candleIndex = -1;
  for (let i = 0; i < candles.length; i += 1) {
    const candleTime = candles[i]?.time;
    if (candleTime == null) continue;
    if (candleTime <= timeSec) candleIndex = i;
  }
  if (candleIndex < 0 && candles.length > 0) candleIndex = candles.length - 1;
  return {
    timeSec,
    price: candleIndex >= 0 ? candles[candleIndex]?.close : undefined,
  };
}

function formatSignal(signal: string): string {
  const s = signal.toLowerCase();
  if (s === 'call') return t('common.callUp');
  if (s === 'put') return t('common.putDown');
  return t('common.none');
}

function toUnixSec(timestamp: string | undefined): number | undefined {
  if (!timestamp) return undefined;
  const ms = Date.parse(timestamp);
  if (!Number.isFinite(ms)) return undefined;
  return Math.floor(ms / 1000);
}

function applyQuoteToCandles(
  candles: TradingCandle[],
  price: number,
  periodSec: number,
): TradingCandle[] {
  const nowSec = Math.floor(Date.now() / 1000);
  const bucket = Math.floor(nowSec / periodSec) * periodSec;
  const next = candles.map((c) => ({ ...c }));

  if (next.length === 0) {
    return [{ open: price, high: price, low: price, close: price, time: bucket }];
  }

  const last = next[next.length - 1]!;
  const lastBucket =
    last.time != null && Number.isFinite(last.time)
      ? Math.floor(last.time / periodSec) * periodSec
      : bucket;

  if (bucket > lastBucket) {
    const open = last.close;
    next.push({
      open,
      high: Math.max(open, price),
      low: Math.min(open, price),
      close: price,
      time: bucket,
    });
    const cutoff = Math.floor(Date.now() / 1000) - THREE_HOURS_SEC;
    const within3h = next.filter((c) => c.time == null || c.time >= cutoff);
    return within3h.length > MAX_CANDLES ? within3h.slice(-MAX_CANDLES) : within3h;
  }

  last.close = price;
  last.high = Math.max(last.high, price);
  last.low = Math.min(last.low, price);
  if (last.time == null) last.time = lastBucket;
  next[next.length - 1] = last;
  return next;
}

function mergeServerWithLive(server: TradingCandle[], live: TradingCandle[]): TradingCandle[] {
  if (live.length === 0) return server;
  if (server.length === 0) return live;

  const lastServer = server[server.length - 1]!;
  const lastLive = live[live.length - 1]!;
  const serverBucket =
    lastServer.time != null ? Math.floor(lastServer.time / PERIOD_SEC) * PERIOD_SEC : null;
  const liveBucket =
    lastLive.time != null ? Math.floor(lastLive.time / PERIOD_SEC) * PERIOD_SEC : null;

  // Prefer live forming candle when same bucket.
  if (serverBucket != null && liveBucket != null && serverBucket === liveBucket) {
    return [...server.slice(0, -1), lastLive];
  }
  if (liveBucket != null && (serverBucket == null || liveBucket > serverBucket)) {
    const combined = [...server, lastLive];
    const cutoff = Math.floor(Date.now() / 1000) - THREE_HOURS_SEC;
    const within3h = combined.filter((c) => c.time == null || c.time >= cutoff);
    return within3h.length > MAX_CANDLES ? within3h.slice(-MAX_CANDLES) : within3h;
  }
  return server;
}

function buildAxis(candles: TradingCandle[], price: number): Pick<TradingMockData, 'yAxis' | 'xAxis' | 'currentPrice' | 'price'> {
  const highs = candles.map((c) => c.high);
  const lows = candles.map((c) => c.low);
  const lo = Math.min(...lows, price);
  const hi = Math.max(...highs, price);
  const span = hi - lo || price * 1e-4 || 0.0001;
  const steps = 4;
  const yAxis = Array.from({ length: steps + 1 }, (_, i) => {
    const v = hi - (span * i) / steps;
    return v.toFixed(v >= 1 ? 4 : 5);
  });
  const xAxis = candles
    .filter((_, i) => i % Math.max(1, Math.floor(candles.length / 4)) === 0 || i === candles.length - 1)
    .slice(0, 5)
    .map((c) => {
      if (c.time == null) return '';
      const d = new Date(c.time * 1000);
      return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
    })
    .filter(Boolean);

  return {
    yAxis,
    xAxis: xAxis.length ? xAxis : ['', '', '', '', 'Now'],
    currentPrice: price.toFixed(4),
    price: price.toFixed(5),
  };
}

export const tradingService = {
  async fetchData(): Promise<TradingMockData> {
    // Same reasoning as Home and the bot page: the mock supplies the SHAPE, never
    // stand-in values that could be mistaken for live figures. Chart candles are
    // replaced wholesale further down when real ones arrive.
    const data = structuredClone(tradingMockData);
    data.balance = '—';

    try {
      const [status, balance] = await Promise.all([
        getAccountStatusCached().catch(() => null),
        binollaApi.balance(timedSignal(MARKET_FETCH_MS)).catch(() => null),
      ]);

      if (balance && balance.currentBalance != null && (balance.connected || balance.currentBalance > 0)) {
        const formatted = `$${balance.currentBalance.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;
        storeBalance(formatted);
      }
      data.balance = lastKnownBalance ?? readStoredBalance() ?? (balance ? `$${balance.currentBalance.toFixed(2)}` : '—');

      const browse = canBrowseMarket(status?.botAccess);
      let assets = cachedAssets;
      if (browse && (!assets || Date.now() - cachedAssetsAt > ASSETS_CACHE_TTL)) {
        assets = await marketApi.assets(timedSignal(MARKET_FETCH_MS)).catch(() => null);
        if (assets?.assets?.length) {
          cachedAssets = assets;
          cachedAssetsAt = Date.now();
        }
      }
      const liveAssets = assets?.assets ?? [];
      let asset = selectedAsset ?? readStoredAsset();
      if (liveAssets.length > 0) {
        const preferred =
          (asset ? liveAssets.find((a) => a.symbol === asset) : undefined) ??
          pickPreferredMarketAsset(liveAssets) ??
          liveAssets[0];
        if (preferred?.symbol) {
          asset = preferred.symbol;
        }
      }
      if (!asset) {
        asset = readStoredAsset() ?? 'EURUSD_otc';
      }
      selectedAsset = asset;
      if (asset) storeAsset(asset);

      if (asset) {
        if (currentSeriesAsset !== asset) {
          liveCandleSeries = [];
          currentSeriesAsset = asset;
        }
        data.assetSymbol = asset;
        const matchingAsset = liveAssets.find((a) => a.symbol === asset);
        data.pair = formatPairLabel(asset, matchingAsset?.name);
        data.pairType = pairTypeFromSymbol(asset);
        const [price, rsi, candles] = await Promise.all([
          marketApi.price(asset, timedSignal(MARKET_FETCH_MS)).catch(() => null),
          strategiesApi.rsiSignal(asset, PERIOD_SEC, timedSignal(MARKET_FETCH_MS)).catch(() => null),
          marketApi.candles(asset, PERIOD_SEC, timedSignal(MARKET_FETCH_MS)).catch(() => null),
        ]);

        let series: TradingCandle[] = [];
        if (candles?.candles?.length) {
          const cutoff = Math.floor(Date.now() / 1000) - THREE_HOURS_SEC;
          series = candles.candles
            .map((c) => ({
              open: c.open,
              close: c.close,
              high: c.high,
              low: c.low,
              time: toUnixSec(c.timestamp),
            }))
            .filter((c) => c.time == null || c.time >= cutoff)
            .sort((a, b) => (a.time ?? 0) - (b.time ?? 0))
            .slice(-MAX_CANDLES);
        }

        series = mergeServerWithLive(series, liveCandleSeries);

        const livePx = price?.price;
        if (livePx != null && Number.isFinite(livePx)) {
          series = applyQuoteToCandles(series, livePx, PERIOD_SEC);
          Object.assign(data, buildAxis(series, livePx));
        } else if (series.length) {
          Object.assign(data, buildAxis(series, series[series.length - 1]!.close));
        }

        liveCandleSeries = series;
        data.candles = series;

        if (rsi) {
          data.signal = {
            lastSignal: formatSignal(rsi.signal),
            strength: Number(rsi.liveRsi ?? rsi.rsi).toFixed(2),
            indicator: t('common.rsi'),
            strategy: t('common.rsi'),
            market: asset,
            freshSeconds: 0,
          };
        }
      }

      data.amount = amount;
      data.duration = durationLabel;
      data.expiry = formatMmSs(candleExpiryRemaining(PERIOD_SEC));
      cachedTradingData = data;
    } catch {
      /* defaults */
    }

    if (!cachedTradingData) cachedTradingData = data;
    return data;
  },

  async fetchLivePrice(): Promise<number | null> {
    const asset = selectedAsset ?? readStoredAsset();
    if (!asset) return null;
    const quote = await marketApi.price(asset, timedSignal(MARKET_FETCH_MS)).catch(() => null);
    return quote?.price ?? null;
  },

  applyLiveQuote(current: TradingMockData, price: number): TradingMockData {
    if (currentSeriesAsset && current.assetSymbol && currentSeriesAsset !== current.assetSymbol) {
      return current;
    }
    const nextCandles = applyQuoteToCandles(
      current.candles.length ? current.candles : liveCandleSeries,
      price,
      PERIOD_SEC,
    );
    liveCandleSeries = nextCandles;
    return {
      ...current,
      candles: nextCandles,
      ...buildAxis(nextCandles, price),
      change: current.change,
    };
  },

  async placeTrade(direction: 'up' | 'down'): Promise<string> {
    const status = await getAccountStatusCached().catch(() => null);
    if (!canTrade(status?.botAccess)) {
      throw new ApiClientError(
        'ADMIN_APPROVAL_REQUIRED',
        status?.botAccess === 'AdminApprovalRequired'
          ? getAdminNotApprovedTradeMessage()
          : t('trading.tradingUnavailable'),
        403,
      );
    }
    const asset = selectedAsset ?? readStoredAsset() ?? 'EURUSD_otc';
    const broker = (localStorage.getItem('scar-alpha-broker') || '').toLowerCase().includes('quotex') ? 'Quotex' : 'Binolla';
    const activeBroker: TradePlatform = broker.toLowerCase() === 'quotex' ? 'quotex' : 'binolla';
    return tradeService.placeTrade({
      direction,
      pair: asset,
      platform: activeBroker,
      amount: Number.parseFloat(amount) || 25,
      durationLabel: `${durationSeconds}s`,
      strategy: 'rsi',
      indicator: 'RSI',
      source: 'user',
    });
  },

  setAmount(value: string) {
    amount = value.replace(/[^\d.]/g, '');
  },

  setDuration(label: string, seconds: number) {
    durationLabel = label;
    durationSeconds = seconds;
  },

  cycleDuration(): { label: string; seconds: number } {
    const idx = DURATION_OPTIONS.findIndex((o) => o.seconds === durationSeconds);
    const next = DURATION_OPTIONS[(idx + 1) % DURATION_OPTIONS.length]!;
    durationLabel = next.label;
    durationSeconds = next.seconds;
    return { label: next.label, seconds: next.seconds };
  },

  getDurationSeconds(): number {
    return durationSeconds;
  },

  setSelectedAsset(symbol: string) {
    const trimmed = symbol.trim() || null;
    selectedAsset = trimmed;
    if (trimmed) storeAsset(trimmed);
    liveCandleSeries = [];
    currentSeriesAsset = trimmed;
  },

  getSelectedAsset(): string | null {
    return selectedAsset ?? readStoredAsset();
  },

  async listPairs(): Promise<TradingPairOption[]> {
    let assets = cachedAssets;
    if (!assets || Date.now() - cachedAssetsAt > ASSETS_CACHE_TTL) {
      assets = await marketApi.assets(timedSignal(MARKET_FETCH_MS)).catch(() => null);
      if (assets?.assets?.length) {
        cachedAssets = assets;
        cachedAssetsAt = Date.now();
      }
    }
    if (!assets?.assets?.length) return [];

    const fxAssets = filterFxCurrencyAssets(assets.assets);
    return fxAssets
      .map((asset) => {
        const parsed = parseFxPair(asset.symbol);
        return {
          symbol: asset.symbol,
          label: formatPairLabel(asset.symbol, asset.name),
          type: pairTypeFromSymbol(asset.symbol),
          available: asset.available !== false,
          base: parsed?.base ?? '',
          quote: parsed?.quote ?? '',
          payout: asset.payout,
          tradable: asset.available !== false && isTradablePairPayout(asset.payout),
        };
      })
      .sort((a, b) => {
        const aPreferred = isPreferredMarketSymbol(a.symbol) ? 0 : 1;
        const bPreferred = isPreferredMarketSymbol(b.symbol) ? 0 : 1;
        if (aPreferred !== bPreferred) return aPreferred - bPreferred;
        return a.label.localeCompare(b.label);
      });
  },

  /** Newest running trade for an asset (bot or user). */
  async fetchActiveTrade(asset?: string | null): Promise<TradeRecord | null> {
    const symbol = (asset ?? selectedAsset)?.trim();
    if (!symbol) return null;
    try {
      const result = await tradeService.listTrades({ filter: 'live', page: 1, pageSize: 20 });
      const matches = result.items
        .filter((trade) => trade.status === 'running')
        .filter((trade) => trade.pair.toLowerCase() === symbol.toLowerCase())
        .sort((a, b) => b.openedAt - a.openedAt);
      return matches[0] ?? null;
    } catch {
      return null;
    }
  },

  /** Newest running trade across all assets (used to jump chart to bot entries). */
  async fetchNewestLiveTrade(): Promise<TradeRecord | null> {
    try {
      const result = await tradeService.listTrades({ filter: 'live', page: 1, pageSize: 20 });
      const matches = result.items
        .filter((trade) => trade.status === 'running')
        .sort((a, b) => b.openedAt - a.openedAt);
      return matches[0] ?? null;
    } catch {
      return null;
    }
  },

  /** Return in-memory cached trading data for instant page transitions without loading screens. */
  getCachedData(): TradingMockData | null {
    return cachedTradingData;
  },

  setCachedBalance(balanceFormatted: string): void {
    storeBalance(balanceFormatted);
    if (cachedTradingData) {
      cachedTradingData.balance = balanceFormatted;
    }
  },
};
