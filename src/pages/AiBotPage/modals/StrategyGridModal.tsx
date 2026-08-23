import { AppModal } from '@components/AppModal';
import { aiBotAssets } from '@assets';
import { useI18n } from '@i18n';

import { STRATEGY_GRID_OPTIONS, type StrategyGridId } from './aiBotModals.data';
import { RiskBadge } from './RiskBadge';
import styles from './modals.module.css';

type StrategyGridModalProps = {
  isOpen: boolean;
  selectedId: StrategyGridId;
  onClose: () => void;
  onSelect: (id: StrategyGridId) => void;
};

export function StrategyGridModal({ isOpen, selectedId, onClose, onSelect }: StrategyGridModalProps) {
  const { t } = useI18n();

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      size="compact"
      figmaNode="737:6713"
      title={
        <>
          {t.aiBot.modals.strategyGrid.titlePrefix}
          <span className={styles.titleRegular}>{t.aiBot.modals.strategyGrid.titleEmphasis}</span>
        </>
      }
      subtitle={t.aiBot.modals.strategyGrid.subtitle}
    >
      <div className={styles.strategyGrid}>
        {STRATEGY_GRID_OPTIONS.map((option) => {
          const selected = option.id === selectedId;
          return (
            <button
              key={option.id}
              type="button"
              className={`${styles.strategyCard}${selected ? ` ${styles.strategyCardSelected}` : ''}`}
              onClick={() => {
                onSelect(option.id);
                onClose();
              }}
            >
              <img
                className={styles.strategyPreview}
                src={option.preview}
                alt=""
                aria-hidden="true"
              />
              <div className={styles.strategyCardHead}>
                <p className={styles.strategyCardTitle}>
                  {t.aiBot.modals.strategyGrid[option.titleKey]}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <RiskBadge
                    risk={option.risk}
                    label={t.aiBot.modals.riskLevels[option.risk]}
                  />
                  {selected ? (
                    <img className={styles.checkIcon} src={aiBotAssets.iconCheck} alt="" aria-hidden="true" />
                  ) : null}
                </div>
              </div>
              <p className={styles.strategyCardDescription}>
                {t.aiBot.modals.strategyGrid[option.descriptionKey]}
              </p>
              <p className={styles.strategyCardBestFor}>
                {t.aiBot.modals.strategyGrid[option.bestForKey]}
              </p>
            </button>
          );
        })}
      </div>
    </AppModal>
  );
}
