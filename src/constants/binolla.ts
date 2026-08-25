/**
 * Binolla is the broker platform users log into / register on.
 * Primary in-app path: POST /api/binolla/signup (server Playwright).
 * External fallback: referral signup URL.
 */
export const BINOLLA_REFERRAL_SIGNUP_URL =
  'https://binolla.com/signup/?lid=15968' as const;
export const BINOLLA_LOGIN_URL = 'https://binolla.com/login/' as const;
