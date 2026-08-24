import { useEffect } from 'react';

import { scarAlphaLogo } from '@assets';

import { useI18n } from '@i18n';

import { useSplashBootstrap } from './hooks/useSplashBootstrap';
import styles from './SplashPage.module.css';

/** Figma frame "1" (574:1026) — full-viewport brand splash, then route by auth status. */
export function SplashPage() {
  const { t } = useI18n();
  useSplashBootstrap();

  useEffect(() => {
    document.title = t.seo.title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', t.seo.description);
  }, [t.seo.description, t.seo.title]);

  return (
    <main
      className={styles.page}
      data-figma-node="574:1026"
      role="status"
      aria-live="polite"
      aria-label={t.a11y.splashLoading}
    >
      <div className={styles.vignette} aria-hidden="true" />

      <div className={styles.backdrop} aria-hidden="true">
        <div className={styles.ellipseGlow} />
      </div>

      <div className={styles.stage}>
        <div className={styles.logoGlow} aria-hidden="true" />
        <img
          className={styles.logo}
          src={scarAlphaLogo}
          alt={t.brand.logoAlt}
          width={374}
          height={300}
          decoding="async"
        />
      </div>
    </main>
  );
}
