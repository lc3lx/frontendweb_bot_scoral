import { useEffect, useState } from 'react';

import { useI18n } from '@i18n';

import { tradesPageService } from './data/tradesService';
import type { TradeCardData, TradeFilterId } from './data/trades.mock';
import styles from './TradesPage.module.css';
import { TradeCard } from './sections/TradeCard';
import { TradeFilters } from './sections/TradeFilters';

type TradesContentProps = {
  figmaNode: string;
};

export function TradesContent({ figmaNode }: TradesContentProps) {
  const { t } = useI18n();
  const [activeFilter, setActiveFilter] = useState<TradeFilterId>('all');
  const [trades, setTrades] = useState<TradeCardData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const items = await tradesPageService.list(activeFilter);
        if (active) setTrades(items);
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : t.trades.empty);
          setTrades([]);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [activeFilter, t.trades.empty]);

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
        {error ? <p className={styles.emptyState}>{error}</p> : null}
        {!error && trades.length === 0 ? (
          <p className={styles.emptyState}>{t.trades.empty}</p>
        ) : (
          trades.map((trade) => <TradeCard key={trade.id} trade={trade} />)
        )}
      </div>
    </div>
  );
}
