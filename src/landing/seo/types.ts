export type SeoRobots =
  | 'index,follow'
  | 'noindex,nofollow'
  | 'index,nofollow'
  | 'noindex,follow';

export interface OpenGraphConfig {
  title?: string;
  description?: string;
  url?: string;
  type?: 'website' | 'article';
  image?: string;
  siteName?: string;
}

export interface TwitterCardConfig {
  card?: 'summary' | 'summary_large_image';
  title?: string;
  description?: string;
  image?: string;
  site?: string;
}

/**
 * Document SEO payload — structure only in this phase.
 * Real Landing copy is filled when sections ship.
 */
export interface DocumentSeoConfig {
  title: string;
  description: string;
  canonicalUrl?: string;
  robots?: SeoRobots;
  openGraph?: OpenGraphConfig;
  twitter?: TwitterCardConfig;
  keywords?: string[];
}
