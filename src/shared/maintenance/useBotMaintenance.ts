import { useEffect, useState } from 'react';

import { botApi } from '@shared/api';
import { liveRefresh } from '@shared/live/liveRefresh';

export type MaintenanceState = {
  /** Null while trading is running normally. */
  message: string | null;
} | null;

/**
 * Watches the global "admin stopped every bot" switch.
 *
 * The flag rides on the bot status endpoint the app already polls, so this costs one
 * small request on mount and then follows the shared heartbeat — no dedicated timer.
 *
 * A failed request deliberately does NOT raise maintenance: the app going offline for a
 * moment must not black out every page. Only the server actually saying "maintenance is
 * on" does that.
 */
export function useBotMaintenance(): MaintenanceState {
  const [state, setState] = useState<MaintenanceState>(null);

  useEffect(() => {
    let active = true;

    const check = async () => {
      try {
        const status = await botApi.status();
        if (!active) return;
        setState(
          status?.maintenance?.active ? { message: status.maintenance.message ?? null } : null,
        );
      } catch {
        // Leave the previous value alone — see the note above.
      }
    };

    void check();

    // The heartbeat already runs while the user is on any authenticated page, so the
    // notice appears and clears within a couple of seconds of the admin acting.
    const unsubscribe = liveRefresh.subscribe(() => void check());

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return state;
}
