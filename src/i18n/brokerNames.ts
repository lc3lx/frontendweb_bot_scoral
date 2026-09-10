import type { BrokerId } from '@shared/api/types';
import { BROKER_LINKS } from '@constants/brokers';

/**
 * Rewrites the broker's name throughout a translation bundle.
 *
 * Every mention of a broker in this app refers to the ONE the signed-in user is linked
 * to — "connect your Binolla account", "live market · Binolla", "Binolla id". While
 * Binolla was the only venue those were written as literals, scattered across two dozen
 * strings in two locales. Fixing them one by one guarantees some get missed, and the
 * miss shows up as a Quotex user reading another broker's name on their own trades.
 *
 * So the substitution happens once, here, over the whole bundle: the literal names and
 * the `{broker}` placeholder both become the user's actual broker. When that broker IS
 * Binolla the replacement is a no-op, which is why this is safe to apply unconditionally.
 */

/** Names that stand in for "the user's broker" wherever they appear in copy. */
const BROKER_NAME_PATTERN = /\{broker\}|Binolla|بنولا/g;

export function brokerDisplayName(broker: BrokerId): string {
  return BROKER_LINKS[broker]?.label ?? BROKER_LINKS.binolla.label;
}

/**
 * Deep-copies `bundle`, replacing broker names in every string.
 *
 * Called once per locale/broker change rather than per lookup: translations are read as
 * plain nested properties (`t.aiBot.modals.title`), so there is no per-access hook to
 * intercept, and one pass over the bundle is far cheaper than proxying every read.
 */
export function withBrokerName<T>(bundle: T, broker: BrokerId): T {
  const name = brokerDisplayName(broker);
  return transform(bundle, name) as T;
}

function transform(value: unknown, name: string): unknown {
  if (typeof value === 'string') {
    // Skip the copy entirely when there is nothing to change — most strings never
    // mention a broker, and this keeps the pass close to free.
    BROKER_NAME_PATTERN.lastIndex = 0;
    return BROKER_NAME_PATTERN.test(value)
      ? value.replace(BROKER_NAME_PATTERN, name)
      : value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => transform(item, name));
  }

  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      out[key] = transform(item, name);
    }
    return out;
  }

  return value;
}
