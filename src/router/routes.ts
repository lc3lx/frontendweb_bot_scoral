/** App route paths — aligned with FIGMA_WEB_PAGES slugs. */
export const ROUTES = {
  /** Public marketing home. */
  landing: '/',
  login: '/login',
  signup: '/signup',
  pendingApproval: '/pending-approval',
  linkBinolla: '/link-binolla',
  // NOT /dashboard: nginx routes that path to the separate admin panel
  // (dashboard_web). Colliding here would make this route unreachable in production.
  home: '/home',
  homeScroll: '/home-scroll',
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
