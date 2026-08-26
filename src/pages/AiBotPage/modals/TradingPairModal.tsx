import { useEffect, useMemo, useState } from 'react';

import { AppModal } from '@components/AppModal';
import { aiBotAssets } from '@assets';
import { useI18n } from '@i18n';
import { currencyFlagUrl } from '@shared/market/pairDisplay';

import { aiBotService } from '../data/aiBotService';
import styles from './modals.module.css';

type TradingPairOption = Awaited<ReturnType<typeof aiBotService.listTradingPairs>>[number];

type TradingPairModalProps = {
  isOpen: boolean;
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
    const normalized = query.trim().toLowerCase();
    if (!normalized) return pairs;
    return pairs.filter(
      (pair) =>
        pair.label.toLowerCase().includes(normalized) ||
        pair.id.toLowerCase().includes(normalized) ||
        pair.type.toLowerCase().includes(normalized),
    );
  }, [pairs, query]);

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
            onSelectAll(filteredPairs.map((pair) => pair.id));
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
            return (
              <button
                key={pair.id}
                type="button"
                className={`${styles.pairCard}${selected ? ` ${styles.pairCardSelected}` : ''}`}
                onClick={() => onToggle(pair.id)}
                aria-pressed={selected}
              >
                <PairFlagIcon base={pair.base} quote={pair.quote} />
                <span className={styles.pairCopy}>
                  <p className={styles.pairSymbol}>{pair.label}</p>
                  <p className={styles.pairMeta}>{pair.type}</p>
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
