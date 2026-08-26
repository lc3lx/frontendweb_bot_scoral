import { useEffect, useId, useMemo, useRef, useState } from 'react';

import { tradingAssets } from '@assets';
import { useI18n } from '@i18n';

import type { TradingMockData, TradingPairOption } from '../data/trading.mock';
import { CandlestickChart, type ChartEntryMarker } from './CandlestickChart';
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
  const pairWrapRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!pairOpen) return;
    const onDoc = (event: MouseEvent) => {
      if (!pairWrapRef.current?.contains(event.target as Node)) setPairOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPairOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [pairOpen]);

  const pairChoices = useMemo(() => {
    if (pairs.length > 0) return pairs;
    if (!data.assetSymbol) return [];
    return [
      {
        symbol: data.assetSymbol,
        label: data.pair,
        type: data.pairType,
        available: true,
      },
    ];
  }, [pairs, data.assetSymbol, data.pair, data.pairType]);

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
          <div className={styles.pairPicker} ref={pairWrapRef}>
            <button
              type="button"
              className={styles.pairButton}
              disabled={placing}
              aria-haspopup="listbox"
              aria-expanded={pairOpen}
              aria-controls={listId}
              aria-label={t.trading.terminal.selectPair}
              onClick={() => setPairOpen((open) => !open)}
            >
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

            {pairOpen ? (
              <ul id={listId} className={styles.pairMenu} role="listbox" aria-label={t.trading.terminal.selectPair}>
                {pairChoices.length === 0 ? (
                  <li className={styles.pairEmpty}>{t.trading.terminal.noPairs}</li>
                ) : (
                  pairChoices.map((pair) => {
                    const selected = pair.symbol === data.assetSymbol;
                    return (
                      <li key={pair.symbol} role="option" aria-selected={selected}>
                        <button
                          type="button"
                          className={`${styles.pairOption}${selected ? ` ${styles.pairOptionActive}` : ''}`}
                          disabled={!pair.available}
                          onClick={() => {
                            setPairOpen(false);
                            if (!selected) onSelectPair(pair.symbol);
                          }}
                        >
                          <span className={styles.ltrValue}>{pair.label}</span>
                          <span className={styles.pairOptionType}>{pair.type}</span>
                        </button>
                      </li>
                    );
                  })
                )}
              </ul>
            ) : null}
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
    </section>
  );
}
