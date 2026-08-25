import { ApiClientError, authApi } from '@shared/api';
import { tokenStore } from '@shared/auth/tokenStore';
import { t } from '@shared/i18n';
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
      accountType: 'Demo',
    });
    return storeBinollaSession(result);
  } catch (error) {
    throw toAuthError(error);
  }
}

export async function signupWithBinolla(credentials: LoginCredentials): Promise<BinollaAuthSession> {
  try {
    const result = await authApi.binollaSignup({
      email: credentials.email.trim(),
      password: credentials.password,
      accountType: 'Demo',
    });
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
