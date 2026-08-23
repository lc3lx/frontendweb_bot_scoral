import type { TradeFilterId } from '../data/trades.mock';
import styles from '../TradesPage.module.css';

type TradeFiltersProps = {
  active: TradeFilterId;
  labels: Record<TradeFilterId, string>;
  onChange: (filter: TradeFilterId) => void;
};

const FILTER_ORDER: TradeFilterId[] = ['all', 'live', 'profit', 'loss', 'today'];

export function TradeFilters({ active, labels, onChange }: TradeFiltersProps) {
  return (
    <div className={styles.filters} role="tablist" aria-label={labels.all}>
      {FILTER_ORDER.map((filterId) => (
        <button
          key={filterId}
          type="button"
          role="tab"
          aria-selected={active === filterId}
          className={`${styles.filterButton}${active === filterId ? ` ${styles.filterButtonActive}` : ''}`}
          onClick={() => onChange(filterId)}
        >
          {labels[filterId]}
        </button>
      ))}
    </div>
  );
}
