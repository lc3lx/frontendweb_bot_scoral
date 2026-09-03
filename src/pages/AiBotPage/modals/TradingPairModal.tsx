import { useEffect, useMemo, useState } from 'react';

import { AppModal } from '@components/AppModal';
import { aiBotAssets } from '@assets';
import { useI18n } from '@i18n';
import { currencyFlagUrl } from '@shared/market/pairDisplay';

import { aiBotService } from '../data/aiBotService';
import styles from './modals.module.css';
import { pairMatchesMarketType, type MarketTypeId } from './aiBotModals.data';
import { MIN_PAIR_PAYOUT_PERCENT } from '@shared/market/pairPayout';

type TradingPairOption = Awaited<ReturnType<typeof aiBotService.listTradingPairs>>[number];

type TradingPairModalProps = {
  isOpen: boolean;
  /** Market scope chosen on the bot page — decides which pairs are offered here. */
  marketTypeId: MarketTypeId;
  selectedIds: string[];
  onClose: () => void;
  onToggle: (id: string) => void;
  onSelectAll: (ids: string[]) => void;
  onClearAll: () => void;
};

function PairFlagIcon({ base, quote }: { base: string; quote: string }) {
  if (!base || !quote) {
    return <span className={styles.pairBadge}>—</span>;
  }

  return (
    <span className={styles.pairFlags} aria-hidden="true">
      <img className={styles.pairFlagBase} src={currencyFlagUrl(base)} alt="" />
      <img className={styles.pairFlagQuote} src={currencyFlagUrl(quote)} alt="" />
    </span>
  );
}

export function TradingPairModal({
  isOpen,
  marketTypeId,
  selectedIds,
  onClose,
  onToggle,
  onSelectAll,
  onClearAll,
}: TradingPairModalProps) {
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const [pairs, setPairs] = useState<TradingPairOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setQuery('');
    setLoading(true);
    void aiBotService
      .listTradingPairs()
      .then(setPairs)
      .finally(() => setLoading(false));
  }, [isOpen]);

  const filteredPairs = useMemo(() => {
    // Market scope first: the chosen market decides which pairs exist here at all,
    // and the search box then narrows what is left.
    const inScope = pairs.filter((pair) => pairMatchesMarketType(pair.id, marketTypeId));

    const normalized = query.trim().toLowerCase();
    if (!normalized) return inScope;
    return inScope.filter(
      (pair) =>
        pair.label.toLowerCase().includes(normalized) ||
        pair.id.toLowerCase().includes(normalized) ||
        pair.type.toLowerCase().includes(normalized),
    );
  }, [marketTypeId, pairs, query]);

  const filteredSelectedCount = filteredPairs.filter((pair) => selectedIds.includes(pair.id)).length;
  const allFilteredSelected =
    filteredPairs.length > 0 && filteredSelectedCount === filteredPairs.length;

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      size="compact"
      figmaNode="737:7062"
      title={<span className={styles.modalTitleWhite}>{t.aiBot.modals.tradingPair.title}</span>}
      subtitle={t.aiBot.modals.tradingPair.subtitle}
    >
      <div className={styles.searchWrap}>
        <img className={styles.searchIcon} src={aiBotAssets.iconSearch} alt="" aria-hidden="true" />
        <input
          className={styles.searchInput}
          type="search"
          value={query}
          placeholder={t.aiBot.modals.tradingPair.searchPlaceholder}
          onChange={(event) => setQuery(event.target.value)}
          disabled={loading || pairs.length === 0}
        />
      </div>

      {!loading && pairs.length > 0 ? (
        <button
          type="button"
          className={styles.selectAllButton}
          onClick={() => {
            if (allFilteredSelected) {
              onClearAll();
              return;
            }
            onSelectAll(filteredPairs.filter((pair) => pair.tradable).map((pair) => pair.id));
          }}
          disabled={filteredPairs.length === 0}
        >
          {allFilteredSelected
            ? t.aiBot.modals.tradingPair.clearAll
            : t.aiBot.modals.tradingPair.chooseAll}
          <img className={styles.selectAllIcon} src={aiBotAssets.iconSelectAll} alt="" aria-hidden="true" />
        </button>
      ) : null}

      {loading ? (
        <p className={styles.pairStatus}>{t.aiBot.modals.tradingPair.loading}</p>
      ) : pairs.length === 0 ? (
        <p className={styles.pairStatus}>{t.aiBot.modals.tradingPair.empty}</p>
      ) : filteredPairs.length === 0 ? (
        <p className={styles.pairStatus}>{t.aiBot.modals.tradingPair.noResults}</p>
      ) : (
        <div className={styles.pairGrid}>
          {filteredPairs.map((pair) => {
            const selected = selectedIds.includes(pair.id);
            const disabled = !pair.tradable;
            return (
              <button
                key={pair.id}
                type="button"
                className={`${styles.pairCard}${selected ? ` ${styles.pairCardSelected}` : ''}${disabled ? ` ${styles.pairCardDisabled}` : ''}`}
                onClick={() => {
                  if (disabled) return;
                  onToggle(pair.id);
                }}
                disabled={disabled}
                aria-pressed={selected}
                aria-disabled={disabled}
              >
                <PairFlagIcon base={pair.base} quote={pair.quote} />
                <span className={styles.pairCopy}>
                  <p className={styles.pairSymbol}>{pair.label}</p>
                  <p className={styles.pairMeta}>{pair.type}</p>
                  {disabled && pair.payout != null && pair.payout > 0 ? (
                    <p className={styles.pairPayoutLow}>
                      {t.aiBot.modals.tradingPair.lowPayout.replace(
                        '{percent}',
                        String(pair.payout),
                      ).replace('{min}', String(MIN_PAIR_PAYOUT_PERCENT))}
                    </p>
                  ) : null}
                </span>
                {selected ? (
                  <img className={styles.pairCheck} src={aiBotAssets.iconCheck} alt="" aria-hidden="true" />
                ) : null}
              </button>
            );
          })}
        </div>
      )}
    </AppModal>
  );
}
