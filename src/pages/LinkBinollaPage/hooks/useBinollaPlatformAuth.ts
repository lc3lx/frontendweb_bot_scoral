import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@router/routes';
import { accountApi, ApiClientError, binollaApi } from '@shared/api';
import { invalidateBotSessionCache } from '@shared/api/botSessionCache';
import { routeAfterWebAuth } from '@shared/access/webAccess';
import { tokenStore } from '@shared/auth/tokenStore';
import { t } from '@shared/i18n';

export type BinollaAuthMode = 'login' | 'register';

export function useBinollaPlatformAuth(mode: BinollaAuthMode = 'login') {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const ensureSession = useCallback(async () => {
    if (tokenStore.isAuthenticated()) return;
    navigate(ROUTES.login, { replace: true });
    throw { message: t('auth.signInFirst') };
  }, [navigate]);

  const submitCredentials = useCallback(async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError(t('binolla.auth.enterCredentials'));
      setStatus('error');
      return;
    }

    setStatus('loading');
    setError(null);

    try {
      await ensureSession();
      const result =
        mode === 'login'
          ? await binollaApi.login({ email: trimmedEmail, password })
          : await binollaApi.signup({ email: trimmedEmail, password });

      invalidateBotSessionCache();
      setStatus('success');
      setPassword('');
      navigate(routeAfterWebAuth(result.access), { replace: true });
    } catch (err) {
      setStatus('error');
      if (err instanceof ApiClientError) {
        setError(err.message);
        return;
      }
      if (err && typeof err === 'object' && 'message' in err) {
        setError(String((err as { message: unknown }).message));
        return;
      }
      setError(mode === 'login' ? t('binolla.auth.loginFailed') : t('binolla.auth.signupFailed'));
    }
  }, [email, ensureSession, mode, navigate, password]);

  const refreshStatus = useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      await ensureSession();
      const accountStatus = await accountApi.status();
      setStatus('success');
      navigate(routeAfterWebAuth(accountStatus.botAccess), { replace: true });
    } catch (err) {
      setStatus('error');
      if (err instanceof ApiClientError) {
        setError(err.message);
        return;
      }
      setError(t('common.errorGeneric'));
    }
  }, [ensureSession, navigate]);

  return {
    mode,
    email,
    setEmail,
    password,
    setPassword,
    status,
    error,
    submitCredentials,
    refreshStatus,
  };
}
