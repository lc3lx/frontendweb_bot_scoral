import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { accountApi } from '@shared/api';
import { isPendingApproval } from '@shared/access/webAccess';
import { tokenStore } from '@shared/auth/tokenStore';
import { ROUTES } from '@router/routes';

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    void (async () => {
      if (!tokenStore.isAuthenticated()) {
        navigate(ROUTES.login, { replace: true, state: { from: location.pathname } });
        return;
      }

      try {
        const status = await accountApi.status();

        if (isPendingApproval(status.botAccess)) {
          navigate(ROUTES.pendingApproval, { replace: true });
          return;
        }

        if (status.botAccess === 'BinollaNotConnected' || status.botAccess === 'SessionExpired') {
          navigate(ROUTES.linkBinolla, { replace: true });
          return;
        }

        if (status.botAccess === 'NotEligible') {
          navigate(ROUTES.login, { replace: true });
          return;
        }
      } catch {
        tokenStore.clear();
        navigate(ROUTES.login, { replace: true });
        return;
      }

      if (active) setReady(true);
    })();

    return () => {
      active = false;
    };
  }, [location.pathname, navigate]);

  if (!ready) return null;
  return <Outlet />;
}
