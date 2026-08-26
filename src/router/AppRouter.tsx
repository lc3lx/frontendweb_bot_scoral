import { Navigate, Route, Routes } from 'react-router-dom';

import { AppLayout, AuthLayout } from '@layouts';
import { AccountPage } from '@pages/AccountPage';
import { AiBotPage } from '@pages/AiBotPage';
import { DashboardPage } from '@pages/DashboardPage';
import { DashboardScrollPage } from '@pages/DashboardScrollPage';
import { LandingPage } from '@pages/LandingPage';
import { LinkBinollaPage } from '@pages/LinkBinollaPage';
import { LoginPage } from '@pages/LoginPage';
import { PendingApprovalPage } from '@pages/PendingApprovalPage';
import { SignupPage } from '@pages/SignupPage';
import { TradesDetailPage } from '@pages/TradesDetailPage';
import { TradesPage } from '@pages/TradesPage';
import { TradingPage } from '@pages/TradingPage';

import { ROUTES } from './routes';

export function AppRouter() {
  return (
    <Routes>
      {/* Public marketing home — no layout chrome, the landing brings its own. */}
      <Route path={ROUTES.landing} element={<LandingPage />} />

      <Route element={<AuthLayout />}>
        <Route path={ROUTES.login} element={<LoginPage />} />
        <Route path={ROUTES.signup} element={<SignupPage />} />
        <Route path={ROUTES.pendingApproval} element={<PendingApprovalPage />} />
        <Route path={ROUTES.linkBinolla} element={<LinkBinollaPage />} />
      </Route>

      <Route element={<AppLayout />}>
        <Route path={ROUTES.home} element={<DashboardPage />} />
        <Route path={ROUTES.homeScroll} element={<DashboardScrollPage />} />
        <Route path={ROUTES.trading} element={<TradingPage />} />
        <Route path={ROUTES.trades} element={<TradesPage />} />
        <Route path={ROUTES.tradesDetail} element={<TradesDetailPage />} />
        <Route path={ROUTES.aiBot} element={<AiBotPage />} />
        <Route path={`${ROUTES.account}/*`} element={<AccountPage />} />
      </Route>

      <Route path="*" element={<Navigate to={ROUTES.landing} replace />} />
    </Routes>
  );
}

export { ROUTES } from './routes';
