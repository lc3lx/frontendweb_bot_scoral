import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiClientError, binollaApi, meApi } from '@shared/api';
import { invalidateBotSessionCache } from '@shared/api/botSessionCache';
import { tokenStore } from '@shared/auth/tokenStore';
import { t } from '@shared/i18n';

export type AccountMode = 'Demo' | 'Real';

export type SessionProfile = {
  name: string;
  email: string;
  balance: string;
  demoBalance: string;
  realBalance: string;
  accountType: AccountMode;
  loading: boolean;
  switching: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  switchAccount: (next: AccountMode) => Promise<void>;
  toggleAccount: () => Promise<void>;
};

function formatBalance(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '—';
  return `$${value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function normalizeAccountType(value: string | null | undefined): AccountMode {
  const normalized = value?.trim().toLowerCase();
  return normalized === 'demo' ? 'Demo' : 'Real';
}

type CachedProfileData = {
  name: string;
  email: string;
  balance: string;
  demoBalance: string;
  realBalance: string;
  accountType: AccountMode;
};

const PROFILE_STORAGE_KEY = 'scar-alpha-user-profile';
const BALANCE_STORAGE_KEY = 'scar-alpha-last-balance';

function readStoredProfile(): CachedProfileData {
  let bal = '—';
  try {
    const rawBal = localStorage.getItem(BALANCE_STORAGE_KEY);
    if (rawBal && rawBal.trim() && rawBal !== '—') {
      bal = rawBal.trim();
    }
  } catch {
    /* ignore */
  }

  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          name: parsed.name || '',
          email: parsed.email || '',
          balance: parsed.balance && parsed.balance !== '—' ? parsed.balance : bal,
          demoBalance: parsed.demoBalance || '—',
          realBalance: parsed.realBalance || '—',
          accountType: parsed.accountType === 'Demo' ? 'Demo' : 'Real',
        };
      }
    }
  } catch {
    /* ignore */
  }

  return {
    name: '',
    email: '',
    balance: bal,
    demoBalance: '—',
    realBalance: '—',
    accountType: 'Real',
  };
}

let activeProfileData: CachedProfileData =
  typeof window !== 'undefined'
    ? readStoredProfile()
    : {
        name: '',
        email: '',
        balance: '—',
        demoBalance: '—',
        realBalance: '—',
        accountType: 'Real',
      };

const subscribers = new Set<() => void>();

function notifySubscribers() {
  for (const sub of subscribers) {
    try {
      sub();
    } catch {
      /* ignore */
    }
  }
}

function saveActiveProfile(partial: Partial<CachedProfileData>) {
  activeProfileData = { ...activeProfileData, ...partial };
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(activeProfileData));
    if (activeProfileData.balance && activeProfileData.balance !== '—') {
      localStorage.setItem(BALANCE_STORAGE_KEY, activeProfileData.balance);
    }
  } catch {
    /* ignore */
  }
  notifySubscribers();
}

export function useSessionProfile(): SessionProfile {
  const [profileState, setProfileState] = useState(() => ({
    ...activeProfileData,
    loading: activeProfileData.balance === '—',
    switching: false,
    error: null as string | null,
  }));

  const profileRef = useRef(profileState);
  profileRef.current = profileState;

  // Keep all mounted instances across different pages and components in sync.
  useEffect(() => {
    const sync = () => {
      setProfileState((prev) => ({
        ...prev,
        ...activeProfileData,
      }));
    };
    subscribers.add(sync);
    return () => {
      subscribers.delete(sync);
    };
  }, []);

  const refresh = useCallback(async () => {
    if (!tokenStore.isAuthenticated()) {
      setProfileState((prev) => ({
        ...prev,
        loading: false,
      }));
      return;
    }

    try {
      const [me, balance] = await Promise.all([
        meApi.get().catch(() => null),
        binollaApi.balance().catch(() => null),
      ]);

      const name =
        me?.fullName?.trim() || me?.username?.trim() || me?.email?.trim() || activeProfileData.name || t('common.trader');
      const email = me?.email?.trim() || activeProfileData.email || '';
      const accountType = normalizeAccountType(balance?.accountType ?? me?.binolla?.accountType ?? activeProfileData.accountType);

      const updates: Partial<CachedProfileData> = {
        name,
        email,
        accountType,
      };

      if (balance) {
        if (balance.demoBalance != null && balance.demoBalance > 0) {
          updates.demoBalance = formatBalance(balance.demoBalance);
        }
        if (balance.realBalance != null && balance.realBalance > 0) {
          updates.realBalance = formatBalance(balance.realBalance);
        }
        // Retain previous balance if incoming balance is null/0 while warming up
        if (balance.currentBalance != null && (balance.connected || balance.currentBalance > 0)) {
          updates.balance = formatBalance(balance.currentBalance);
        }
      }

      saveActiveProfile(updates);

      setProfileState((current) => ({
        ...current,
        ...activeProfileData,
        loading: false,
        error: null,
      }));
    } catch {
      setProfileState((current) => ({
        ...current,
        loading: false,
      }));
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const switchAccount = useCallback(async (next: AccountMode) => {
    const snapshot = profileRef.current;
    if (snapshot.accountType === next || snapshot.switching) return;

    setProfileState((current) => ({ ...current, switching: true, error: null }));

    try {
      await binollaApi.changeAccountType(next);
      const balance = await binollaApi.balance().catch(() => null);

      const updates: Partial<CachedProfileData> = {
        accountType: normalizeAccountType(balance?.accountType ?? next),
      };

      if (balance?.currentBalance != null && (balance.connected || balance.currentBalance > 0)) {
        updates.balance = formatBalance(balance.currentBalance);
      }
      if (balance?.demoBalance != null) {
        updates.demoBalance = formatBalance(balance.demoBalance);
      }
      if (balance?.realBalance != null) {
        updates.realBalance = formatBalance(balance.realBalance);
      }

      saveActiveProfile(updates);

      setProfileState((current) => ({
        ...current,
        ...activeProfileData,
        switching: false,
        error: null,
      }));

      invalidateBotSessionCache();
      window.location.reload();
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : err instanceof Error
            ? err.message
            : t('api.network');
      setProfileState((current) => ({
        ...current,
        switching: false,
        error: message,
      }));
    }
  }, []);

  const toggleAccount = useCallback(async () => {
    const next: AccountMode = profileRef.current.accountType === 'Demo' ? 'Real' : 'Demo';
    await switchAccount(next);
  }, [switchAccount]);

  return {
    ...profileState,
    refresh,
    switchAccount,
    toggleAccount,
  };
}
