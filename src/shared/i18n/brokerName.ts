/**
 * The broker's name inside translated copy.
 *
 * Every mention of a broker in this app means the ONE the signed-in user is linked to:
 * "connect your Binolla account", "live market · Binolla", "waiting for Binolla candles".
 * While Binolla was the only venue those were written as literals — around a hundred of
 * them across two locales and two translation bundles.
 *
 * Substituting them at the point of lookup, rather than editing each string, is what makes
 * the coverage total. The first attempt at this edited only the app bundle and matched only
 * one of the two Arabic spellings in use, so most of the site still said Binolla to a
 * Quotex user. Both spellings and both bundles now go through here.
 */

/** Names that stand in for "the user's broker" wherever they appear in copy. */
const BROKER_NAME_PATTERN = /\{broker\}|Binolla|بينولا|بنولا/g;

/**
 * Keys whose value IS a particular broker's name, not "the user's broker".
 *
 * The login page's platform picker is the one place both venues must be named literally —
 * it is where the user chooses between them. Substituting there rendered both buttons as
 * the same name and made the other option vanish from the page.
 */
const LITERAL_BROKER_KEY = /^binolla\.auth\.broker\./;

export function namesASpecificBroker(key: string): boolean {
  return LITERAL_BROKER_KEY.test(key);
}

let currentName = 'Binolla';

/** Set once the user's broker is known. Defaults to Binolla, which every older link uses. */
export function setBrokerName(name: string): void {
  if (name) currentName = name;
}

export function getBrokerName(): string {
  return currentName;
}

/** Replaces broker names in one string. A no-op when the user is on Binolla. */
export function applyBrokerName(text: string, name: string = currentName): string {
  // Cheap guard: most strings never mention a broker, and `test` on a /g regex needs its
  // index reset or alternate calls return false.
  BROKER_NAME_PATTERN.lastIndex = 0;
  if (!BROKER_NAME_PATTERN.test(text)) return text;
  return text.replace(BROKER_NAME_PATTERN, name);
}
