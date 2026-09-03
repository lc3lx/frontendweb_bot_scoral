import { tradesApi } from '@shared/api';

/**
 * One live-data heartbeat for the whole app.
 *
 * Every page used to run its own `setInterval` — the trading page alone had four, and
 * they all kept firing while the tab was in the background. That is most of why the app
 * felt heavy, and it still left the customer refreshing by hand when a trade settled,
 * because a page only learned about a change on its own next tick.
 *
 * This replaces all of that with a single poller that:
 *  - runs fast only while something is actually moving (a trade open, the bot running),
 *  - stops completely when the tab is hidden, and catches up the moment it is shown,
 *  - fires trade-change events immediately when open trades move,
 *  - also fires a periodic `heartbeat` so balance / bot / lists stay fresh without a
 *    manual browser refresh.
 *
 * Subscribers get told *what* changed, so a page can refetch just the part it shows.
 */

export type LiveChange =
  /** A trade moved from open to settled, or a new one appeared. */
  | 'trade-opened'
  | 'trade-settled'
  /** Open-trade count or any of their statuses shifted. */
  | 'trades-changed'
  /** Periodic nudge so pages keep balance / bot / lists current. */
  | 'heartbeat';

export type LiveListener = (changes: readonly LiveChange[]) => void;

/** While a trade is live the screen is being watched — keep it close to real time. */
const ACTIVE_INTERVAL_MS = 2_000;

/** Nothing open: still current, but nowhere near the old 3-4s churn. */
const IDLE_INTERVAL_MS = 10_000;

/**
 * How often subscribers get a heartbeat even when no trade status changed.
 * Keeps Home / Trades / Bot balance from going stale until the user refreshes.
 */
const HEARTBEAT_MS = 8_000;

/** A tab that has been hidden this long refetches immediately when shown again. */
const STALE_ON_SHOW_MS = 3_000;

type Snapshot = {
  /** trade id -> status, for the open/recent window only. */
  statuses: Map<string, string>;
  openCount: number;
};

const listeners = new Set<LiveListener>();
let timer: number | null = null;
let inFlight = false;
let lastPollAt = 0;
let lastHeartbeatAt = 0;
let snapshot: Snapshot | null = null;
let currentIntervalMs = IDLE_INTERVAL_MS;

function emit(changes: readonly LiveChange[]): void {
  if (changes.length === 0) return;
  for (const listener of [...listeners]) {
    try {
      listener(changes);
    } catch {
      /* a broken subscriber must not stop the others */
    }
  }
}

function diff(previous: Snapshot | null, next: Snapshot): LiveChange[] {
  // First poll establishes the baseline; reporting everything as "changed" here would
  // make every page refetch twice on load.
  if (!previous) return [];

  const changes: LiveChange[] = [];
  let opened = false;
  let settled = false;

  for (const [id, status] of next.statuses) {
    const before = previous.statuses.get(id);
    if (before === undefined) {
      if (isOpen(status)) opened = true;
      continue;
    }
    if (before === status) continue;
    if (isOpen(before) && !isOpen(status)) settled = true;
  }

  // A trade that dropped out of the window entirely also counts as settled.
  for (const [id, status] of previous.statuses) {
    if (isOpen(status) && !next.statuses.has(id)) settled = true;
  }

  if (opened) changes.push('trade-opened');
  if (settled) changes.push('trade-settled');
  if (changes.length > 0 || previous.openCount !== next.openCount) {
    changes.push('trades-changed');
  }
  return changes;
}

function isOpen(status: string): boolean {
  return status === 'Running' || status === 'Pending';
}

async function poll(): Promise<void> {
  if (inFlight) return;
  inFlight = true;
  try {
    // One small page is enough: only the newest trades can change state.
    const response = await tradesApi.list({ page: 1, pageSize: 20 });
    const statuses = new Map<string, string>();
    let openCount = 0;
    for (const item of response.items) {
      const status = String(item.status ?? '');
      statuses.set(String(item.id), status);
      if (isOpen(status)) openCount += 1;
    }

    const next: Snapshot = { statuses, openCount };
    const changes: LiveChange[] = [...diff(snapshot, next)];
    snapshot = next;
    lastPollAt = Date.now();

    // An open trade is about to settle; a quiet account is not worth polling hard.
    setInterval_(openCount > 0 ? ACTIVE_INTERVAL_MS : IDLE_INTERVAL_MS);

    const now = Date.now();
    if (changes.length > 0 || now - lastHeartbeatAt >= HEARTBEAT_MS || lastHeartbeatAt === 0) {
      lastHeartbeatAt = now;
      if (!changes.includes('heartbeat')) changes.push('heartbeat');
      emit(changes);
    }
  } catch {
    // Offline or a failed request: back off rather than hammering.
    setInterval_(IDLE_INTERVAL_MS);
  } finally {
    inFlight = false;
  }
}

function setInterval_(ms: number): void {
  if (ms === currentIntervalMs && timer !== null) return;
  currentIntervalMs = ms;
  restart();
}

function restart(): void {
  stopTimer();
  if (listeners.size === 0) return;
  if (typeof document !== 'undefined' && document.hidden) return;
  timer = window.setInterval(() => void poll(), currentIntervalMs);
}

function stopTimer(): void {
  if (timer !== null) {
    window.clearInterval(timer);
    timer = null;
  }
}

function onVisibilityChange(): void {
  if (document.hidden) {
    // Background tabs cost nothing. This is the single biggest saving here: the app used
    // to keep four intervals and their renders alive in every backgrounded tab.
    stopTimer();
    return;
  }
  restart();
  if (Date.now() - lastPollAt > STALE_ON_SHOW_MS) void poll();
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', onVisibilityChange);
  window.addEventListener('focus', onVisibilityChange);
}

export const liveRefresh = {
  /**
   * Subscribe to server-state changes. The poller starts with the first subscriber and
   * stops with the last, so a page that is not mounted costs nothing.
   */
  subscribe(listener: LiveListener): () => void {
    listeners.add(listener);
    if (listeners.size === 1) {
      restart();
      void poll();
    }
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) stopTimer();
    };
  },

  /** Force an immediate check — call right after placing or closing a trade. */
  refreshNow(): void {
    void poll();
  },

  /** Test seam. */
  reset(): void {
    stopTimer();
    listeners.clear();
    snapshot = null;
    lastPollAt = 0;
    lastHeartbeatAt = 0;
    currentIntervalMs = IDLE_INTERVAL_MS;
  },
};
