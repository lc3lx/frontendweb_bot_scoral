import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ApiClientError, binollaApi, meApi } from '@shared/api';
import { invalidateBotSessionCache } from '@shared/api/botSessionCache';
import { armSlowBrokerNotice, isBrokerReconnectError, waitForBrokerLink } from '@shared/api/brokerLink';
import { tokenStore } from '@shared/auth/tokenStore';
import { t } from '@shared/i18n';
import { liveRefresh } from '@shared/live/liveRefresh';

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
const REAL_BALANCE_STORAGE_KEY = 'scar-alpha-real-balance';
const DEMO_BALANCE_STORAGE_KEY = 'scar-alpha-demo-balance';

function readStoredProfile(): CachedProfileData {
  let bal = '—';
  let realBal = '—';
  let demoBal = '—';

  try {
    const rawBal = localStorage.getItem(BALANCE_STORAGE_KEY);
    if (rawBal && rawBal.trim() && rawBal !== '—') bal = rawBal.trim();
    const rawReal = localStorage.getItem(REAL_BALANCE_STORAGE_KEY);
    if (rawReal && rawReal.trim() && rawReal !== '—') realBal = rawReal.trim();
    const rawDemo = localStorage.getItem(DEMO_BALANCE_STORAGE_KEY);
    if (rawDemo && rawDemo.trim() && rawDemo !== '—') demoBal = rawDemo.trim();
  } catch {
    /* ignore */
  }

  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        const storedAccountType: AccountMode = parsed.accountType === 'Demo' ? 'Demo' : 'Real';
        const finalReal = parsed.realBalance && parsed.realBalance !== '—' ? parsed.realBalance : realBal;
        const finalDemo = parsed.demoBalance && parsed.demoBalance !== '—' ? parsed.demoBalance : demoBal;
        const finalBal =
          parsed.balance && parsed.balance !== '—'
            ? parsed.balance
            : storedAccountType === 'Demo'
              ? (finalDemo !== '—' ? finalDemo : bal)
              : (finalReal !== '—' ? finalReal : bal);

        return {
          name: parsed.name || '',
          email: parsed.email || '',
          balance: finalBal,
          demoBalance: finalDemo,
          realBalance: finalReal,
          accountType: storedAccountType,
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
    demoBalance: demoBal,
    realBalance: realBal,
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
    } else {
      localStorage.removeItem(BALANCE_STORAGE_KEY);
    }
    if (activeProfileData.realBalance && activeProfileData.realBalance !== '—') {
      localStorage.setItem(REAL_BALANCE_STORAGE_KEY, activeProfileData.realBalance);
    } else {
      localStorage.removeItem(REAL_BALANCE_STORAGE_KEY);
    }
    if (activeProfileData.demoBalance && activeProfileData.demoBalance !== '—') {
      localStorage.setItem(DEMO_BALANCE_STORAGE_KEY, activeProfileData.demoBalance);
    } else {
      localStorage.removeItem(DEMO_BALANCE_STORAGE_KEY);
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
      const accountType = normalizeAccountType(
        balance?.connected
          ? (balance?.accountType ?? me?.binolla?.accountType ?? activeProfileData.accountType)
          : (me?.binolla?.accountType ?? activeProfileData.accountType)
      );

      const updates: Partial<CachedProfileData> = {
        name,
        email,
        accountType,
      };

      if (balance) {
        if (balance.demoBalance != null && balance.connected) {
          updates.demoBalance = formatBalance(balance.demoBalance);
        }
        if (balance.realBalance != null && balance.connected) {
          updates.realBalance = formatBalance(balance.realBalance);
        }
        // Retain previous balance if incoming balance is null/0 while warming up
        if (balance.currentBalance != null && (balance.connected || balance.currentBalance > 0)) {
          updates.balance = formatBalance(balance.currentBalance);
        }
      }

      if ((!updates.balance || updates.balance === '—') && me?.binolla?.balance != null && me.binolla.balance > 0) {
        updates.balance = formatBalance(me.binolla.balance);
      }

      if (!updates.balance || updates.balance === '—') {
        const targetType = updates.accountType ?? activeProfileData.accountType;
        if (targetType === 'Demo') {
          const d = updates.demoBalance ?? activeProfileData.demoBalance;
          if (d && d !== '—') updates.balance = d;
        } else {
          const r = updates.realBalance ?? activeProfileData.realBalance;
          if (r && r !== '—') updates.balance = r;
        }
      }

      if (!updates.balance || updates.balance === '—') {
        if (activeProfileData.balance && activeProfileData.balance !== '—') {
          updates.balance = activeProfileData.balance;
        }
      }

      if (!balance?.connected) {
        updates.balance = '—';
        updates.demoBalance = '—';
        updates.realBalance = '—';
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

let moduleSubscribed = false;
function setupLiveSync() {
  if (moduleSubscribed || typeof window === 'undefined') return;
  moduleSubscribed = true;

  liveRefresh.subscribe((changes) => {
    if (
      changes.includes('trade-settled') ||
      changes.includes('heartbeat') ||
      changes.includes('trades-changed')
    ) {
      if (tokenStore.isAuthenticated()) {
        binollaApi
          .balance()
          .then((bal) => {
            if (!bal?.connected) {
              saveActiveProfile({ balance: '—', demoBalance: '—', realBalance: '—' });
              return;
            }
            const updates: Partial<CachedProfileData> = { accountType: normalizeAccountType(bal.accountType) };
            if (bal.demoBalance != null && bal.connected) updates.demoBalance = formatBalance(bal.demoBalance);
            if (bal.realBalance != null && bal.connected) updates.realBalance = formatBalance(bal.realBalance);
            if (bal.currentBalance != null && (bal.connected || bal.currentBalance > 0)) {
              updates.balance = formatBalance(bal.currentBalance);
            }
            if (Object.keys(updates).length > 0) saveActiveProfile(updates);
          })
          .catch(() => null);
      }
    }
  });

  window.addEventListener('scar-alpha-balance-updated', (e: Event) => {
    const customEvent = e as CustomEvent<string>;
    if (customEvent.detail) {
      saveActiveProfile({ balance: customEvent.detail });
    }
  });
}

  useEffect(() => {
    setupLiveSync();
    void refresh();
  }, [refresh]);

  const switchAccount = useCallback(async (next: AccountMode) => {
    const snapshot = profileRef.current;
    if (snapshot.accountType === next || snapshot.switching) return;

    setProfileState((current) => ({ ...current, switching: true, error: null }));

    const disarm = armSlowBrokerNotice();
    try {
      try {
        await binollaApi.changeAccountType(next);
      } catch (error) {
        if (!isBrokerReconnectError(error)) throw error;
        const back = await waitForBrokerLink();
        if (!back) throw error;
        await binollaApi.changeAccountType(next);
      }
      const balance = await binollaApi.balance().catch(() => null);

      const updates: Partial<CachedProfileData> = {
        accountType: normalizeAccountType(balance?.accountType ?? next),
      };

      if (balance?.currentBalance != null && (balance.connected || balance.currentBalance > 0)) {
        updates.balance = formatBalance(balance.currentBalance);
      }
      if (balance?.demoBalance != null && balance.connected) {
        updates.demoBalance = formatBalance(balance.demoBalance);
      }
      if (balance?.realBalance != null && balance.connected) {
        updates.realBalance = formatBalance(balance.realBalance);
      }

      if (!updates.balance || updates.balance === '—') {
        const nextBal =
          next === 'Demo'
            ? (updates.demoBalance && updates.demoBalance !== '—' ? updates.demoBalance : activeProfileData.demoBalance)
            : (updates.realBalance && updates.realBalance !== '—' ? updates.realBalance : activeProfileData.realBalance);
        if (nextBal && nextBal !== '—') {
          updates.balance = nextBal;
        }
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
    } finally {
      disarm();
    }
  }, []);

  const toggleAccount = useCallback(async () => {
    const next: AccountMode = profileRef.current.accountType === 'Demo' ? 'Real' : 'Demo';
    await switchAccount(next);
  }, [switchAccount]);

  return useMemo(
    () => ({
      ...profileState,
      refresh,
      switchAccount,
      toggleAccount,
    }),
    [profileState, refresh, switchAccount, toggleAccount],
  );
}
