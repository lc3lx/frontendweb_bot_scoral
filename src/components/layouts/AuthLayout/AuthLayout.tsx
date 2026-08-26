import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { accountApi } from '@shared/api';
import { routeAfterWebAuth, routeForWebAccess } from '@shared/access/webAccess';
import { tokenStore } from '@shared/auth/tokenStore';
import { ROUTES } from '@router/routes';

export function AuthLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    void (async () => {
      if (!tokenStore.isAuthenticated()) {
        if (active) setReady(true);
        return;
      }

      try {
        const status = await accountApi.status();
        const destination = routeAfterWebAuth(status.botAccess);

        if (location.pathname === ROUTES.pendingApproval) {
          if (status.botAccess === 'Allowed') {
            navigate(ROUTES.home, { replace: true });
            return;
          }
          if (status.approvalStatus === 'Rejected') {
            if (active) setReady(true);
            return;
          }
        }

        const isGuestRoute =
          location.pathname === ROUTES.login ||
          location.pathname === ROUTES.signup ||
          location.pathname === ROUTES.linkBinolla;

        if (isGuestRoute && location.pathname !== ROUTES.linkBinolla) {
          navigate(destination, { replace: true });
          return;
        }

        if (
          location.pathname !== ROUTES.linkBinolla &&
          (status.botAccess === 'BinollaNotConnected' || status.botAccess === 'SessionExpired')
        ) {
          navigate(ROUTES.linkBinolla, { replace: true });
          return;
        }

        if (
          location.pathname !== ROUTES.pendingApproval &&
          status.botAccess === 'AdminApprovalRequired'
        ) {
          navigate(routeForWebAccess(status.botAccess), { replace: true });
          return;
        }
      } catch {
        tokenStore.clear();
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
