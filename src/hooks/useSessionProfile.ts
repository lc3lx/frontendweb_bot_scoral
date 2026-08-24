import { useEffect, useState } from 'react';
import { binollaApi, meApi } from '@shared/api';
import { tokenStore } from '@shared/auth/tokenStore';
import { t } from '@shared/i18n';

export type SessionProfile = {
  name: string;
  email: string;
  balance: string;
  loading: boolean;
};

const DEFAULT_PROFILE: SessionProfile = {
  name: '',
  email: '',
  balance: '—',
  loading: true,
};

export function useSessionProfile(): SessionProfile {
  const [profile, setProfile] = useState<SessionProfile>(DEFAULT_PROFILE);

  useEffect(() => {
    if (!tokenStore.isAuthenticated()) {
      setProfile({ name: '', email: '', balance: '—', loading: false });
      return;
    }

    let active = true;

    void (async () => {
      try {
        const [me, balance] = await Promise.all([
          meApi.get(),
          binollaApi.balance().catch(() => null),
        ]);
        if (!active) return;
        const name =
          me.fullName?.trim() || me.username?.trim() || me.email?.trim() || t('common.trader');
        const email = me.email?.trim() || '';
        const balanceLabel =
          balance?.currentBalance != null
            ? `$${balance.currentBalance.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`
            : '—';
        setProfile({ name, email, balance: balanceLabel, loading: false });
      } catch {
        if (active) {
          setProfile({ name: t('common.trader'), email: '', balance: '—', loading: false });
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  return profile;
}
