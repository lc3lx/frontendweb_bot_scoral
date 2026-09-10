/**
 * How many API requests are in flight right now.
 *
 * The app fetches from many places at once — a page mount, the live heartbeat, a chart
 * poll — and none of them individually knows whether the screen as a whole is waiting.
 * Counting centrally is what lets one indicator tell the truth without every screen
 * having to thread a `loading` flag up to the shell.
 *
 * Deliberately not a React context: `apiRequest` is a plain function called from services
 * and effects, long before any component is involved.
 */

type Listener = (pending: number) => void;

let pending = 0;
const listeners = new Set<Listener>();

function emit(): void {
  for (const listener of listeners) {
    try {
      listener(pending);
    } catch {
      // A broken subscriber must never break the request that triggered it.
    }
  }
}

export function beginRequest(): void {
  pending += 1;
  emit();
}

export function endRequest(): void {
  // Guarded: a double-end would drive the count negative and leave the indicator stuck
  // on for the rest of the session.
  pending = Math.max(0, pending - 1);
  emit();
}

export function pendingRequests(): number {
  return pending;
}

export function subscribeRequestActivity(listener: Listener): () => void {
  listeners.add(listener);
  listener(pending);
  return () => {
    listeners.delete(listener);
  };
}
