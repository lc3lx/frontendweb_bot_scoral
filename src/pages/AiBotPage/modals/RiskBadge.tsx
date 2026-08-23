import type { RiskLevel } from './aiBotModals.data';
import styles from './modals.module.css';

type RiskBadgeProps = {
  risk: RiskLevel;
  label: string;
};

const riskClass: Record<RiskLevel, string> = {
  low: styles.riskLow,
  medium: styles.riskMedium,
  high: styles.riskHigh,
  highPlus: styles.riskHighPlus,
};

export function RiskBadge({ risk, label }: RiskBadgeProps) {
  return (
    <span className={`${styles.riskBadge} ${riskClass[risk]}`}>
      <span className={styles.riskDot} aria-hidden="true" />
      {label}
    </span>
  );
}
