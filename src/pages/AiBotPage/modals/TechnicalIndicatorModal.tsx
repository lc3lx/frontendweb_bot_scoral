import { AppModal } from '@components/AppModal';
import { aiBotAssets } from '@assets';
import { useI18n } from '@i18n';

import { BRANDED_STRATEGY_OPTIONS, type BrandedStrategyId } from './aiBotModals.data';
import { RiskBadge } from './RiskBadge';
import styles from './modals.module.css';

type TechnicalIndicatorModalProps = {
  isOpen: boolean;
  selectedId: BrandedStrategyId;
  onClose: () => void;
  onSelect: (id: BrandedStrategyId) => void;
  onViewDetails: (id: BrandedStrategyId) => void;
};

export function TechnicalIndicatorModal({
  isOpen,
  selectedId,
  onClose,
  onSelect,
  onViewDetails,
}: TechnicalIndicatorModalProps) {
  const { t } = useI18n();

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      size="wide"
      figmaNode="737:7411"
      title={
        <span className={styles.modalTitleWhite}>
          {t.aiBot.modals.technicalIndicator.titlePrefix}
          {t.aiBot.modals.technicalIndicator.titleEmphasis}
        </span>
      }
      subtitle={
        <span className={styles.modalSubtitleWhite}>
          {t.aiBot.modals.technicalIndicator.subtitle}
        </span>
      }
    >
      <div className={styles.brandedGrid}>
        {BRANDED_STRATEGY_OPTIONS.map((option) => {
          const selected = option.id === selectedId;
          return (
            <div
              key={option.id}
              className={`${styles.brandedCard}${selected ? ` ${styles.brandedCardSelected}` : ''}`}
            >
              <button
                type="button"
                className={styles.brandedCardTop}
                style={{ border: 0, background: 'transparent', padding: 0, width: '100%', textAlign: 'start', cursor: 'pointer' }}
                onClick={() => onSelect(option.id)}
              >
                <span className={styles.brandedPreviewWrap}>
                  <img className={styles.brandedPreview} src={option.preview} alt="" aria-hidden="true" />
                </span>
                <span className={styles.brandedCopy}>
                  <span className={styles.brandedTitleRow}>
                    <p className={styles.brandedTitle}>
                      {t.aiBot.modals.brandedStrategy[option.titleKey]}
                    </p>
                    {selected ? (
                      <img className={styles.checkIcon} src={aiBotAssets.iconCheck} alt="" aria-hidden="true" />
                    ) : null}
                  </span>
                  <p className={styles.brandedDescription}>
                    {t.aiBot.modals.brandedStrategy[option.descriptionKey]}
                  </p>
                  <div className={styles.brandedRiskRow}>
                    <RiskBadge
                      risk={option.risk}
                      label={t.aiBot.modals.riskLevels[option.risk]}
                    />
                  </div>
                </span>
              </button>
              <div className={styles.brandedFooter}>
                <span>
                  <p className={styles.balanceLabel}>{t.aiBot.modals.technicalIndicator.balanceLabel}</p>
                  <p className={styles.balanceValue}>{option.balance}</p>
                </span>
                <button
                  type="button"
                  className={styles.viewDetails}
                  onClick={() => onViewDetails(option.id)}
                >
                  {t.aiBot.modals.technicalIndicator.viewDetails}
                  <img
                    className={styles.viewDetailsIcon}
                    src={aiBotAssets.iconChevron}
                    alt=""
                    aria-hidden="true"
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </AppModal>
  );
}
