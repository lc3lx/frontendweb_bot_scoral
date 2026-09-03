/** Must stay aligned with backend Strategy:MinPairPayoutPercent (default 75). */
export const MIN_PAIR_PAYOUT_PERCENT = 75;

export function isTradablePairPayout(payout: number | null | undefined): boolean {
  if (payout == null || payout <= 0) return true;
  return payout >= MIN_PAIR_PAYOUT_PERCENT;
}
