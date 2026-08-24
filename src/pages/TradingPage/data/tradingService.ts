import {
  ApiClientError,
  binollaApi,
  marketApi,
  strategiesApi,
} from '@shared/api';
import { canBrowseMarket, canTrade, getAdminNotApprovedTradeMessage } from '@shared/access/webAccess';
import { MARKET_FETCH_MS, timedSignal } from '@shared/api/timedSignal';
import { getAccountStatusCached } from '@shared/api/botSessionCache';
import { pickPreferredMarketAsset } from '@shared/market/preferAsset';
import { t } from '@shared/i18n';
import { tradingMockData, type TradingMockData } from './trading.mock';
import { tradeService } from '@services/trades';

let selectedAsset: string | null = null;
let amount = '25';
let durationLabel = '1 min';
let durationSeconds = 60;

function formatPairLabel(symbol: string, name?: string): string {
  if (name && name.includes('/')) return name.split(' ')[0] ?? name;
  const base = symbol.replace(/_otc$/i, '');
  if (base.length === 6) return `${base.slice(0, 3)}/${base.slice(3)}`;
  return base;
}

function formatSignal(signal: string): string {
  const s = signal.toLowerCase();
  if (s === 'call') return t('common.callUp');
  if (s === 'put') return t('common.putDown');
  return t('common.none');
}

export const tradingService = {
  async fetchData(): Promise<TradingMockData> {
    const data = structuredClone(tradingMockData);

    try {
      const [status, balance] = await Promise.all([
        getAccountStatusCached().catch(() => null),
        binollaApi.balance(timedSignal(MARKET_FETCH_MS)).catch(() => null),
      ]);

      if (balance) {
        data.balance = `$${balance.currentBalance.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;
      } else {
        data.balance = '—';
      }

      const browse = canBrowseMarket(status?.botAccess);
      const assets = browse
        ? await marketApi.assets(timedSignal(MARKET_FETCH_MS)).catch(() => null)
        : null;
      const liveAssets = assets?.assets ?? [];
      const preferred =
        (selectedAsset
          ? liveAssets.find((a) => a.symbol === selectedAsset)
          : undefined) ??
        pickPreferredMarketAsset(liveAssets) ??
        liveAssets[0];
      const asset = preferred?.symbol ?? null;
      if (asset) selectedAsset = asset;

      if (asset) {
        data.pair = formatPairLabel(asset, preferred?.name);
        data.pairType = asset.toLowerCase().includes('otc') ? 'OTC' : 'Global';
        const [price, rsi, candles] = await Promise.all([
          marketApi.price(asset, timedSignal(MARKET_FETCH_MS)).catch(() => null),
          strategiesApi.rsiSignal(asset, 60, timedSignal(MARKET_FETCH_MS)).catch(() => null),
          marketApi.candles(asset, 60, timedSignal(MARKET_FETCH_MS)).catch(() => null),
        ]);
        if (price?.price != null) {
          data.price = price.price.toFixed(5);
          data.currentPrice = price.price.toFixed(4);
        }
        if (candles?.candles?.length) {
          data.candles = candles.candles.slice(-20).map((c) => ({
            open: c.open,
            close: c.close,
            high: c.high,
            low: c.low,
          }));
        }
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
    } catch {
      /* defaults */
    }

    return data;
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
    if (!selectedAsset) {
      throw new ApiClientError('MARKET_UNAVAILABLE', t('trading.noAssetYet'), 503);
    }
    return tradeService.placeTrade({
      direction,
      pair: selectedAsset,
      platform: 'binolla',
      amount: Number.parseFloat(amount) || 25,
      durationLabel: `${durationSeconds}s`,
      strategy: 'rsi',
      indicator: 'RSI',
      source: 'user',
    });
  },

  setAmount(value: string) {
    amount = value;
  },

  setDuration(label: string, seconds: number) {
    durationLabel = label;
    durationSeconds = seconds;
  },

  setSelectedAsset(symbol: string) {
    selectedAsset = symbol.trim() || null;
  },
};
