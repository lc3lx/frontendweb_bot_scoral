import { lazy, Suspense, type ComponentType } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { AppLayout, AuthLayout } from '@layouts';

import { ROUTES } from './routes';

/**
 * Pages are loaded when they are first opened, not all at once on the first visit.
 *
 * Every screen used to be imported statically, so one bundle carried the whole product:
 * a signed-in customer downloaded the marketing landing page and its several hundred
 * kilobytes of illustrations before the dashboard could render, and a customer reading
 * the landing page downloaded the trading screen. Splitting on the route boundary is what
 * makes the first paint quick; the router then fetches the next screen's chunk while the
 * shell is already on the page.
 *
 * The two layouts stay eager — they are the frame around every route, so deferring them
 * would only add a round trip before anything at all could be drawn.
 */
function page<T extends Record<string, unknown>>(
  load: () => Promise<T>,
  name: keyof T,
): ComponentType {
  return lazy(async () => ({ default: (await load())[name] as ComponentType }));
}

const LandingPage = page(() => import('@pages/LandingPage'), 'LandingPage');
const LoginPage = page(() => import('@pages/LoginPage'), 'LoginPage');
const SignupPage = page(() => import('@pages/SignupPage'), 'SignupPage');
const PendingApprovalPage = page(() => import('@pages/PendingApprovalPage'), 'PendingApprovalPage');
const LinkBinollaPage = page(() => import('@pages/LinkBinollaPage'), 'LinkBinollaPage');
const DashboardPage = page(() => import('@pages/DashboardPage'), 'DashboardPage');
const DashboardScrollPage = page(() => import('@pages/DashboardScrollPage'), 'DashboardScrollPage');
const TradingPage = page(() => import('@pages/TradingPage'), 'TradingPage');
const TradesPage = page(() => import('@pages/TradesPage'), 'TradesPage');
const TradesDetailPage = page(() => import('@pages/TradesDetailPage'), 'TradesDetailPage');
const AiBotPage = page(() => import('@pages/AiBotPage'), 'AiBotPage');
const ReferralPage = page(() => import('@pages/ReferralPage'), 'ReferralPage');
const AccountPage = page(() => import('@pages/AccountPage'), 'AccountPage');

/**
 * Deliberately empty.
 *
 * A chunk arrives in a few tens of milliseconds on a warm connection, and a spinner shown
 * for that long reads as a stutter rather than as progress. The surrounding shell stays
 * painted throughout, so there is never a blank screen.
 */
const pending = <div aria-busy="true" />;

export function AppRouter() {
  return (
    <Suspense fallback={pending}>
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
          <Route path={ROUTES.referral} element={<ReferralPage />} />
          <Route path={`${ROUTES.account}/*`} element={<AccountPage />} />
        </Route>

        <Route path="*" element={<Navigate to={ROUTES.landing} replace />} />
      </Routes>
    </Suspense>
  );
}

export { ROUTES } from './routes';
