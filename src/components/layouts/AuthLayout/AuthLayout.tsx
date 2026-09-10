import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { accountApi } from '@shared/api';
import { routeAfterWebAuth, routeForWebAccess } from '@shared/access/webAccess';
import { tokenStore } from '@shared/auth/tokenStore';
import { isSessionExpiredError } from '@shared/auth/sessionErrors';
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
        // The answer describes the moment the request was SENT. If the route has moved
        // on since — which is exactly what a successful login does — acting on it now
        // overrides where the user was just sent. That is how a login the server had
        // accepted still landed on the link screen: this check had been started a moment
        // earlier, while the account genuinely was not connected yet.
        if (!active) return;

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

        const isSignInRoute =
          location.pathname === ROUTES.login || location.pathname === ROUTES.signup;

        // Someone who is already set up has no business on the sign-in page, so they are
        // sent on. Someone who is NOT — no broker linked, or a dead session — is left
        // exactly where they are: the sign-in page is where that gets fixed, and it is
        // the only place the broker can be chosen. Bouncing them to the link screen took
        // that choice away and made a deliberate Binolla sign-in impossible to complete.
        if (isSignInRoute) {
          if (status.botAccess === 'Allowed' || status.botAccess === 'AdminApprovalRequired') {
            navigate(destination, { replace: true });
            return;
          }

          if (active) setReady(true);
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
      } catch (error) {
        // Only a real 401 means the session died. Clearing on every failure is what made
        // a refresh during a slow or briefly failing backend log the user out.
        if (isSessionExpiredError(error)) tokenStore.clear();
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
