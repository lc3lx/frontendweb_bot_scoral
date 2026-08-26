export const ROUTES = {
  landing: '/',
  /** Internal QA only — shared component lab */
  componentLab: '/dev/components',
  /** Reserved — not implemented */
  dashboard: '/dashboard',
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
