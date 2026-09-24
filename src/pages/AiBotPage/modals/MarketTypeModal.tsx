import { AppModal } from '@components/AppModal';
import { aiBotAssets } from '@assets';
import { useI18n } from '@i18n';

import { MARKET_TYPE_OPTIONS, type MarketTypeId } from './aiBotModals.data';
import styles from './modals.module.css';

type MarketTypeModalProps = {
  isOpen: boolean;
  selectedId: MarketTypeId;
  onClose: () => void;
  onSelect: (id: MarketTypeId) => void;
};

const ALL_MARKETS_ID: MarketTypeId = 'all-markets';

export function MarketTypeModal({ isOpen, selectedId, onClose, onSelect }: MarketTypeModalProps) {
  // Broker names in these labels are resolved by the i18n layer, so the OTC option reads
  // as the user's own venue without this screen knowing which one that is.
  const { t } = useI18n();

  const allMarketsOption = MARKET_TYPE_OPTIONS.find((option) => option.id === ALL_MARKETS_ID);
  const scopedOptions = MARKET_TYPE_OPTIONS.filter((option) => option.id !== ALL_MARKETS_ID);
  const allSelected = selectedId === ALL_MARKETS_ID;

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      size="narrow"
      figmaNode="737:6015"
      title={t.aiBot.modals.marketType.title}
      subtitle={t.aiBot.modals.marketType.subtitle}
    >
      {allMarketsOption ? (
        <button
          type="button"
          className={`${styles.selectAllButton} ${styles.marketSelectAll}${allSelected ? ` ${styles.selectAllButtonSelected}` : ''}`}
          onClick={() => {
            onSelect(ALL_MARKETS_ID);
            onClose();
          }}
          aria-pressed={allSelected}
        >
          {t.aiBot.modals.marketType[allMarketsOption.titleKey]}
          {allSelected ? ' ✓' : ''}
          <img className={styles.selectAllIcon} src={aiBotAssets.iconSelectAll} alt="" aria-hidden="true" />
        </button>
      ) : null}

      <div className={styles.grid2}>
        {scopedOptions.map((option) => {
          const selected = option.id === selectedId;
          return (
            <button
              key={option.id}
              type="button"
              className={`${styles.optionCard}${selected ? ` ${styles.optionCardSelected}` : ''}`}
              onClick={() => {
                onSelect(option.id);
                onClose();
              }}
            >
              <div className={styles.optionCardHead}>
                <span className={styles.optionIconWrap}>
                  <img className={styles.optionIcon} src={option.icon} alt="" aria-hidden="true" />
                </span>
                {selected ? (
                  <img className={styles.checkIcon} src={aiBotAssets.iconCheck} alt="" aria-hidden="true" />
                ) : null}
              </div>
              <p className={styles.optionTitle}>{t.aiBot.modals.marketType[option.titleKey]}</p>
              <p className={styles.optionDescription}>
                {t.aiBot.modals.marketType[option.descriptionKey]}
              </p>
            </button>
          );
        })}
      </div>
    </AppModal>
  );
}
