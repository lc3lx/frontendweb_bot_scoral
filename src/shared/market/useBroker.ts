import { useEffect, useState } from 'react';

import { fetchCached } from '@shared/api/dataCache';
import { binollaApi } from '@shared/api/endpoints';
import { BROKER_LINKS } from '@constants/brokers';
import { DEFAULT_BROKER, type BrokerId } from '@shared/api/types';

/**
 * Which broker the signed-in user actually trades on.
 *
 * The bot's own screens name the venue in their labels — the market picker used to say
 * "Binolla Market" to everyone — and a Quotex user reading Binolla's name there has no
 * way to tell whether the setting even applies to them. The link decides it, so the UI
 * has to ask rather than assume.
 *
 * Cached across pages: this is read by several screens at once and changes only when a
 * user re-links their account.
 */
const CACHE_KEY = 'broker:current';

export function normalizeBroker(value: string | null | undefined): BrokerId {
  const key = String(value ?? '').trim().toLowerCase();
  return key in BROKER_LINKS ? (key as BrokerId) : DEFAULT_BROKER;
}

/** Display name, e.g. "Quotex". */
export function brokerLabel(broker: BrokerId | string | null | undefined): string {
  return BROKER_LINKS[normalizeBroker(broker)].label;
}

export function useBroker(): BrokerId {
  const [broker, setBroker] = useState<BrokerId>(DEFAULT_BROKER);

  useEffect(() => {
    let active = true;
    void fetchCached(CACHE_KEY, () => binollaApi.status(), { freshMs: 30_000 })
      .then((result) => {
        if (active) setBroker(normalizeBroker(result.value.broker));
      })
      // The default is what every account predating the broker choice uses, so a failed
      // lookup shows the right name for the overwhelming majority rather than nothing.
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return broker;
}
