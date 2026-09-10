import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { accountApi } from '@shared/api';
import { isPendingApproval } from '@shared/access/webAccess';
import { tokenStore } from '@shared/auth/tokenStore';
import { isSessionExpiredError } from '@shared/auth/sessionErrors';
import { ROUTES } from '@router/routes';
import { LoadingBar } from '@components/LoadingBar';
import { MaintenanceNotice } from '@components/MaintenanceNotice';
import { useBotMaintenance } from '@shared/maintenance/useBotMaintenance';

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const maintenance = useBotMaintenance();

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
      } catch (error) {
        // Same rule as AuthLayout: bounce to login only when the server actually
        // rejected the token. A transient failure leaves the user where they are.
        if (isSessionExpiredError(error)) {
          tokenStore.clear();
          navigate(ROUTES.login, { replace: true });
          return;
        }
      }

      if (active) setReady(true);
    })();

    return () => {
      active = false;
    };
  }, [location.pathname, navigate]);

  if (!ready) return null;

  // Whole-app takeover, not just the bot page: while an admin has trading stopped there
  // is nothing here a user can act on, and letting them browse balances and history that
  // are frozen mid-session is more confusing than saying so plainly.
  if (maintenance) return <MaintenanceNotice message={maintenance.message} />;

  return (
    <>
      {/* Mounted once for the whole app: any in-flight request shows it, so a slow page
          and a slow chart poll read the same to the user — working, not frozen. */}
      <LoadingBar />
      <Outlet />
    </>
  );
}
