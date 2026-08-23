import { AppModal } from '@components/AppModal';
import { aiBotAssets } from '@assets';
import { useI18n } from '@i18n';

import { STRATEGY_DETAIL_CONTENT, type BrandedStrategyId } from './aiBotModals.data';
import { RiskBadge } from './RiskBadge';
import styles from './modals.module.css';

type StrategyDetailModalProps = {
  isOpen: boolean;
  strategyId: BrandedStrategyId | null;
  selected: boolean;
  onClose: () => void;
  onBack: () => void;
  onConfirm: (id: BrandedStrategyId) => void;
};

export function StrategyDetailModal({
  isOpen,
  strategyId,
  selected,
  onClose,
  onBack,
  onConfirm,
}: StrategyDetailModalProps) {
  const { t } = useI18n();

  if (!strategyId) return null;

  const content = STRATEGY_DETAIL_CONTENT[strategyId];

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      size="wide"
      figmaNode={content.figmaNode}
      headerStart={
        <button type="button" className={styles.backButton} onClick={onBack} aria-label={t.aiBot.modals.strategyDetail.back}>
          <img className={styles.backIcon} src={aiBotAssets.iconBack} alt="" aria-hidden="true" />
        </button>
      }
      title={t.aiBot.modals.brandedStrategy[content.titleKey]}
      subtitle={t.aiBot.modals.brandedStrategy[content.subtitleKey]}
    >
      <div className={styles.detailLayout}>
        <div className={styles.chartPlaceholder}>
          <img
            className={styles.chartImage}
            src={content.preview}
            alt=""
            aria-hidden="true"
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
          <RiskBadge risk={content.risk} label={t.aiBot.modals.riskLevels[content.risk]} />

          <div className={styles.detailStats}>
            <div className={styles.detailStat}>
              <span className={`${styles.detailStatIconWrap} ${styles.detailStatIconWrapProfit}`}>
                <img className={styles.detailStatIcon} src={aiBotAssets.iconWallet} alt="" aria-hidden="true" />
              </span>
              <span>
                <p className={styles.detailStatLabel}>{t.aiBot.modals.strategyDetail.recommended}</p>
                <p className={styles.detailStatValue}>{content.recommendedBalance}</p>
              </span>
            </div>
            <div className={styles.detailStat}>
              <span className={`${styles.detailStatIconWrap} ${styles.detailStatIconWrapRisk}`}>
                <img className={styles.detailStatIcon} src={aiBotAssets.iconRisk} alt="" aria-hidden="true" />
              </span>
              <span>
                <p className={styles.detailStatLabel}>{t.aiBot.modals.strategyDetail.riskLevel}</p>
                <p className={styles.detailStatValue}>
                  {t.aiBot.modals.riskLevels[content.riskLabelKey]}
                </p>
              </span>
            </div>
          </div>

          <p className={styles.sectionLabel}>{t.aiBot.modals.strategyDetail.aboutTitle}</p>
          <p className={styles.sectionText}>{t.aiBot.modals.strategyDetail[content.aboutKey]}</p>

          <p className={styles.sectionLabel}>{t.aiBot.modals.strategyDetail.howTitle}</p>
          <p className={styles.sectionText}>{t.aiBot.modals.strategyDetail[content.howItWorksKey]}</p>

          <ul className={styles.bulletList}>
            {content.bullets.map((bulletKey) => (
              <li key={bulletKey} className={styles.bulletItem}>
                <img className={styles.bulletIcon} src={aiBotAssets.iconBullet} alt="" aria-hidden="true" />
                {t.aiBot.modals.strategyDetail[bulletKey]}
              </li>
            ))}
          </ul>

          <div className={styles.detailActions}>
            <button type="button" className={styles.ghostAction} onClick={onBack}>
              {t.aiBot.modals.strategyDetail.back}
            </button>
            <button
              type="button"
              className={styles.primaryAction}
              onClick={() => onConfirm(strategyId)}
            >
              <img
                className={styles.primaryActionIcon}
                src={aiBotAssets.iconApplySelected}
                alt=""
                aria-hidden="true"
              />
              {selected ? t.aiBot.modals.strategyDetail.selected : t.aiBot.modals.strategyDetail.select}
            </button>
          </div>
        </div>
      </div>
    </AppModal>
  );
}
