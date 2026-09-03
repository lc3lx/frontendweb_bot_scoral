import { useEffect, useRef } from 'react';

import { liveRefresh, type LiveChange } from '@shared/live/liveRefresh';

type Options = {
  /**
   * Minimum gap between reloads. Heartbeats can arrive every few seconds while a trade
   * is open; pages with heavier fetches should stay closer to 8–10s.
   */
  minIntervalMs?: number;
  /** Reload immediately when these change kinds arrive (default: all trade events). */
  urgent?: readonly LiveChange[];
  enabled?: boolean;
};

const DEFAULT_URGENT: readonly LiveChange[] = [
  'trade-opened',
  'trade-settled',
  'trades-changed',
];

/**
 * Keeps a page's data fresh without a manual browser refresh.
 * Uses the shared liveRefresh poller (pauses in background tabs).
 */
export function useLiveData(
  reload: () => void | Promise<void>,
  { minIntervalMs = 8_000, urgent = DEFAULT_URGENT, enabled = true }: Options = {},
): void {
  const reloadRef = useRef(reload);
  reloadRef.current = reload;
  const lastAtRef = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    let active = true;

    const run = (force: boolean) => {
      if (!active) return;
      const now = Date.now();
      if (!force && now - lastAtRef.current < minIntervalMs) return;
      lastAtRef.current = now;
      void reloadRef.current();
    };

    // First paint after mount.
    run(true);

    const unsubscribe = liveRefresh.subscribe((changes) => {
      // #region agent log
      fetch('http://127.0.0.1:7892/ingest/aea6d51e-f3e9-4c7e-b6b4-db55c4306e97',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'281dcf'},body:JSON.stringify({sessionId:'281dcf',runId:'pre-fix',hypothesisId:'C',location:'useLiveData.ts:subscribe',message:'liveRefresh event',data:{changes:[...changes],minIntervalMs},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      const isUrgent = changes.some((change) => urgent.includes(change));
      run(isUrgent);
    });

    const onVisibility = () => {
      if (!document.hidden) run(true);
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      active = false;
      unsubscribe();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [enabled, minIntervalMs, urgent]);
}
