/**
 * Breakpoint constants (JS) — mirror CSS tokens in breakpoints.css.
 * Use with matchMedia / hooks. Prefer mobile-first min-width queries.
 */
export const BREAKPOINTS = {
  xs: 320,
  sm: 360,
  smPlus: 390,
  figmaMobile: 402,
  phablet: 430,
  tablet: 768,
  laptop: 1024,
  desktop: 1280,
  desktopLg: 1440,
  wide: 1600,
} as const;

export type BreakpointName = keyof typeof BREAKPOINTS;

export const BREAKPOINT_ORDER = [
  'xs',
  'sm',
  'smPlus',
  'figmaMobile',
  'phablet',
  'tablet',
  'laptop',
  'desktop',
  'desktopLg',
  'wide',
] as const satisfies readonly BreakpointName[];

export function minWidthQuery(px: number): string {
  return `(min-width: ${px}px)`;
}

export function maxWidthQuery(px: number): string {
  return `(max-width: ${px}px)`;
}
