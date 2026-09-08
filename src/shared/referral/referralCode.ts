const STORAGE_KEY = 'scaralpha.referralCode';

/** Captures `?ref=CODE` from the URL and persists it so it survives the signup → login redirect chain. */
export function captureReferralCodeFromUrl(search: string): void {
  try {
    const ref = new URLSearchParams(search).get('ref')?.trim();
    if (ref) localStorage.setItem(STORAGE_KEY, ref);
  } catch {
    /* localStorage unavailable (private mode, blocked storage) — best-effort only */
  }
}

export function getStoredReferralCode(): string | undefined {
  try {
    return localStorage.getItem(STORAGE_KEY)?.trim() || undefined;
  } catch {
    return undefined;
  }
}
