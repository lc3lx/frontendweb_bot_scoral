/** App route paths — aligned with FIGMA_WEB_PAGES slugs. */
export const ROUTES = {
  splash: '/',
  splashAlt: '/splash',
  login: '/login',
  signup: '/signup',
  pendingApproval: '/pending-approval',
  linkBinolla: '/link-binolla',
  dashboard: '/dashboard',
  dashboardScroll: '/dashboard-scroll',
  trading: '/trading',
  trades: '/trades',
  tradesDetail: '/trades/:tradeId',
  aiBot: '/ai-bot',
  account: '/account',
  accountEditProfile: '/account/edit-profile',
  accountChangePassword: '/account/change-password',
  accountNotifications: '/account/notifications',
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
