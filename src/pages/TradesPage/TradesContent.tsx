import { useMemo, useState } from 'react';

import { useI18n } from '@i18n';

import { TRADES_MOCK, filterTrades, type TradeFilterId } from './data/trades.mock';
import styles from './TradesPage.module.css';
import { TradeCard } from './sections/TradeCard';
import { TradeFilters } from './sections/TradeFilters';

type TradesContentProps = {
  figmaNode: string;
};

export function TradesContent({ figmaNode }: TradesContentProps) {
  const { t } = useI18n();
  const [activeFilter, setActiveFilter] = useState<TradeFilterId>('all');

  const filteredTrades = useMemo(
    () => filterTrades(TRADES_MOCK, activeFilter),
    [activeFilter],
  );

  const filterLabels: Record<TradeFilterId, string> = {
    all: t.trades.filters.all,
    live: t.trades.filters.live,
    profit: t.trades.filters.profit,
    loss: t.trades.filters.loss,
    today: t.trades.filters.today,
  };

  return (
    <div className={styles.page} data-figma-node={figmaNode}>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>{t.trades.header.title}</h2>
        <p className={styles.pageSubtitle}>{t.trades.header.subtitle}</p>
      </div>

      <TradeFilters active={activeFilter} labels={filterLabels} onChange={setActiveFilter} />

      <div className={styles.grid}>
        {filteredTrades.length === 0 ? (
          <p className={styles.emptyState}>{t.trades.empty}</p>
        ) : (
          filteredTrades.map((trade) => <TradeCard key={trade.id} trade={trade} />)
        )}
      </div>
    </div>
  );
}
