import { ApiClientError, authApi } from '@shared/api';
import { tokenStore } from '@shared/auth/tokenStore';
import { t } from '@shared/i18n';
import { getStoredReferralCode } from '@shared/referral/referralCode';
import type { AuthSession, AuthServiceError, BinollaAuthSession, LoginCredentials, SignupPayload } from '../types';

function toAuthError(error: unknown): AuthServiceError {
  if (error instanceof ApiClientError) {
    return { message: error.message };
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return { message: String((error as { message: unknown }).message) };
  }
  return { message: t('auth.authFailed') };
}

function storeSession(result: { accessToken: string; userId: string }): AuthSession {
  tokenStore.setSession(result.accessToken, result.userId);
  return {
    accessToken: result.accessToken,
    userId: result.userId,
  };
}

function storeBinollaSession(result: {
  accessToken: string;
  userId: string;
  access: string;
  connected: boolean;
}): BinollaAuthSession {
  tokenStore.setSession(result.accessToken, result.userId);
  return {
    accessToken: result.accessToken,
    userId: result.userId,
    access: result.access,
    connected: result.connected,
  };
}

export async function loginWithBinolla(credentials: LoginCredentials): Promise<BinollaAuthSession> {
  try {
    const result = await authApi.binollaLogin({
      email: credentials.email.trim(),
      password: credentials.password,
      // Live: signing in must not request the demo balance, which is locked unless an
      // admin unlocked it for this account. Asking for it here failed every login with
      // DEMO_ACCOUNT_LOCKED. Switching to demo afterwards is a separate, gated action.
      accountType: 'Real',
      // Passed through as chosen. A default here would override the server's own
      // fallback, which keeps the user on the venue they are actually linked to.
      broker: credentials.broker,
      // First-time login is also account creation on the backend — attach the referral
      // code (if any was captured from ?ref=) so it isn't lost.
      referralCode: getStoredReferralCode(),
    });
    try {
      localStorage.setItem('scar-alpha-broker', (credentials.broker || 'binolla').toLowerCase());
    } catch {}
    // A human check means the app account is signed in but the broker is not linked yet.
    // The token is stored either way: the guided login needs it to authorise its calls.
    return {
      ...storeBinollaSession(result),
      requiresGuidedLogin: result.requiresGuidedLogin === true,
    };
  } catch (error) {
    throw toAuthError(error);
  }
}

export async function signupWithBinolla(credentials: LoginCredentials): Promise<BinollaAuthSession> {
  try {
    const result = await authApi.binollaSignup({
      email: credentials.email.trim(),
      password: credentials.password,
      accountType: 'Real',
      referralCode: getStoredReferralCode(),
      // Signing up is the FIRST time a venue is recorded for an account, so dropping
      // the choice here is the most expensive place to drop it: a user who picked
      // Quotex got a Binolla account, and every screen afterwards followed that.
      broker: credentials.broker,
    });
    try {
      localStorage.setItem('scar-alpha-broker', (credentials.broker || 'binolla').toLowerCase());
    } catch {}
    return storeBinollaSession(result);
  } catch (error) {
    throw toAuthError(error);
  }
}

export async function login(credentials: LoginCredentials): Promise<AuthSession> {
  try {
    const result = await authApi.login({
      email: credentials.email.trim(),
      password: credentials.password,
    });
    return storeSession(result);
  } catch (error) {
    throw toAuthError(error);
  }
}

export async function signup(payload: SignupPayload): Promise<AuthSession> {
  try {
    const result = await authApi.register({
      email: payload.email.trim(),
      password: payload.password,
      fullName: payload.fullName.trim(),
      country: payload.country.trim(),
      username: payload.telegramId.trim() || undefined,
      referralCode: getStoredReferralCode(),
    });
    return storeSession(result);
  } catch (error) {
    throw toAuthError(error);
  }
}

export async function changePassword(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  try {
    await authApi.changePassword(input);
  } catch (error) {
    throw toAuthError(error);
  }
}

export const authService = {
  login,
  loginWithBinolla,
  signup,
  signupWithBinolla,
  changePassword,
};
