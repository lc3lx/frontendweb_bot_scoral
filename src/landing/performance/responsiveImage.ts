import type { AssetSourceSet } from '@landing/assets';

/** Build a standard srcSet string from width candidates. */
export function buildSrcSet(sources: AssetSourceSet[]): string {
  return sources.map((item) => `${item.src} ${item.width}w`).join(', ');
}

export const DEFAULT_RESPONSIVE_SIZES =
  '(max-width: 430px) 100vw, (max-width: 1024px) 90vw, 1342px';
