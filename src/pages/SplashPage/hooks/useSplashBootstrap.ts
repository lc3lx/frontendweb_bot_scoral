import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { accountApi, ApiClientError, meApi } from '@shared/api';
import { routeAfterWebAuth } from '@shared/access/webAccess';
import { tokenStore } from '@shared/auth/tokenStore';
import { ROUTES } from '@router/routes';
import { t } from '@shared/i18n';

const SPLASH_MIN_MS = 1200;

export function useSplashBootstrap() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const started = Date.now();

    const finish = async (path: string) => {
      const wait = Math.max(0, SPLASH_MIN_MS - (Date.now() - started));
      await new Promise((r) => window.setTimeout(r, wait));
      if (active) navigate(path, { replace: true });
    };

    void (async () => {
      try {
        if (!tokenStore.isAuthenticated()) {
          await finish(ROUTES.login);
          return;
        }

        const [status] = await Promise.all([accountApi.status(), meApi.get().catch(() => null)]);
        await finish(routeAfterWebAuth(status.botAccess));
      } catch (err) {
        tokenStore.clear();
        const message =
          err instanceof ApiClientError
            ? err.message
            : t('common.errorGeneric');
        if (active) setError(message);
        await finish(ROUTES.login);
      }
    })();

    return () => {
      active = false;
    };
  }, [navigate]);

  return { error };
}
