import { useMemo, useState } from 'react';

import { tradingAssets } from '@assets';
import { useI18n } from '@i18n';
import { currencyFlagUrl, parseFxPair } from '@shared/market/pairDisplay';

import type { TradingMockData, TradingPairOption } from '../data/trading.mock';
import { CandlestickChart, type ChartEntryMarker } from './CandlestickChart';
import { TradingPairSelectModal } from './TradingPairSelectModal';
import styles from './TradingTerminal.module.css';

type TradingTerminalProps = {
  data: TradingMockData;
  expiry: string;
  placing: boolean;
  feedback: string | null;
  feedbackTone: 'ok' | 'err' | null;
  pairs: TradingPairOption[];
  entryMarker: ChartEntryMarker | null;
  onAmountChange: (value: string) => void;
  onCycleDuration: () => void;
  onPlaceTrade: (direction: 'up' | 'down') => void;
  onSelectPair: (symbol: string) => void;
};

function PairFlags({ base, quote }: { base: string; quote: string }) {
  if (!base || !quote) return null;
  return (
    <span className={styles.pairFlags} aria-hidden="true">
      <img className={styles.pairFlagBase} src={currencyFlagUrl(base)} alt="" />
      <img className={styles.pairFlagQuote} src={currencyFlagUrl(quote)} alt="" />
    </span>
  );
}

export function TradingTerminal({
  data,
  expiry,
  placing,
  feedback,
  feedbackTone,
  pairs,
  entryMarker,
  onAmountChange,
  onCycleDuration,
  onPlaceTrade,
  onSelectPair,
}: TradingTerminalProps) {
  const { t } = useI18n();
  const [pairOpen, setPairOpen] = useState(false);

  const pairChoices = useMemo(() => {
    if (pairs.length > 0) return pairs;
    if (!data.assetSymbol) return [];
    const parsed = parseFxPair(data.assetSymbol);
    return [
      {
        symbol: data.assetSymbol,
        label: data.pair,
        type: data.pairType,
        available: true,
        base: parsed?.base ?? '',
        quote: parsed?.quote ?? '',
      },
    ];
  }, [pairs, data.assetSymbol, data.pair, data.pairType]);

  const selectedPair = useMemo(
    () => pairChoices.find((pair) => pair.symbol === data.assetSymbol) ?? pairChoices[0],
    [pairChoices, data.assetSymbol],
  );

  return (
    <section className={styles.terminal} aria-labelledby="trading-terminal-title">
      <div className={styles.topBar}>
        <div className={styles.brandRow}>
          <div className={styles.binollaIconWrap}>
            <img
              className={styles.binollaIcon}
              src={tradingAssets.iconBinolla}
              alt=""
              width={12}
              height={18}
              aria-hidden="true"
            />
          </div>
          <div>
            <p id="trading-terminal-title" className={styles.brandName}>
              {t.trading.terminal.binolla}
            </p>
            <p className={styles.brandSub}>{t.trading.terminal.embeddedTerminal}</p>
          </div>
        </div>
        <div className={styles.balanceBlock}>
          <p className={styles.balanceLabel}>{t.trading.terminal.balance}</p>
          <p className={`${styles.balanceValue} ${styles.ltrValue}`}>{data.balance}</p>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.pairRow}>
          <div className={styles.pairPicker}>
            <button
              type="button"
              className={styles.pairButton}
              disabled={placing}
              aria-haspopup="dialog"
              aria-expanded={pairOpen}
              aria-label={t.trading.terminal.selectPair}
              onClick={() => setPairOpen(true)}
            >
              {selectedPair ? (
                <PairFlags base={selectedPair.base} quote={selectedPair.quote} />
              ) : null}
              <span className={styles.pairName}>
                <span className={styles.ltrValue}>{data.pair}</span>
                <span className={styles.pairType}>{data.pairType}</span>
              </span>
              <img
                className={styles.pairChevron}
                src={tradingAssets.iconChevronDown}
                alt=""
                width={14}
                height={14}
                aria-hidden="true"
              />
            </button>
            <p className={`${styles.pairPrice} ${styles.ltrValue}`}>
              {data.price} <span className={styles.pairChange}>{data.change}</span>
            </p>
          </div>

          <div className={styles.expiryBadge} aria-live="polite">
            <span className={styles.expiryLabel}>{t.trading.terminal.expiry}</span>
            <span className={`${styles.expiryValue} ${styles.ltrValue}`}>{expiry}</span>
          </div>
        </div>

        <div className={styles.chartWrap}>
          <CandlestickChart candles={data.candles} height={300} entryMarker={entryMarker} />
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.inputsRow}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>{t.trading.terminal.amount}</span>
            <div className={styles.inputWrap}>
              <span className={styles.currency}>$</span>
              <input
                className={`${styles.input} ${styles.ltrValue}`}
                type="text"
                inputMode="decimal"
                value={data.amount}
                disabled={placing}
                onChange={(event) => onAmountChange(event.target.value)}
                aria-label={t.trading.terminal.amount}
              />
            </div>
          </label>

          <div className={styles.field}>
            <span className={styles.fieldLabel}>{t.trading.terminal.duration}</span>
            <button
              type="button"
              className={styles.durationButton}
              disabled={placing}
              onClick={onCycleDuration}
            >
              <span>{data.duration}</span>
              <img
                className={styles.durationChevron}
                src={tradingAssets.iconChevronDown}
                alt=""
                width={16}
                height={16}
                aria-hidden="true"
              />
            </button>
          </div>
        </div>

        {feedback ? (
          <p
            className={`${styles.feedback} ${feedbackTone === 'err' ? styles.feedbackErr : styles.feedbackOk}`}
            role="status"
          >
            {feedback}
          </p>
        ) : null}

        <div className={styles.actionsRow}>
          <button
            type="button"
            className={styles.upButton}
            disabled={placing}
            onClick={() => onPlaceTrade('up')}
          >
            <img
              className={styles.actionIcon}
              src={tradingAssets.iconUp}
              alt=""
              width={18}
              height={18}
              aria-hidden="true"
            />
            {placing ? t.trading.terminal.placing : t.trading.terminal.up}
          </button>
          <button
            type="button"
            className={styles.downButton}
            disabled={placing}
            onClick={() => onPlaceTrade('down')}
          >
            <img
              className={styles.actionIcon}
              src={tradingAssets.iconDown}
              alt=""
              width={18}
              height={18}
              aria-hidden="true"
            />
            {placing ? t.trading.terminal.placing : t.trading.terminal.down}
          </button>
        </div>
      </div>

      <TradingPairSelectModal
        isOpen={pairOpen}
        selectedSymbol={data.assetSymbol}
        pairs={pairChoices}
        onClose={() => setPairOpen(false)}
        onSelect={(symbol) => {
          if (symbol !== data.assetSymbol) onSelectPair(symbol);
        }}
      />
    </section>
  );
}
