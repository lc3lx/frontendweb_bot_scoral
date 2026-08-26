import { useEffect } from 'react';
import { DEFAULT_DOCUMENT_SEO } from './defaults';
import type { DocumentSeoConfig } from './types';

function upsertMeta(
  attr: 'name' | 'property',
  key: string,
  content: string | undefined,
): void {
  if (!content) return;
  const selector = `meta[${attr}="${key}"]`;
  let el = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

function upsertLink(rel: string, href: string | undefined): void {
  if (!href) return;
  let el = document.head.querySelector(
    `link[rel="${rel}"]`,
  ) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

/**
 * Applies document head SEO fields.
 * Architecture-ready — pass real Landing content when available.
 */
export function applyDocumentSeo(config: DocumentSeoConfig): void {
  document.title = config.title;

  upsertMeta('name', 'description', config.description);
  upsertMeta('name', 'robots', config.robots);
  if (config.keywords?.length) {
    upsertMeta('name', 'keywords', config.keywords.join(', '));
  }

  upsertLink('canonical', config.canonicalUrl);

  const og = config.openGraph;
  if (og) {
    upsertMeta('property', 'og:title', og.title ?? config.title);
    upsertMeta('property', 'og:description', og.description ?? config.description);
    upsertMeta('property', 'og:type', og.type ?? 'website');
    upsertMeta('property', 'og:url', og.url ?? config.canonicalUrl);
    upsertMeta('property', 'og:image', og.image);
    upsertMeta('property', 'og:site_name', og.siteName);
  }

  const tw = config.twitter;
  if (tw) {
    upsertMeta('name', 'twitter:card', tw.card ?? 'summary_large_image');
    upsertMeta('name', 'twitter:title', tw.title ?? config.title);
    upsertMeta(
      'name',
      'twitter:description',
      tw.description ?? config.description,
    );
    upsertMeta('name', 'twitter:image', tw.image);
    upsertMeta('name', 'twitter:site', tw.site);
  }
}

export interface DocumentHeadProps {
  seo?: Partial<DocumentSeoConfig>;
}

/**
 * Mount once per route/feature to sync <head>.
 * Does not invent marketing copy — merges over defaults.
 */
export function DocumentHead({ seo }: DocumentHeadProps) {
  useEffect(() => {
    applyDocumentSeo({
      ...DEFAULT_DOCUMENT_SEO,
      ...seo,
      openGraph: {
        ...DEFAULT_DOCUMENT_SEO.openGraph,
        ...seo?.openGraph,
      },
      twitter: {
        ...DEFAULT_DOCUMENT_SEO.twitter,
        ...seo?.twitter,
      },
    });
  }, [seo]);

  return null;
}
