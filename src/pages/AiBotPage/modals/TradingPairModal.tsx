import { useMemo, useState } from 'react';

import { AppModal } from '@components/AppModal';
import { aiBotAssets } from '@assets';
import { useI18n } from '@i18n';

import { TRADING_PAIR_OPTIONS } from './aiBotModals.data';
import styles from './modals.module.css';

type TradingPairModalProps = {
  isOpen: boolean;
  selectedId: string;
  onClose: () => void;
  onSelect: (id: string) => void;
};

export function TradingPairModal({ isOpen, selectedId, onClose, onSelect }: TradingPairModalProps) {
  const { t } = useI18n();
  const [query, setQuery] = useState('');

  const filteredPairs = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return TRADING_PAIR_OPTIONS;
    return TRADING_PAIR_OPTIONS.filter((pair) => pair.symbol.toLowerCase().includes(normalized));
  }, [query]);

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      size="compact"
      figmaNode="737:7062"
      title={t.aiBot.modals.tradingPair.title}
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
        />
      </div>

      <button
        type="button"
        className={styles.selectAllButton}
        onClick={() => {
          onSelect(TRADING_PAIR_OPTIONS[0].id);
          onClose();
        }}
      >
        {t.aiBot.modals.tradingPair.chooseAll}
        <img className={styles.selectAllIcon} src={aiBotAssets.iconSelectAll} alt="" aria-hidden="true" />
      </button>

      <div className={styles.pairGrid}>
        {filteredPairs.map((pair) => {
          const selected = pair.id === selectedId;
          return (
            <button
              key={pair.id}
              type="button"
              className={`${styles.pairCard}${selected ? ` ${styles.pairCardSelected}` : ''}`}
              onClick={() => {
                onSelect(pair.id);
                onClose();
              }}
            >
              <span className={styles.pairBadge}>{pair.badge}</span>
              <span className={styles.pairCopy}>
                <p className={styles.pairSymbol}>{pair.symbol}</p>
                <p className={pair.positive ? styles.pairPriceUp : styles.pairPriceDown}>
                  {pair.price} · {pair.change}
                </p>
              </span>
              {selected ? (
                <img className={styles.pairCheck} src={aiBotAssets.iconCheck} alt="" aria-hidden="true" />
              ) : null}
            </button>
          );
        })}
      </div>
    </AppModal>
  );
}
