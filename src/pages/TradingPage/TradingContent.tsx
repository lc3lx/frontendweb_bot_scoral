import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { dashboardAssets, tradingAssets } from '@assets';
import { useI18n } from '@i18n';
import { ApiClientError } from '@shared/api';
import { tradeService } from '@services/trades';
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

const LIVE_TRADE_POLL_MS = 4_000;

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

    const tradeTimer = window.setInterval(() => {
      void syncLiveTrade();
    }, LIVE_TRADE_POLL_MS);

    const unsubscribe = tradeService.subscribe(() => {
      void syncLiveTrade();
    });

    return () => {
      active = false;
      window.clearInterval(refreshTimer);
      window.clearInterval(tickTimer);
      window.clearInterval(tradeTimer);
      unsubscribe();
    };
  }, [loadPairs, syncLiveTrade]);

  useEffect(() => {
    const tick = () => {
      if (activeTrade) {
        const left = Math.max(0, Math.ceil((activeTrade.endsAt - Date.now()) / 1000));
        setExpiry(formatMmSs(left));
        if (left <= 0) {
          setActiveTrade(null);
          setLiveTrade(null);
          setLocalEntryPrice(undefined);
        }
        return;
      }
      setExpiry(formatMmSs(candleExpiryRemaining(PERIOD_SEC)));
    };
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
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
