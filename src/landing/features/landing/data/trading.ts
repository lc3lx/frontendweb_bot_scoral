import candlesUrl from '@landing/assets/images/trading/candles.png';
import { registerAsset } from '@landing/assets';

registerAsset({
  id: 'img-trading-candles',
  kind: 'image',
  src: candlesUrl,
  alt: 'Candlestick chart preview',
  format: 'png',
  figmaNodeId: '488:1266',
  width: 296,
  height: 274,
});

export const TRADING_COPY = {
  eyebrow: 'Trading integration',
  title: 'Trade through Binolla, manage everything from Scar Alpha AI',
  description:
    'Scar Alpha AI keeps the trading experience connected by displaying Binolla inside the app’s Trading page, while the bot dashboard, trades, strategies, indicators, and AI settings remain part of Scar Alpha AI.',
} as const;

export const TRADING_BINOLLA = {
  title: 'Binolla Trading Page',
  pair: 'EUR/USD',
  upLabel: 'UP',
  downLabel: 'DOWN',
  candles: candlesUrl,
  candlesWidth: 296,
  candlesHeight: 274,
  figmaNodeId: '55:231',
} as const;

export type TradingSignalTone = 'default' | 'accent';

export type TradingSignalRow = {
  id: string;
  label: string;
  value: string;
  tone: TradingSignalTone;
};

export const TRADING_SIGNAL = {
  title: 'Scar Alpha Signal',
  figmaNodeId: '55:246',
  rows: [
    { id: 'indicator', label: 'Indicator', value: 'RSI + MACD', tone: 'default' },
    { id: 'strategy', label: 'Strategy', value: 'Trend Filter', tone: 'default' },
    { id: 'market-type', label: 'Market Type', value: 'Binolla', tone: 'default' },
    { id: 'strength', label: 'Strength', value: '82%', tone: 'accent' },
  ] as const satisfies readonly TradingSignalRow[],
} as const;

export const tradingAssets = {
  candles: candlesUrl,
} as const;
