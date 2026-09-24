import { memo, useCallback, useEffect, useRef, useState } from 'react';

import { aiBotAssets } from '@assets';
import { useI18n } from '@i18n';
import { formatPairLabel } from '@shared/market/pairDisplay';

import { SIGNAL_ROTATE_MS, type BotRunState } from './data/aiBot.mock';
import { aiBotService, type AiBotPairRsi } from './data/aiBotService';
import { pairMatchesMarketType, type MarketTypeId } from './modals/aiBotModals.data';
import styles from './AiBotPage.module.css';

type LiveSignal = {
  signal: string;
  signalSide: 'up' | 'down' | 'none';
  strength: string;
  backtest: string;
  backtestReady: boolean;
  updated: string;
  freshSeconds: number;
  market: string;
};

type AiBotSignalPanelProps = {
  botName: string;
  botState: BotRunState;
  stopReason: string | null;
  indicator: string;
  strategy: string;
  tradingPairIds: string[];
  tradingPairLabel: string;
  marketTypeId: MarketTypeId | string;
};

function isAllPairs(ids: string[]): boolean {
  return (
    ids.length === 0 ||
    ids.some((id) => id.trim() === '*' || id.trim().toLowerCase() === 'all')
  );
}

function AiBotSignalPanelComponent({
  botName,
  botState,
  stopReason,
  indicator,
  strategy,
  tradingPairIds,
  tradingPairLabel,
  marketTypeId,
}: AiBotSignalPanelProps) {
  const { t } = useI18n();
  const [live, setLive] = useState<LiveSignal>({
    signal: '—',
    signalSide: 'none',
    strength: '—',
    backtest: '—',
    backtestReady: false,
    updated: '—',
    freshSeconds: 0,
    market: tradingPairLabel || '—',
  });
  const [board, setBoard] = useState<AiBotPairRsi[]>([]);
  const [doorOpen, setDoorOpen] = useState(false);
  const [softSwap, setSoftSwap] = useState(false);

  const softSwapTimerRef = useRef<number | null>(null);
  const candleAtRef = useRef(0);
  const coreKeyRef = useRef('');
  const doorOpenRef = useRef(false);
  const rotateRef = useRef(0);
  const lastRotateAtRef = useRef(0);
  const refreshGenRef = useRef(0);
  const pairsRef = useRef(tradingPairIds);
  const marketRef = useRef(marketTypeId);
  pairsRef.current = tradingPairIds;
  marketRef.current = marketTypeId;

  const applyLive = useCallback((next: LiveSignal, animate: boolean) => {
    setLive((prev) => {
      if (
        prev.signal === next.signal &&
        prev.signalSide === next.signalSide &&
        prev.strength === next.strength &&
        prev.backtest === next.backtest &&
        prev.updated === next.updated &&
        prev.freshSeconds === next.freshSeconds &&
        prev.market === next.market
      ) {
        return prev;
      }
      return next;
    });
    if (!animate) return;
    setSoftSwap(true);
    if (softSwapTimerRef.current) window.clearTimeout(softSwapTimerRef.current);
    softSwapTimerRef.current = window.setTimeout(() => {
      setSoftSwap(false);
      softSwapTimerRef.current = null;
    }, 280);
  }, []);

  useEffect(() => {
    return () => {
      if (softSwapTimerRef.current) window.clearTimeout(softSwapTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      const candleAt = candleAtRef.current;
      if (!candleAt) return;
      const next = Math.max(0, Math.floor((Date.now() - candleAt) / 1000));
      setLive((prev) => (prev.freshSeconds === next ? prev : { ...prev, freshSeconds: next }));
    }, 250);
    return () => window.clearInterval(id);
  }, []);

  const refreshBoard = useCallback(async () => {
    if (typeof document !== 'undefined' && document.hidden && !doorOpenRef.current) return;
    const gen = ++refreshGenRef.current;

    try {
      const selected = pairsRef.current;
      const scanIds = isAllPairs(selected) ? ['*'] : selected;
      const rows = (await aiBotService.fetchSignalBoard(scanIds)).filter((row) =>
        pairMatchesMarketType(row.asset, marketRef.current),
      );
      if (gen !== refreshGenRef.current) return;
      setBoard(rows);

      const now = Date.now();
      if (now - lastRotateAtRef.current >= 2000) {
        rotateRef.current += 1;
        lastRotateAtRef.current = now;
      }
      const picked = rows.length > 0 ? aiBotService.pickLiveSnapshot(rows, rotateRef.current) : null;
      if (!picked) {
        applyLive(
          {
            signal: '—',
            signalSide: 'none',
            strength: '—',
            backtest: '—',
            backtestReady: false,
            updated: '—',
            freshSeconds: 0,
            market: tradingPairLabel || '—',
          },
          false,
        );
        return;
      }

      const candleAt = picked.candleTimeMs > 0 ? picked.candleTimeMs : Date.now();
      candleAtRef.current = candleAt;
      const coreKey = `${picked.signal}|${picked.rsiLabel}|${picked.marketLabel}|${picked.backtestLabel}|${picked.skipReason}`;
      const animate = coreKey !== coreKeyRef.current;
      coreKeyRef.current = coreKey;
      applyLive(
        {
          signal: picked.signal,
          signalSide: picked.signalSide,
          strength: picked.rsiLabel,
          backtest: picked.backtestLabel,
          backtestReady: picked.backtestReady,
          updated: new Date().toLocaleTimeString('en-GB', { hour12: false }),
          freshSeconds: Math.max(0, Math.floor((Date.now() - candleAt) / 1000)),
          market: picked.marketLabel,
        },
        animate,
      );
    } catch {
      /* keep the last board */
    }
  }, [applyLive, tradingPairLabel]);

  useEffect(() => {
    void refreshBoard();
    const id = window.setInterval(() => {
      void refreshBoard();
    }, SIGNAL_ROTATE_MS);

    const onVisibility = () => {
      if (!document.hidden) void refreshBoard();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [refreshBoard, tradingPairIds, marketTypeId]);

  const stateLabel =
    botState === 'running'
      ? t.aiBot.status.running
      : botState === 'paused'
        ? t.aiBot.status.paused
        : t.aiBot.status.stopped;

  const stopReasonLabel =
    stopReason === 'DAILY_PROFIT_TARGET_REACHED'
      ? t.aiBot.status.profitTargetReached
      : stopReason === 'DAILY_LOSS_LIMIT_REACHED'
        ? t.aiBot.status.lossLimitReached
        : null;

  const stateChipClass =
    botState === 'running'
      ? styles.stateChipRunning
      : botState === 'paused'
        ? styles.stateChipPaused
        : styles.stateChipStopped;

  const scanCountLabel = isAllPairs(tradingPairIds)
    ? t.aiBot.status.scanningPairs.replace('{count}', String(Math.max(board.length, 1)))
    : tradingPairIds.length > 1
      ? t.aiBot.status.scanningPairs.replace('{count}', String(tradingPairIds.length))
      : null;

  const signalRows = [
    {
      id: 'signal',
      label: t.aiBot.status.signal,
      value: live.signal,
      tone:
        live.signalSide === 'up'
          ? styles.signalUp
          : live.signalSide === 'down'
            ? styles.signalDown
            : '',
      ltr: true,
      opensDoor: true,
    },
    { id: 'strength', label: t.aiBot.status.strength, value: live.strength, ltr: true },
    {
      id: 'backtest',
      label: t.aiBot.status.backtest,
      value: live.backtest,
      tone: live.backtestReady ? styles.signalUp : '',
      ltr: true,
    },
    { id: 'indicator', label: t.aiBot.status.indicator, value: indicator },
    { id: 'strategy', label: t.aiBot.status.strategy, value: strategy },
    {
      id: 'market',
      label: t.aiBot.status.market,
      value: live.market || formatPairLabel(tradingPairIds[0] ?? '') || tradingPairLabel,
      ltr: true,
    },
    { id: 'updated', label: t.aiBot.status.updated, value: live.updated, ltr: true },
  ];

  return (
    <section className={`${styles.homeCard} ${styles.signalCard}`} aria-label={t.aiBot.status.aria}>
      <div className={styles.statusHead}>
        <div className={styles.botIconWrap}>
          <img
            className={styles.botIcon}
            src={aiBotAssets.iconBotLarge}
            alt=""
            width={28}
            height={28}
            aria-hidden="true"
          />
        </div>
        <div className={styles.statusCopy}>
          <p className={styles.statusName}>{botName}</p>
          <div className={styles.statusMeta}>
            <span className={`${styles.stateChip} ${stateChipClass}`}>
              <span className={styles.stateDot} aria-hidden="true" />
              {stateLabel}
            </span>
            <span className={styles.freshChip}>
              {t.aiBot.status.fresh.replace('{seconds}', String(live.freshSeconds))}
            </span>
            {isAllPairs(tradingPairIds) ? (
              <span className={styles.rotateChip}>جميع الأزواج النشطة (تلقائي)</span>
            ) : scanCountLabel ? (
              <span className={styles.rotateChip}>{scanCountLabel}</span>
            ) : null}
          </div>
          {stopReasonLabel && botState === 'stopped' ? (
            <p className={styles.stopReason}>{stopReasonLabel}</p>
          ) : null}
        </div>
      </div>

      <div className={`${styles.signalGrid}${softSwap ? ` ${styles.signalGridPulse}` : ''}`}>
        {signalRows.map((row) =>
          row.opensDoor ? (
            <button
              key={row.id}
              type="button"
              className={`${styles.signalCell} ${styles.signalDoorTrigger}`}
              onClick={() => {
                doorOpenRef.current = true;
                setDoorOpen(true);
                void refreshBoard();
              }}
              aria-expanded={doorOpen}
              aria-controls="ai-bot-signal-door"
              title={t.aiBot.status.pairsDoorHint}
            >
              <p className={styles.signalLabel}>{row.label}</p>
              <p
                className={`${styles.signalValue}${row.tone ? ` ${row.tone}` : ''}${
                  row.ltr ? ` ${styles.ltrValue}` : ''
                }`}
              >
                {row.value}
                <span className={styles.signalDoorCaret} aria-hidden="true" />
              </p>
            </button>
          ) : (
            <div key={row.id} className={styles.signalCell}>
              <p className={styles.signalLabel}>{row.label}</p>
              <p
                className={`${styles.signalValue}${row.tone ? ` ${row.tone}` : ''}${
                  row.ltr ? ` ${styles.ltrValue}` : ''
                }`}
              >
                {row.value}
              </p>
            </div>
          ),
        )}
      </div>

      {doorOpen ? (
        <div
          id="ai-bot-signal-door"
          className={styles.signalDoor}
          role="dialog"
          aria-label={t.aiBot.status.pairsDoorTitle}
        >
          <div className={styles.signalDoorHead}>
            <div>
              <p className={styles.signalDoorTitle}>{t.aiBot.status.pairsDoorTitle}</p>
              <p className={styles.signalDoorHint}>{t.aiBot.status.pairsDoorHint}</p>
            </div>
            <button
              type="button"
              className={styles.signalDoorClose}
              onClick={() => {
                doorOpenRef.current = false;
                setDoorOpen(false);
              }}
            >
              {t.aiBot.status.pairsDoorClose}
            </button>
          </div>
          <div className={styles.signalDoorCols} aria-hidden="true">
            <span>{t.aiBot.status.market}</span>
            <span>{t.aiBot.status.signal}</span>
            <span>{t.aiBot.status.strength}</span>
            <span>{t.aiBot.status.backtest}</span>
          </div>
          <ul className={styles.signalDoorList}>
            {board.length === 0 ? (
              <li className={styles.signalDoorEmpty}>{t.aiBot.status.waitingMarket}</li>
            ) : (
              board.map((row) => (
                <li key={row.asset} className={styles.signalDoorRow}>
                  <span className={`${styles.signalDoorPair} ${styles.ltrValue}`}>
                    {row.marketLabel}
                  </span>
                  <span
                    className={`${styles.signalDoorSide}${
                      row.signalSide === 'up'
                        ? ` ${styles.signalUp}`
                        : row.signalSide === 'down'
                          ? ` ${styles.signalDown}`
                          : ''
                    }`}
                  >
                    {row.signal}
                  </span>
                  <span className={`${styles.signalDoorRsi} ${styles.ltrValue}`}>
                    {row.rsiLabel}
                  </span>
                  <span
                    className={`${styles.signalDoorBacktest} ${styles.ltrValue}${
                      row.backtestReady ? ` ${styles.signalUp}` : ''
                    }`}
                  >
                    {row.backtestLabel}
                  </span>
                  {row.skipReason ? (
                    <span className={styles.signalDoorReason}>{formatSkipReason(row.skipReason, t)}</span>
                  ) : null}
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

function formatSkipReason(
  code: string,
  t: { aiBot: { status: { skipWin: string; skipPayout: string; skipPayoutValue: string } } },
): string {
  return code
    .split('|')
    .filter(Boolean)
    .map((part) => {
      if (part === 'WIN_CONDITION') return t.aiBot.status.skipWin;
      if (part.startsWith('LOW_PAYOUT')) {
        const n = part.split(':')[1];
        return n ? t.aiBot.status.skipPayoutValue.replace('{n}', n) : t.aiBot.status.skipPayout;
      }
      return '';
    })
    .filter(Boolean)
    .join(' · ');
}

export const AiBotSignalPanel = memo(AiBotSignalPanelComponent);
