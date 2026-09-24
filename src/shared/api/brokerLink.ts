import { ApiClientError } from './apiClient';
import { getAccountStatusCached } from './botSessionCache';

/**
 * Shown while the server is bringing the broker socket back.
 * Trades and account switches hold it; the shell also holds it when status says the link is down.
 */

type Listener = (visible: boolean) => void;

let holds = 0;
let watching = false;
const listeners = new Set<Listener>();

function emit(): void {
  const visible = holds > 0 || watching;
  for (const listener of listeners) {
    try {
      listener(visible);
    } catch {
      /* a broken subscriber must not break the request */
    }
  }
}

export function subscribeBrokerLink(listener: Listener): () => void {
  listeners.add(listener);
  listener(holds > 0 || watching);
  return () => {
    listeners.delete(listener);
  };
}

export function holdBrokerLink(): () => void {
  holds += 1;
  emit();
  return () => {
    holds = Math.max(0, holds - 1);
    emit();
  };
}

export function setBrokerLinkWatch(on: boolean): void {
  if (watching === on) return;
  watching = on;
  emit();
}

/** Raise the notice only if the call is still running — a fast trade must not flash it. */
export function armSlowBrokerNotice(afterMs = 1200): () => void {
  let release: (() => void) | null = null;
  const timer = window.setTimeout(() => {
    release = holdBrokerLink();
  }, afterMs);
  return () => {
    window.clearTimeout(timer);
    release?.();
  };
}

export function isBrokerReconnectError(error: unknown): boolean {
  return error instanceof ApiClientError && error.code === 'BROKER_RECONNECTING';
}

/** Poll our server until the broker socket is back, or the account has nothing to restore. */
export async function waitForBrokerLink(timeoutMs = 25000): Promise<boolean> {
  const release = holdBrokerLink();
  const end = Date.now() + timeoutMs;
  try {
    while (Date.now() < end) {
      try {
        const status = await getAccountStatusCached(true);
        if (status.binollaConnected) return true;
        if (status.botAccess === 'BinollaNotConnected' || status.botAccess === 'NotEligible') {
          return false;
        }
      } catch {
        /* the next poll retries */
      }
      await new Promise((resolve) => window.setTimeout(resolve, 2000));
    }
    return false;
  } finally {
    release();
  }
}
