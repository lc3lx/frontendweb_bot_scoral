import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { accountApi, ApiClientError } from '@shared/api';
import { routeAfterWebAuth } from '@shared/access/webAccess';
import { tokenStore } from '@shared/auth/tokenStore';
import { ROUTES } from '@router/routes';
import { t } from '@shared/i18n';

export function usePendingApproval() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [rejected, setRejected] = useState(false);

  const refresh = useCallback(async () => {
    if (!tokenStore.isAuthenticated()) {
      navigate(ROUTES.login, { replace: true });
      return;
    }

    setStatus('loading');
    setError(null);

    try {
      const accountStatus = await accountApi.status();
      if (accountStatus.approvalStatus === 'Rejected') {
        setRejected(true);
        setStatus('error');
        setError(t('api.notEligible'));
        return;
      }
      navigate(routeAfterWebAuth(accountStatus.botAccess), { replace: true });
    } catch (err) {
      setStatus('error');
      if (err instanceof ApiClientError) {
        setError(err.message);
        if (err.status === 401) {
          tokenStore.clear();
          navigate(ROUTES.login, { replace: true });
        }
        return;
      }
      setError(t('common.errorGeneric'));
    }
  }, [navigate]);

  const logout = useCallback(() => {
    tokenStore.clear();
    navigate(ROUTES.login, { replace: true });
  }, [navigate]);

  return { refresh, logout, status, error, rejected };
}
