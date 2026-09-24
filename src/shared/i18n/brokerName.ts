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
const BROKER_NAME_PATTERN = /\{broker\}|Binolla|Quotex|بينولا|بنولا|كوتكس/g;

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

function resolveInitialBroker(): 'quotex' | 'binolla' {
  try {
    const stored = localStorage.getItem('scar-alpha-broker');
    if (stored && stored.toLowerCase().includes('binolla')) return 'binolla';
  } catch {}
  return 'quotex';
}

let currentBroker: 'quotex' | 'binolla' = resolveInitialBroker();
let currentName = currentBroker === 'binolla' ? 'Binolla' : 'Quotex';

/** Set once the user's broker is known. Defaults to Quotex. */
export function setBrokerName(name: string): void {
  if (!name) return;
  const norm = name.trim().toLowerCase();
  if (norm.includes('binolla') || norm.includes('بينولا')) {
    currentBroker = 'binolla';
    currentName = 'Binolla';
  } else {
    currentBroker = 'quotex';
    currentName = 'Quotex';
  }
}

export function getBrokerName(): string {
  return currentName;
}

const HAS_ARABIC = /[\u0600-\u06FF]/;

/** Replaces broker names in one string according to active broker and language context. */
export function applyBrokerName(text: string, name: string = currentName): string {
  if (!text) return text;

  let activeBroker: 'quotex' | 'binolla' = currentBroker;
  if (name) {
    const norm = name.trim().toLowerCase();
    if (norm.includes('binolla') || norm.includes('بينولا')) {
      activeBroker = 'binolla';
    } else if (norm.includes('quotex') || norm.includes('كوتكس')) {
      activeBroker = 'quotex';
    }
  }

  const isArabicContext = HAS_ARABIC.test(text);

  BROKER_NAME_PATTERN.lastIndex = 0;
  if (!BROKER_NAME_PATTERN.test(text)) return text;

  BROKER_NAME_PATTERN.lastIndex = 0;
  return text.replace(BROKER_NAME_PATTERN, (match) => {
    const isArabicMatch = HAS_ARABIC.test(match);
    if (isArabicContext || isArabicMatch) {
      return activeBroker === 'binolla' ? 'بينولا' : 'كوتكس';
    }
    return activeBroker === 'binolla' ? 'Binolla' : 'Quotex';
  });
}

