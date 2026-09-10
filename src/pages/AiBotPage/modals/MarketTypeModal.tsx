import { AppModal } from '@components/AppModal';
import { aiBotAssets } from '@assets';
import { useI18n } from '@i18n';

import { brokerLabel, useBroker } from '@shared/market/useBroker';

import { MARKET_TYPE_OPTIONS, type MarketTypeId } from './aiBotModals.data';
import styles from './modals.module.css';

/** Fills the {broker} placeholder so one string serves every venue. */
function withBroker(text: string, broker: string): string {
  return text.replace(/\{broker\}/g, broker);
}

type MarketTypeModalProps = {
  isOpen: boolean;
  selectedId: MarketTypeId;
  onClose: () => void;
  onSelect: (id: MarketTypeId) => void;
};

export function MarketTypeModal({ isOpen, selectedId, onClose, onSelect }: MarketTypeModalProps) {
  const { t } = useI18n();
  // The OTC option belongs to whichever venue the user is on. Naming Binolla to a Quotex
  // user made the setting read as if it were about someone else's account.
  const broker = brokerLabel(useBroker());

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      size="narrow"
      figmaNode="737:6015"
      title={t.aiBot.modals.marketType.title}
      subtitle={t.aiBot.modals.marketType.subtitle}
    >
      <div className={styles.grid2}>
        {MARKET_TYPE_OPTIONS.map((option) => {
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
              <p className={styles.optionTitle}>
                {withBroker(t.aiBot.modals.marketType[option.titleKey], broker)}
              </p>
              <p className={styles.optionDescription}>
                {withBroker(t.aiBot.modals.marketType[option.descriptionKey], broker)}
              </p>
            </button>
          );
        })}
      </div>
    </AppModal>
  );
}
