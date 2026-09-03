import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiClientError, binollaApi, meApi } from '@shared/api';
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
  return normalized === 'real' || normalized === 'live' ? 'Real' : 'Demo';
}

const idleProfile = {
  name: '',
  email: '',
  balance: '—',
  demoBalance: '—',
  realBalance: '—',
  accountType: 'Demo' as AccountMode,
  loading: true,
  switching: false,
  error: null as string | null,
};

export function useSessionProfile(): SessionProfile {
  const [profile, setProfile] = useState(idleProfile);
  const profileRef = useRef(profile);
  profileRef.current = profile;

  const refresh = useCallback(async () => {
    if (!tokenStore.isAuthenticated()) {
      setProfile({
        ...idleProfile,
        loading: false,
      });
      return;
    }

    try {
      const [me, balance] = await Promise.all([
        meApi.get(),
        binollaApi.balance().catch(() => null),
      ]);
      const name =
        me.fullName?.trim() || me.username?.trim() || me.email?.trim() || t('common.trader');
      const email = me.email?.trim() || '';
      const accountType = normalizeAccountType(balance?.accountType ?? me.binolla?.accountType);
      const demoBalance = formatBalance(balance?.demoBalance);
      const realBalance = formatBalance(balance?.realBalance);
      const currentBalance = formatBalance(balance?.currentBalance);
      setProfile((current) => ({
        ...current,
        name,
        email,
        balance: currentBalance,
        demoBalance,
        realBalance,
        accountType,
        loading: false,
        error: null,
      }));
    } catch {
      setProfile((current) => ({
        ...current,
        name: current.name || t('common.trader'),
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

    // #region agent log
    fetch('http://127.0.0.1:7892/ingest/aea6d51e-f3e9-4c7e-b6b4-db55c4306e97',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'281dcf'},body:JSON.stringify({sessionId:'281dcf',runId:'pre-fix',hypothesisId:'A,E',location:'useSessionProfile.ts:switchAccount:start',message:'account switch requested',data:{from:snapshot.accountType,to:next,headerBalance:snapshot.balance,demoBalance:snapshot.demoBalance,realBalance:snapshot.realBalance},timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    setProfile((current) => ({ ...current, switching: true, error: null }));

    try {
      await binollaApi.changeAccountType(next);
      const balance = await binollaApi.balance().catch(() => null);
      // #region agent log
      fetch('http://127.0.0.1:7892/ingest/aea6d51e-f3e9-4c7e-b6b4-db55c4306e97',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'281dcf'},body:JSON.stringify({sessionId:'281dcf',runId:'pre-fix',hypothesisId:'E',location:'useSessionProfile.ts:switchAccount:afterApi',message:'account switch api result',data:{requested:next,apiAccountType:balance?.accountType ?? null,currentBalance:balance?.currentBalance ?? null,demoBalance:balance?.demoBalance ?? null,realBalance:balance?.realBalance ?? null},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      setProfile((current) => ({
        ...current,
        accountType: normalizeAccountType(balance?.accountType ?? next),
        balance: formatBalance(balance?.currentBalance),
        demoBalance:
          balance?.demoBalance != null ? formatBalance(balance.demoBalance) : current.demoBalance,
        realBalance:
          balance?.realBalance != null ? formatBalance(balance.realBalance) : current.realBalance,
        switching: false,
        error: null,
      }));
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : err instanceof Error
            ? err.message
            : t('api.network');
      setProfile((current) => ({
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
    ...profile,
    refresh,
    switchAccount,
    toggleAccount,
  };
}
