import { useEffect, useMemo, useState } from 'react';

import { AppModal } from '@components/AppModal';
import { aiBotAssets } from '@assets';
import { useI18n } from '@i18n';
import { currencyFlagUrl } from '@shared/market/pairDisplay';

import type { TradingPairOption } from '../data/trading.mock';
import modalStyles from '../../AiBotPage/modals/modals.module.css';
import { MIN_PAIR_PAYOUT_PERCENT } from '@shared/market/pairPayout';

type TradingPairSelectModalProps = {
  isOpen: boolean;
  selectedSymbol: string;
  pairs: TradingPairOption[];
  onClose: () => void;
  onSelect: (symbol: string) => void;
};

function PairFlagIcon({ base, quote }: { base: string; quote: string }) {
  if (!base || !quote) {
    return <span className={modalStyles.pairBadge}>—</span>;
  }

  return (
    <span className={modalStyles.pairFlags} aria-hidden="true">
      <img className={modalStyles.pairFlagBase} src={currencyFlagUrl(base)} alt="" />
      <img className={modalStyles.pairFlagQuote} src={currencyFlagUrl(quote)} alt="" />
    </span>
  );
}

export function TradingPairSelectModal({
  isOpen,
  selectedSymbol,
  pairs,
  onClose,
  onSelect,
}: TradingPairSelectModalProps) {
  const { t } = useI18n();
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setQuery('');
  }, [isOpen]);

  const filteredPairs = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return pairs;
    return pairs.filter(
      (pair) =>
        pair.label.toLowerCase().includes(normalized) ||
        pair.symbol.toLowerCase().includes(normalized) ||
        pair.type.toLowerCase().includes(normalized),
    );
  }, [pairs, query]);

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      size="compact"
      figmaNode="737:7062"
      title={
        <span className={modalStyles.modalTitleWhite}>{t.aiBot.modals.tradingPair.title}</span>
      }
      subtitle={t.aiBot.modals.tradingPair.subtitle}
    >
      <div className={modalStyles.searchWrap}>
        <img
          className={modalStyles.searchIcon}
          src={aiBotAssets.iconSearch}
          alt=""
          aria-hidden="true"
        />
        <input
          className={modalStyles.searchInput}
          type="search"
          value={query}
          placeholder={t.aiBot.modals.tradingPair.searchPlaceholder}
          onChange={(event) => setQuery(event.target.value)}
          disabled={pairs.length === 0}
        />
      </div>

      {pairs.length === 0 ? (
        <p className={modalStyles.pairStatus}>{t.trading.terminal.noPairs}</p>
      ) : filteredPairs.length === 0 ? (
        <p className={modalStyles.pairStatus}>{t.aiBot.modals.tradingPair.noResults}</p>
      ) : (
        <div className={modalStyles.pairGrid}>
          {filteredPairs.map((pair) => {
            const selected = pair.symbol === selectedSymbol;
            const disabled = !pair.tradable;
            return (
              <button
                key={pair.symbol}
                type="button"
                className={`${modalStyles.pairCard}${selected ? ` ${modalStyles.pairCardSelected}` : ''}${disabled ? ` ${modalStyles.pairCardDisabled}` : ''}`}
                disabled={disabled}
                onClick={() => {
                  if (disabled) return;
                  onSelect(pair.symbol);
                  onClose();
                }}
                aria-pressed={selected}
                aria-disabled={disabled}
              >
                <PairFlagIcon base={pair.base} quote={pair.quote} />
                <span className={modalStyles.pairCopy}>
                  <p className={modalStyles.pairSymbol}>{pair.label}</p>
                  <p className={modalStyles.pairMeta}>{pair.type}</p>
                  {disabled && pair.payout != null && pair.payout > 0 ? (
                    <p className={modalStyles.pairPayoutLow}>
                      {t.aiBot.modals.tradingPair.lowPayout
                        .replace('{percent}', String(pair.payout))
                        .replace('{min}', String(MIN_PAIR_PAYOUT_PERCENT))}
                    </p>
                  ) : null}
                </span>
                {selected ? (
                  <img
                    className={modalStyles.pairCheck}
                    src={aiBotAssets.iconCheck}
                    alt=""
                    aria-hidden="true"
                  />
                ) : null}
              </button>
            );
          })}
        </div>
      )}
    </AppModal>
  );
}
