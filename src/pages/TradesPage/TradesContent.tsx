import { useCallback, useEffect, useState } from 'react';

import { dashboardAssets } from '@assets';
import { useI18n } from '@i18n';
import { useLiveData } from '@shared/live/useLiveData';

import { tradesPageService } from './data/tradesService';
import type { TradeCardData, TradeFilterId } from './data/trades.mock';
import styles from './TradesPage.module.css';
import { TradeCard } from './sections/TradeCard';
import { TradeFilters } from './sections/TradeFilters';

type TradesContentProps = {
  figmaNode: string;
};

function TradesBackdrop() {
  return (
    <div className={styles.backdrop} aria-hidden="true">
      <img className={styles.bg} src={dashboardAssets.homeBg} alt="" />
      <span className={styles.veil} />
    </div>
  );
}

export function TradesContent({ figmaNode }: TradesContentProps) {
  const { t } = useI18n();
  const [activeFilter, setActiveFilter] = useState<TradeFilterId>('all');
  const [trades, setTrades] = useState<TradeCardData[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const items = await tradesPageService.list(activeFilter);
      setTrades(items);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.trades.empty);
      setTrades([]);
    }
  }, [activeFilter, t.trades.empty]);

  useLiveData(load, { minIntervalMs: 5_000 });

  // Filter change must reload immediately even inside the throttle window.
  useEffect(() => {
    void load();
  }, [load]);

  const filterLabels: Record<TradeFilterId, string> = {
    all: t.trades.filters.all,
    live: t.trades.filters.live,
    profit: t.trades.filters.profit,
    loss: t.trades.filters.loss,
    today: t.trades.filters.today,
  };

  return (
    <div className={styles.page} data-figma-node={figmaNode}>
      <TradesBackdrop />

      <div className={styles.content}>
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
    </div>
  );
}
