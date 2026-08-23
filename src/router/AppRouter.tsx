import { Navigate, Route, Routes } from 'react-router-dom';

import { DashboardPage } from '@pages/DashboardPage';
import { DashboardScrollPage } from '@pages/DashboardScrollPage';
import { TradingPage } from '@pages/TradingPage';
import { TradesPage } from '@pages/TradesPage';
import { TradesDetailPage } from '@pages/TradesDetailPage';
import { AiBotPage } from '@pages/AiBotPage';
import { AccountPage } from '@pages/AccountPage';
import { LoginPage } from '@pages/LoginPage';
import { PendingApprovalPage } from '@pages/PendingApprovalPage';
import { SignupPage } from '@pages/SignupPage';
import { SplashPage } from '@pages/SplashPage';

import { ROUTES } from './routes';



export function AppRouter() {

  return (

    <Routes>

      <Route path={ROUTES.splash} element={<SplashPage />} />

      <Route path={ROUTES.splashAlt} element={<SplashPage />} />

      <Route path={ROUTES.login} element={<LoginPage />} />

      <Route path={ROUTES.signup} element={<SignupPage />} />

      <Route path={ROUTES.pendingApproval} element={<PendingApprovalPage />} />

      <Route path={ROUTES.dashboard} element={<DashboardPage />} />

      <Route path={ROUTES.dashboardScroll} element={<DashboardScrollPage />} />

      <Route path={ROUTES.trading} element={<TradingPage />} />

      <Route path={ROUTES.trades} element={<TradesPage />} />

      <Route path={ROUTES.tradesDetail} element={<TradesDetailPage />} />

      <Route path={ROUTES.aiBot} element={<AiBotPage />} />

      <Route path={`${ROUTES.account}/*`} element={<AccountPage />} />

      <Route path="*" element={<Navigate to={ROUTES.splash} replace />} />

    </Routes>

  );

}



export { ROUTES } from './routes';


