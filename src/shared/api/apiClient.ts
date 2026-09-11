import { t } from '@shared/i18n';
import { tokenStore } from '@shared/auth/tokenStore';
import { beginRequest, endRequest } from './requestActivity';
import type { ApiErrorBody } from './types';

export class ApiClientError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
    this.status = status;
  }
}

function resolveBaseUrl(): string {
  const raw = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (raw !== undefined && raw.trim() === '') {
    return '';
  }

  const base = raw?.trim();
  if (base) {
    return base.replace(/\/+$/, '');
  }

  if (import.meta.env.DEV) {
    return '';
  }

  throw new ApiClientError('CONFIG_ERROR', t('api.configMissing'), 0);
}

function getActiveBrokerName(): 'Quotex' | 'Binolla' {
  try {
    const raw = localStorage.getItem('scar-alpha-broker') || localStorage.getItem('scar-alpha-user-profile');
    if (raw && raw.toLowerCase().includes('quotex')) return 'Quotex';
  } catch {
    /* ignore */
  }
  return 'Binolla';
}

function mapMessage(code: string, fallback: string): string {
  const broker = getActiveBrokerName();
  let text = fallback?.trim() ?? '';
  if (text) {
    if (broker === 'Quotex' && /binolla/i.test(text) && !/quotex/i.test(text)) {
      text = text.replace(/binolla/gi, 'Quotex');
    }
    if (/quotex|binolla/i.test(text)) {
      return text;
    }
  }
  switch (code) {
    case 'BINOLLA_NOT_CONNECTED':
      return broker === 'Quotex' ? 'Connect your Quotex account to continue.' : t('api.binollaNotConnected');
    case 'BINOLLA_SESSION_EXPIRED':
      return broker === 'Quotex' ? 'Quotex session expired.' : t('api.binollaSessionExpired');
    case 'BINOLLA_LOGIN_FAILED':
      return text ? text : (broker === 'Quotex' ? 'Quotex login failed.' : t('api.binollaLoginFailed'));
    case 'BINOLLA_CONNECTION_FAILED':
      return broker === 'Quotex' ? 'Quotex connection failed.' : t('api.binollaConnectionFailed');
    case 'ADMIN_APPROVAL_REQUIRED':
      return t('api.adminApprovalRequired');
    case 'NOT_ELIGIBLE':
      return t('api.notEligible');
    case 'FORBIDDEN':
      // Keep the server's reason when it gave one — it names the actual blocker
      // (unapproved account, no Binolla link, admin role) and the generic sentence
      // hides it, leaving an admin with nothing to act on.
      return fallback?.trim() ? fallback : t('api.forbidden');
    case 'MARKET_UNAVAILABLE':
      return t('api.marketUnavailable');
    case 'INSUFFICIENT_BALANCE':
      return t('api.insufficientBalance');
    case 'RATE_LIMITED':
      return t('api.rateLimited');
    case 'INVALID_TRADE':
      return t('api.invalidTrade');
    case 'DEMO_ACCOUNT_LOCKED':
      return t('api.demoAccountLocked');
    case 'PAYOUT_BELOW_MINIMUM':
      return t('api.payoutBelowMinimum');
    case 'PAYOUT_INSUFFICIENT_BALANCE':
      return t('api.payoutInsufficientBalance');
    case 'PAYOUT_PENDING_EXISTS':
      return t('api.payoutPendingExists');
    case 'STRATEGY_DISABLED':
      return t('api.strategyDisabled');
    case 'STRATEGY_NOT_FOUND':
      return t('api.strategyNotFound');
    case 'REAL_TRADING_DISABLED':
      return t('api.realTradingDisabled');
    case 'TELEGRAM_AUTH_INVALID':
      return t('api.telegramAuthInvalid');
    case 'UNAUTHORIZED':
      return t('api.unauthorized');
    case 'EMAIL_TAKEN':
      return t('api.emailTaken');
    case 'TELEGRAM_TAKEN':
      return t('api.telegramTaken');
    case 'INVALID_CREDENTIALS':
      return fallback?.trim() ? fallback : t('api.invalidCredentials');
    case 'PASSWORD_NOT_SET':
      return t('api.passwordNotSet');
    default:
      return fallback || t('common.errorGeneric');
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const baseUrl = resolveBaseUrl();
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...options.headers,
  };

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const auth = options.auth !== false;
  if (auth) {
    const token = tokenStore.getAccessToken();
    if (!token) {
      throw new ApiClientError('UNAUTHORIZED', mapMessage('UNAUTHORIZED', t('api.notAuthenticated')), 401);
    }
    headers.Authorization = `Bearer ${token}`;
  }

  // Counted around the network call only, so the shell can show that the app is waiting
  // on the server. Ended in `finally` — an aborted or failed request that never decremented
  // would leave the indicator spinning for the rest of the session.
  let response: Response;
  beginRequest();
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method: options.method ?? (options.body !== undefined ? 'POST' : 'GET'),
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: options.signal,
    });
  } catch {
    throw new ApiClientError('NETWORK_ERROR', t('api.network'), 0);
  } finally {
    endRequest();
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text) as unknown;
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    const err = (payload ?? {}) as Partial<ApiErrorBody>;
    const code = err.code ?? (response.status === 401 ? 'UNAUTHORIZED' : 'REQUEST_FAILED');
    const message = mapMessage(
      code,
      err.message ?? t('api.requestFailed', { status: response.status }),
    );

    if (response.status === 401 && (code === 'UNAUTHORIZED' || code === 'TELEGRAM_AUTH_INVALID')) {
      tokenStore.clear();
    }

    throw new ApiClientError(code, message, response.status);
  }

  return payload as T;
}

export function createIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `idem-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
