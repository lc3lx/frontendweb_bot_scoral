import type { ImgHTMLAttributes } from 'react';
import { cn } from '@landing/utils/cn';
import { buildSrcSet, DEFAULT_RESPONSIVE_SIZES } from './responsiveImage';
import type { AssetSourceSet } from '@landing/assets';
import styles from './LazyImage.module.css';

export interface LazyImageProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'srcSet' | 'loading'> {
  src: string;
  alt: string;
  /** Width-based candidates (any mime). */
  sources?: AssetSourceSet[];
  /** WebP candidates rendered inside `<picture>` when present. */
  webpSources?: AssetSourceSet[];
  sizes?: string;
  /** Eager for LCP/hero; lazy by default */
  priority?: boolean;
  className?: string;
}

/**
 * Responsive lazy image primitive.
 * Sections pass Figma-exported sources via the asset registry.
 */
export function LazyImage({
  src,
  alt,
  sources,
  webpSources,
  sizes = DEFAULT_RESPONSIVE_SIZES,
  priority = false,
  className,
  ...rest
}: LazyImageProps) {
  const srcSet = sources?.length ? buildSrcSet(sources) : undefined;
  const webpSrcSet = webpSources?.length ? buildSrcSet(webpSources) : undefined;
  const resolvedSizes = webpSrcSet || srcSet ? sizes : undefined;

  const img = (
    <img
      className={cn(styles.image, className)}
      src={src}
      srcSet={srcSet}
      sizes={resolvedSizes}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      fetchPriority={priority ? 'high' : 'auto'}
      {...rest}
    />
  );

  if (!webpSrcSet) return img;

  return (
    <picture className={styles.picture}>
      <source type="image/webp" srcSet={webpSrcSet} sizes={resolvedSizes} />
      {img}
    </picture>
  );
}
