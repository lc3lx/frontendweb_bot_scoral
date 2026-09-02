import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { dashboardAssets, tradingAssets } from '@assets';
import { useI18n } from '@i18n';
import { ApiClientError } from '@shared/api';
import { tradeService } from '@services/trades';
import { liveRefresh } from '@shared/live/liveRefresh';
import type { TradeRecord } from '@services/trades';

import {
  LIVE_REFRESH_MS,
  LIVE_TICK_MS,
  PERIOD_SEC,
  candleExpiryRemaining,
  formatMmSs,
  resolveEntryFromCandles,
  tradingService,
} from './data/tradingService';
import type { TradingMockData, TradingPairOption } from './data/trading.mock';
import styles from './TradingPage.module.css';
import { AiSignalPanel } from './sections/AiSignalPanel';
import type { ChartEntryMarker } from './sections/CandlestickChart';
import { TradingTerminal } from './sections/TradingTerminal';

type TradingContentProps = {
  figmaNode: string;
};

type ActiveTradeClock = {
  endsAt: number;
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
  const [pairs, setPairs] = useState<TradingPairOption[]>([]);
  const [expiry, setExpiry] = useState(() => formatMmSs(candleExpiryRemaining(PERIOD_SEC)));
  /** Last published countdown text — see the tick effect for why this guard exists. */
  const lastExpiryRef = useRef(expiry);
  const [placing, setPlacing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackTone, setFeedbackTone] = useState<'ok' | 'err' | null>(null);
  const [activeTrade, setActiveTrade] = useState<ActiveTradeClock | null>(null);
  const [liveTrade, setLiveTrade] = useState<TradeRecord | null>(null);
  const [localEntryPrice, setLocalEntryPrice] = useState<number | undefined>();
  const seenTradeIdRef = useRef<string | null>(null);
  const dataRef = useRef(data);
  dataRef.current = data;

  const load = useCallback(async () => {
    const next = await tradingService.fetchData();
    setData(next);
  }, []);

  const loadPairs = useCallback(async () => {
    const next = await tradingService.listPairs();
    setPairs(next);
  }, []);

  const syncLiveTrade = useCallback(async () => {
    const newest = await tradingService.fetchNewestLiveTrade();
    if (!newest) {
      setLiveTrade(null);
      setLocalEntryPrice(undefined);
      return;
    }

    const currentSymbol = tradingService.getSelectedAsset();
    const isNew = seenTradeIdRef.current !== newest.id;
    if (isNew) {
      seenTradeIdRef.current = newest.id;
      if (currentSymbol && newest.pair.toLowerCase() !== currentSymbol.toLowerCase()) {
        tradingService.setSelectedAsset(newest.pair);
        setLocalEntryPrice(undefined);
        await load();
      }
      const durationSec = newest.durationSeconds ?? 60;
      setActiveTrade({ endsAt: newest.openedAt + durationSec * 1000 });
    }

    const forChart = await tradingService.fetchActiveTrade(tradingService.getSelectedAsset());
    setLiveTrade(forChart);
    if (!forChart) setLocalEntryPrice(undefined);
  }, [load]);

  useEffect(() => {
    let active = true;

    void (async () => {
      const next = await tradingService.fetchData();
      if (active) setData(next);
      void loadPairs();
      void syncLiveTrade();
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

    // Trade state comes from the shared heartbeat instead of a private 4s timer: it
    // polls fast only while something is open, sleeps in a hidden tab, and calls back the
    // moment a trade opens or settles — which is what removes the manual refresh.
    const unsubscribeLive = liveRefresh.subscribe((changes) => {
      void syncLiveTrade();
      if (changes.includes('trade-settled')) {
        // Balance and history moved with it.
        void (async () => {
          try {
            const next = await tradingService.fetchData();
            if (active) setData(next);
          } catch {
            /* ignore */
          }
        })();
      }
    });

    const unsubscribe = tradeService.subscribe(() => {
      void syncLiveTrade();
      liveRefresh.refreshNow();
    });

    return () => {
      active = false;
      window.clearInterval(refreshTimer);
      window.clearInterval(tickTimer);
      unsubscribeLive();
      unsubscribe();
    };
  }, [loadPairs, syncLiveTrade]);

  useEffect(() => {
    // The countdown is checked 4x a second so a expiry is caught promptly, but the
    // displayed mm:ss only changes once a second. Writing state on every check
    // re-rendered this whole page — chart included — four times a second, which was the
    // bulk of the interface feeling heavy. Only publish an actual change.
    const tick = () => {
      const next = activeTrade
        ? formatMmSs(Math.max(0, Math.ceil((activeTrade.endsAt - Date.now()) / 1000)))
        : formatMmSs(candleExpiryRemaining(PERIOD_SEC));

      if (next !== lastExpiryRef.current) {
        lastExpiryRef.current = next;
        setExpiry(next);
      }

      if (activeTrade && activeTrade.endsAt - Date.now() <= 0) {
        setActiveTrade(null);
        setLiveTrade(null);
        setLocalEntryPrice(undefined);
      }
    };

    tick();
    let id = window.setInterval(tick, 250);

    // A hidden tab does not need a countdown at all.
    const onVisibility = () => {
      window.clearInterval(id);
      if (!document.hidden) {
        tick();
        id = window.setInterval(tick, 250);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [activeTrade]);

  const entryMarker = useMemo<ChartEntryMarker | null>(() => {
    if (!liveTrade || !data) return null;
    const resolved = resolveEntryFromCandles(data.candles, liveTrade.openedAt);
    return {
      timeSec: resolved.timeSec,
      price: localEntryPrice ?? resolved.price,
      direction: liveTrade.direction,
      label: t.trading.terminal.chartEntry,
    };
  }, [data, liveTrade, localEntryPrice, t.trading.terminal.chartEntry]);

  const onAmountChange = useCallback((value: string) => {
    tradingService.setAmount(value);
    setData((current) => (current ? { ...current, amount: value.replace(/[^\d.]/g, '') } : current));
  }, []);

  const onCycleDuration = useCallback(() => {
    const next = tradingService.cycleDuration();
    setData((current) => (current ? { ...current, duration: next.label } : current));
  }, []);

  const onSelectPair = useCallback(
    async (symbol: string) => {
      tradingService.setSelectedAsset(symbol);
      setLocalEntryPrice(undefined);
      setLiveTrade(null);
      await load();
      void syncLiveTrade();
    },
    [load, syncLiveTrade],
  );

  const onPlaceTrade = useCallback(
    async (direction: 'up' | 'down') => {
      if (placing) return;
      setPlacing(true);
      setFeedback(null);
      setFeedbackTone(null);
      try {
        const priceNow = Number.parseFloat(dataRef.current?.price ?? '');
        await tradingService.placeTrade(direction);
        const durationSec = tradingService.getDurationSeconds();
        setActiveTrade({ endsAt: Date.now() + durationSec * 1000 });
        if (Number.isFinite(priceNow)) setLocalEntryPrice(priceNow);
        setFeedback(t.trading.terminal.placed);
        setFeedbackTone('ok');
        void load();
        void syncLiveTrade();
      } catch (err) {
        const message =
          err instanceof ApiClientError
            ? err.message || t.trading.terminal.placeFailed
            : err instanceof Error && err.message
              ? err.message
              : t.trading.terminal.placeFailed;
        setFeedback(message);
        setFeedbackTone('err');
      } finally {
        setPlacing(false);
        window.setTimeout(() => {
          setFeedback(null);
          setFeedbackTone(null);
        }, 4500);
      }
    },
    [load, placing, syncLiveTrade, t.trading.terminal.placeFailed, t.trading.terminal.placed],
  );

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
        <TradingTerminal
          data={data}
          expiry={expiry}
          placing={placing}
          feedback={feedback}
          feedbackTone={feedbackTone}
          pairs={pairs}
          entryMarker={entryMarker}
          onAmountChange={onAmountChange}
          onCycleDuration={onCycleDuration}
          onPlaceTrade={(direction) => void onPlaceTrade(direction)}
          onSelectPair={(symbol) => void onSelectPair(symbol)}
        />
        <AiSignalPanel signal={data.signal} />
      </div>
    </div>
  );
}
