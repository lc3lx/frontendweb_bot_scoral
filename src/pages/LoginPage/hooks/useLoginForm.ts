import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '@features/Auth';
import { emailRule } from '@features/Auth/validation';
import { invalidateBotSessionCache } from '@shared/api/botSessionCache';
import { routeAfterWebAuth } from '@shared/access/webAccess';
import { t } from '@shared/i18n';

export type BinollaAuthMode = 'login' | 'register';

const MIN_BINOLLA_PASSWORD = 4;

function binollaPasswordRule(value: string): string | undefined {
  if (!value) {
    return t('validation.required', { label: t('binolla.auth.passwordLabel') });
  }
  if (value.length < MIN_BINOLLA_PASSWORD) {
    return t('validation.passwordMin', { min: MIN_BINOLLA_PASSWORD });
  }
  return undefined;
}

export function useLoginForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMode: BinollaAuthMode =
    searchParams.get('mode') === 'register' ? 'register' : 'login';

  const [mode, setMode] = useState<BinollaAuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const isLogin = mode === 'login';

  const validate = useCallback(() => {
    const next = {
      email: emailRule(email),
      password: binollaPasswordRule(password),
    };
    setFieldErrors(next);
    return !next.email && !next.password;
  }, [email, password]);

  const submit = useCallback(
    async (event?: React.FormEvent) => {
      event?.preventDefault();
      if (!validate()) {
        setStatus('error');
        return;
      }

      setStatus('loading');
      setError(null);

      try {
        const credentials = { email: email.trim(), password };
        const result = isLogin
          ? await authService.loginWithBinolla(credentials)
          : await authService.signupWithBinolla(credentials);

        invalidateBotSessionCache();
        setStatus('success');
        setPassword('');
        navigate(routeAfterWebAuth(result.access), { replace: true });
      } catch (err) {
        setStatus('error');
        if (err && typeof err === 'object' && 'message' in err) {
          setError(String((err as { message: unknown }).message));
          return;
        }
        setError(isLogin ? t('binolla.auth.loginFailed') : t('binolla.auth.signupFailed'));
      }
    },
    [email, isLogin, navigate, password, validate],
  );

  const isSubmitDisabled = useMemo(
    () => status === 'loading' || status === 'success',
    [status],
  );

  return {
    mode,
    setMode,
    isLogin,
    email,
    setEmail,
    password,
    setPassword,
    status,
    error,
    fieldErrors,
    submit,
    isSubmitDisabled,
    serverError: error,
    values: { email, password },
    setField: (field: 'email' | 'password', value: string) => {
      if (field === 'email') setEmail(value);
      else setPassword(value);
    },
  };
}
