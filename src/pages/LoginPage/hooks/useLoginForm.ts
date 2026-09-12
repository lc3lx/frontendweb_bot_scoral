import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@features/Auth';
import { emailRule } from '@features/Auth/validation';
import { invalidateBotSessionCache } from '@shared/api/botSessionCache';
import { invalidateBroker, normalizeBroker } from '@shared/market/useBroker';
import { routeAfterWebAuth } from '@shared/access/webAccess';
import { t } from '@shared/i18n';
import { DEFAULT_BROKER, type BrokerId } from '@shared/api/types';
import { tradingService } from '@pages/TradingPage/data/tradingService';

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
  const [broker, setBroker] = useState<BrokerId>(() => {
    try {
      const stored = localStorage.getItem('scar-alpha-broker');
      if (stored) return normalizeBroker(stored);
    } catch {}
    return DEFAULT_BROKER;
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  // Set when the broker interrupts with a human check: the account is signed in, but the
  // broker is only linked once the user answers the challenge themselves.
  const [guidedLogin, setGuidedLogin] = useState<{ email: string; password: string } | null>(null);
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
          broker,
          email: email.trim(),
          password,
        });

        invalidateBotSessionCache();
        // The venue is what a login can change, and it is read from a 30-second cache.
        // Left stale, a user who just chose Quotex lands on a page still naming Binolla.
        invalidateBroker();

        if (result.balance != null && result.balance > 0) {
          const formatted = `$${result.balance.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`;
          tradingService.setCachedBalance(formatted);
        }

        if (result.requiresGuidedLogin) {
          // Hold the password only for as long as the challenge takes — the guided login
          // needs it to fill the broker's own form — and stay on this page until it ends.
          setGuidedLogin({ email: email.trim(), password });
          setStatus('idle');
          return;
        }

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
    [broker, email, navigate, password, validate],
  );

  const isSubmitDisabled = useMemo(
    () => status === 'loading' || status === 'success',
    [status],
  );

  /** The user answered the challenge and the broker is linked. */
  const completeGuidedLogin = useCallback(
    (access: string) => {
      setGuidedLogin(null);
      setPassword('');
      setStatus('success');
      invalidateBotSessionCache();
      invalidateBroker();
      navigate(routeAfterWebAuth(access), { replace: true });
    },
    [navigate],
  );

  const cancelGuidedLogin = useCallback(() => {
    setGuidedLogin(null);
    setPassword('');
  }, []);

  return {
    mode: 'login' as const,
    isLogin: true as const,
    guidedLogin,
    completeGuidedLogin,
    cancelGuidedLogin,
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
    values: { email, password, broker },
    setBroker,
    setField: (field: 'email' | 'password', value: string) => {
      if (field === 'email') setEmail(value);
      else setPassword(value);
    },
  };
}
