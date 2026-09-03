import { memo, useCallback, useEffect, useRef, useState } from 'react';

import { aiBotAssets } from '@assets';
import { useI18n } from '@i18n';
import { formatPairLabel } from '@shared/market/pairDisplay';

import { SIGNAL_ROTATE_MS, type BotRunState } from './data/aiBot.mock';
import { aiBotService, type AiBotSignalSnapshot } from './data/aiBotService';
import styles from './AiBotPage.module.css';

type LiveSignal = {
  signal: string;
  signalSide: 'up' | 'down' | 'none';
  strength: string;
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
};

function AiBotSignalPanelComponent({
  botName,
  botState,
  stopReason,
  indicator,
  strategy,
  tradingPairIds,
  tradingPairLabel,
}: AiBotSignalPanelProps) {
  const { t } = useI18n();
  const [live, setLive] = useState<LiveSignal>({
    signal: '—',
    signalSide: 'none',
    strength: '—',
    updated: '—',
    freshSeconds: 0,
    market: tradingPairLabel || '—',
  });
  const [softSwap, setSoftSwap] = useState(false);

  const rotateIndexRef = useRef(0);
  const tradablePairIdsRef = useRef<string[]>([]);
  const softSwapTimerRef = useRef<number | null>(null);
  const pairsRef = useRef(tradingPairIds);
  pairsRef.current = tradingPairIds;

  const applyLive = useCallback((next: LiveSignal, animate: boolean) => {
    setLive((prev) => {
      if (
        prev.signal === next.signal &&
        prev.signalSide === next.signalSide &&
        prev.strength === next.strength &&
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
    void aiBotService.listTradingPairs().then((pairs) => {
      const tradable = new Set(pairs.filter((pair) => pair.tradable).map((pair) => pair.id));
      tradablePairIdsRef.current = pairsRef.current.filter((id) => tradable.has(id));
    });
  }, [tradingPairIds]);

  useEffect(() => {
    return () => {
      if (softSwapTimerRef.current) window.clearTimeout(softSwapTimerRef.current);
    };
  }, []);

  const rotateSignal = useCallback(async () => {
    if (typeof document !== 'undefined' && document.hidden) return;

    const pairs =
      tradablePairIdsRef.current.length > 0
        ? tradablePairIdsRef.current
        : pairsRef.current.filter(Boolean);
    if (pairs.length === 0) return;

    const index = rotateIndexRef.current % pairs.length;
    const asset = pairs[index]!;
    rotateIndexRef.current = (index + 1) % pairs.length;

    const snapshot: AiBotSignalSnapshot | null = await aiBotService.fetchSignalSnapshot(asset);
    if (!snapshot) return;

    applyLive(
      {
        signal: snapshot.signal,
        signalSide: snapshot.signalSide,
        strength: snapshot.strength,
        updated: snapshot.updated,
        freshSeconds: snapshot.freshSeconds,
        market: snapshot.marketLabel,
      },
      true,
    );
  }, [applyLive]);

  useEffect(() => {
    void rotateSignal();
    const id = window.setInterval(() => {
      void rotateSignal();
    }, SIGNAL_ROTATE_MS);

    const onVisibility = () => {
      if (!document.hidden) void rotateSignal();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [rotateSignal]);

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

  const signalRows = [
    {
      label: t.aiBot.status.signal,
      value: live.signal,
      tone:
        live.signalSide === 'up'
          ? styles.signalUp
          : live.signalSide === 'down'
            ? styles.signalDown
            : '',
      ltr: true,
    },
    { label: t.aiBot.status.strength, value: live.strength, ltr: true },
    { label: t.aiBot.status.indicator, value: indicator },
    { label: t.aiBot.status.strategy, value: strategy },
    {
      label: t.aiBot.status.market,
      value: live.market || formatPairLabel(tradingPairIds[0] ?? '') || tradingPairLabel,
      ltr: true,
    },
    { label: t.aiBot.status.updated, value: live.updated, ltr: true },
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
            {tradingPairIds.length > 1 ? (
              <span className={styles.rotateChip}>
                {t.aiBot.status.scanningPairs.replace('{count}', String(tradingPairIds.length))}
              </span>
            ) : null}
          </div>
          {stopReasonLabel && botState === 'stopped' ? (
            <p className={styles.stopReason}>{stopReasonLabel}</p>
          ) : null}
        </div>
      </div>

      <div className={`${styles.signalGrid}${softSwap ? ` ${styles.signalGridPulse}` : ''}`}>
        {signalRows.map((row) => (
          <div key={row.label} className={styles.signalCell}>
            <p className={styles.signalLabel}>{row.label}</p>
            <p
              className={`${styles.signalValue}${row.tone ? ` ${row.tone}` : ''}${
                row.ltr ? ` ${styles.ltrValue}` : ''
              }`}
            >
              {row.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export const AiBotSignalPanel = memo(AiBotSignalPanelComponent);
