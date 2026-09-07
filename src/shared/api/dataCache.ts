/**
 * Cross-page stale-while-revalidate cache.
 *
 * Two problems this solves, both reported as "the site is slow / empty when I switch
 * pages":
 *
 *  1. Every page refetched from scratch on mount, so navigating Home -> Trades -> Home
 *     showed a blank screen for as long as the round trip took, every single time.
 *     Returning the last known value immediately makes navigation feel instant while a
 *     fresh copy loads behind it.
 *
 *  2. A single failed or racing request left a page with nothing to show, which is why
 *     the trades list sometimes came up empty and needed several manual refreshes.
 *     Here a failure falls back to the previous good value and retries, instead of
 *     surfacing emptiness as if it were the truth.
 *
 * Concurrent callers for the same key share one request, so mounting three components
 * that all need trades costs one fetch, not three.
 */

type Entry<T> = {
  value: T;
  at: number;
  /** Set when the last refresh failed, so callers can show a quiet "stale" hint. */
  stale: boolean;
};

const entries = new Map<string, Entry<unknown>>();
const inFlight = new Map<string, Promise<unknown>>();

export type CachedResult<T> = {
  value: T;
  /** True when this came from cache and a refresh is running behind it. */
  revalidating: boolean;
  /** True when the newest attempt failed and this is the last good value. */
  stale: boolean;
};

export type FetchCachedOptions = {
  /** Serve from cache without refetching while younger than this. */
  freshMs?: number;
  /** Serve stale immediately and refresh in the background up to this age. */
  maxAgeMs?: number;
  /** Attempts for one refresh, including the first. */
  retries?: number;
  /** Skip the cache and force a network read. */
  force?: boolean;
};

const DEFAULTS = {
  freshMs: 3_000,
  maxAgeMs: 5 * 60_000,
  retries: 2,
} as const;

async function withRetry<T>(fetcher: () => Promise<T>, attempts: number): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i += 1) {
    try {
      return await fetcher();
    } catch (error) {
      lastError = error;
      // Short, growing pause. A transient 502 or a session still warming up recovers
      // well within this; a real failure still surfaces quickly.
      if (i < attempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, 250 * (i + 1)));
      }
    }
  }
  throw lastError;
}

/**
 * Reads `key` through the cache. Never throws when a previous value exists — a caller
 * that has shown real data before should keep showing it rather than flashing empty.
 */
export async function fetchCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: FetchCachedOptions = {},
): Promise<CachedResult<T>> {
  const { freshMs, maxAgeMs, retries, force } = { ...DEFAULTS, ...options };
  const existing = entries.get(key) as Entry<T> | undefined;
  const age = existing ? Date.now() - existing.at : Infinity;

  if (!force && existing && age < freshMs) {
    return { value: existing.value, revalidating: false, stale: existing.stale };
  }

  const run = (): Promise<T> => {
    const pending = (inFlight.get(key) as Promise<T> | undefined)
      ?? withRetry(fetcher, retries)
        .then((value) => {
          entries.set(key, { value, at: Date.now(), stale: false });
          return value;
        })
        .catch((error) => {
          const prior = entries.get(key) as Entry<T> | undefined;
          if (prior) {
            prior.stale = true;
            return prior.value;
          }
          throw error;
        })
        .finally(() => {
          inFlight.delete(key);
        });

    inFlight.set(key, pending);
    return pending;
  };

  // Usable but not fresh: hand back what we have and let the refresh land later.
  if (!force && existing && age < maxAgeMs) {
    void run();
    return { value: existing.value, revalidating: true, stale: existing.stale };
  }

  const value = await run();
  const settled = entries.get(key) as Entry<T> | undefined;
  return { value, revalidating: false, stale: settled?.stale ?? false };
}

/** Last known value without triggering a request. */
export function peekCached<T>(key: string): T | undefined {
  return (entries.get(key) as Entry<T> | undefined)?.value;
}

/** Drops one key, or everything when no key is given. */
export function invalidateCached(key?: string): void {
  if (key === undefined) {
    entries.clear();
    inFlight.clear();
    return;
  }
  entries.delete(key);
  inFlight.delete(key);
}

export const CACHE_KEYS = {
  dashboardTrades: 'dashboard:trades',
  tradesList: (filter: string, page: number) => `trades:${filter}:${page}`,
  botStatus: 'bot:status',
  balance: 'binolla:balance',
} as const;
