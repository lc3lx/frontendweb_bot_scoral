import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@features/Auth';
import { emailRule } from '@features/Auth/validation';
import { invalidateBotSessionCache } from '@shared/api/botSessionCache';
import { routeAfterWebAuth } from '@shared/access/webAccess';
import { t } from '@shared/i18n';

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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

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
        const result = await authService.loginWithBinolla({
          email: email.trim(),
          password,
        });

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
        setError(t('binolla.auth.loginFailed'));
      }
    },
    [email, navigate, password, validate],
  );

  const isSubmitDisabled = useMemo(
    () => status === 'loading' || status === 'success',
    [status],
  );

  return {
    mode: 'login' as const,
    isLogin: true as const,
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
