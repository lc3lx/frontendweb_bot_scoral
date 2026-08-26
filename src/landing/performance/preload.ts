/**
 * Preload helpers for LCP / hero assets.
 */
export function preloadImage(
  href: string,
  options?: { as?: 'image'; type?: string; imageSrcSet?: string; imageSizes?: string },
): void {
  if (typeof document === 'undefined' || !href) return;

  const existing = document.head.querySelector(
    `link[rel="preload"][as="image"][href="${href}"]`,
  );
  if (existing) return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = options?.as ?? 'image';
  link.href = href;
  if (options?.type) link.type = options.type;
  if (options?.imageSrcSet) {
    link.setAttribute('imagesrcset', options.imageSrcSet);
  }
  if (options?.imageSizes) {
    link.setAttribute('imagesizes', options.imageSizes);
  }
  document.head.appendChild(link);
}

export function preloadHeroAsset(src: string, srcSet?: string, sizes?: string): void {
  preloadImage(src, {
    as: 'image',
    imageSrcSet: srcSet,
    imageSizes: sizes,
  });
}
