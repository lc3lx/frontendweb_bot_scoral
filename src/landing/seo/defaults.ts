import type { DocumentSeoConfig } from './types';

/**
 * Placeholder SEO defaults — replace with approved Landing copy later.
 * Empty/neutral strings keep the architecture ready without inventing marketing content.
 */
export const DEFAULT_DOCUMENT_SEO: DocumentSeoConfig = {
  title: 'Scar Alpha AI',
  description: '',
  canonicalUrl: undefined,
  robots: 'index,follow',
  openGraph: {
    title: 'Scar Alpha AI',
    description: '',
    type: 'website',
    siteName: 'Scar Alpha AI',
    image: undefined,
    url: undefined,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Scar Alpha AI',
    description: '',
    image: undefined,
  },
  keywords: [],
};
