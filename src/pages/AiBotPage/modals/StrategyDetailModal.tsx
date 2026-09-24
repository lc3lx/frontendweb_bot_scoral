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

function isRiskFormulaLine(line: string) {
  return line.includes('→') || line.includes('×') || line.includes('=');
}

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
  const riskLines = t.aiBot.modals.strategyDetail.riskHow[content.riskHowKey];
  const [intro, ...exampleLines] = riskLines;

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
      title={
        <span className={styles.modalTitleWhite}>
          {t.aiBot.modals.brandedStrategy[content.titleKey]}
        </span>
      }
      subtitle={
        <span className={styles.modalSubtitleWhite}>
          {t.aiBot.modals.brandedStrategy[content.subtitleKey]}
        </span>
      }
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

        <div className={styles.detailCopy}>
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

          <div className={styles.riskHowBlock}>
            <p className={styles.sectionLabel}>{t.aiBot.modals.strategyDetail.riskHowTitle}</p>
            <p className={styles.sectionText}>{intro}</p>

            <p className={styles.sectionLabel}>{t.aiBot.modals.strategyDetail.riskDescriptionLabel}</p>
            <p className={styles.sectionTextEmphasis}>{t.aiBot.modals.strategyDetail.riskExampleLabel}</p>

            <div className={styles.riskExampleBox}>
              {exampleLines.map((line) => (
                <p
                  key={line}
                  className={`${styles.sectionText}${isRiskFormulaLine(line) ? ` ${styles.riskChain}` : ''}`}
                >
                  {line}
                </p>
              ))}
            </div>
          </div>

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
