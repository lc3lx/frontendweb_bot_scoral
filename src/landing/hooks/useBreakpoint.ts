import { BREAKPOINTS, minWidthQuery } from '@landing/constants/breakpoints';
import { useMediaQuery } from './useMediaQuery';

export function useMinWidth(px: number): boolean {
  return useMediaQuery(minWidthQuery(px));
}

export function useIsTabletUp(): boolean {
  return useMinWidth(BREAKPOINTS.tablet);
}

export function useIsLaptopUp(): boolean {
  return useMinWidth(BREAKPOINTS.laptop);
}

export function useIsDesktopUp(): boolean {
  return useMinWidth(BREAKPOINTS.desktop);
}

export function useIsDesktopLgUp(): boolean {
  return useMinWidth(BREAKPOINTS.desktopLg);
}
