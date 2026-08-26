import { useCallback, useEffect, useState } from 'react';

import { dashboardAssets, tradingAssets } from '@assets';
import { useI18n } from '@i18n';

import { LIVE_REFRESH_MS, LIVE_TICK_MS, tradingService } from './data/tradingService';
import type { TradingMockData } from './data/trading.mock';
import styles from './TradingPage.module.css';
import { AiSignalPanel } from './sections/AiSignalPanel';
import { TradingTerminal } from './sections/TradingTerminal';

type TradingContentProps = {
  figmaNode: string;
};

function TradingBackdrop() {
  return (
    <div className={styles.backdrop} aria-hidden="true">
      <img className={styles.bg} src={dashboardAssets.homeBg} alt="" />
      <span className={styles.veil} />
    </div>
  );
}

export function TradingContent({ figmaNode }: TradingContentProps) {
  const { t } = useI18n();
  const [data, setData] = useState<TradingMockData | null>(null);

  const load = useCallback(async () => {
    const next = await tradingService.fetchData();
    setData(next);
  }, []);

  useEffect(() => {
    let active = true;

    void (async () => {
      const next = await tradingService.fetchData();
      if (active) setData(next);
    })();

    const refreshTimer = window.setInterval(() => {
      void (async () => {
        try {
          const next = await tradingService.fetchData();
          if (active) setData(next);
        } catch {
          /* ignore */
        }
      })();
    }, LIVE_REFRESH_MS);

    const tickTimer = window.setInterval(() => {
      void (async () => {
        try {
          const price = await tradingService.fetchLivePrice();
          if (!active || price == null) return;
          setData((current) => (current ? tradingService.applyLiveQuote(current, price) : current));
        } catch {
          /* ignore */
        }
      })();
    }, LIVE_TICK_MS);

    return () => {
      active = false;
      window.clearInterval(refreshTimer);
      window.clearInterval(tickTimer);
    };
  }, []);

  if (!data) {
    return (
      <div className={styles.page} data-figma-node={figmaNode}>
        <TradingBackdrop />
        <p className={styles.loading}>…</p>
      </div>
    );
  }

  return (
    <div className={styles.page} data-figma-node={figmaNode}>
      <TradingBackdrop />

      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>{t.trading.header.title}</h2>

        <div className={styles.statusRow}>
          <span className={styles.chipConnected}>
            <span className={styles.chipDotGreen} aria-hidden="true" />
            {t.trading.status.connected}
          </span>
          <span className={styles.chipDemo}>
            <span className={styles.chipDotBlue} aria-hidden="true" />
            {t.trading.status.demo}
          </span>
          <button
            type="button"
            className={styles.iconButton}
            aria-label={t.trading.status.refreshAria}
            onClick={() => void load()}
          >
            <img
              className={styles.iconButtonImg}
              src={tradingAssets.iconRefresh}
              alt=""
              width={16}
              height={16}
              aria-hidden="true"
            />
          </button>
          <button type="button" className={styles.iconButton} aria-label={t.trading.status.externalAria}>
            <img
              className={styles.iconButtonImg}
              src={tradingAssets.iconExternal}
              alt=""
              width={16}
              height={16}
              data-flip-rtl="true"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      <div className={styles.grid}>
        <TradingTerminal data={data} />
        <AiSignalPanel signal={data.signal} />
      </div>
    </div>
  );
}
