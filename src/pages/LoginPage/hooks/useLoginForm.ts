import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { accountApi, meApi } from '@shared/api';
import { routeAfterWebAuth } from '@shared/access/webAccess';
import { authService, useAuthForm, validateLoginForm, type LoginFormValues } from '@features/Auth';

const INITIAL: LoginFormValues = { email: '', password: '' };

export function useLoginForm() {
  const navigate = useNavigate();

  const handleSubmit = useCallback(
    async (values: LoginFormValues) => {
      await authService.login(values);
      const status = await accountApi.status();
      await meApi.get().catch(() => null);
      navigate(routeAfterWebAuth(status.botAccess), { replace: true });
    },
    [navigate],
  );

  return useAuthForm({
    initialValues: INITIAL,
    validate: validateLoginForm,
    onSubmit: handleSubmit,
  });
}
