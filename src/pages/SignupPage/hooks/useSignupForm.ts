import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { accountApi, binollaApi, meApi } from '@shared/api';
import { routeAfterWebAuth } from '@shared/access/webAccess';
import { authService, useAuthForm, validateSignupForm, type SignupFormValues } from '@features/Auth';

const INITIAL: SignupFormValues = {
  fullName: '',
  email: '',
  password: '',
  country: '',
  telegramId: '',
  binollaAccount: '',
};

export function useSignupForm() {
  const navigate = useNavigate();

  const handleSubmit = useCallback(
    async (values: SignupFormValues) => {
      await authService.signup(values);
      const ssid = values.binollaAccount?.trim();
      if (ssid) {
        await binollaApi.connect({ ssid, accountType: 'Demo' });
      }
      const status = await accountApi.status();
      await meApi.get().catch(() => null);
      navigate(routeAfterWebAuth(status.botAccess), { replace: true });
    },
    [navigate],
  );

  return useAuthForm({
    initialValues: INITIAL,
    validate: validateSignupForm,
    onSubmit: handleSubmit,
  });
}
