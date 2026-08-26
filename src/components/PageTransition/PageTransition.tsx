import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { scarAlphaLogo } from '@assets';
import { useI18n } from '@i18n';
import { playPageTransitionSound } from '@shared/audio/pageTransitionSound';

import styles from './PageTransition.module.css';

const HOLD_MS = 1000;
const EXIT_MS = 320;

/**
 * Shows the brand logo briefly on every in-app route change and plays the
 * landing transition sound at 10% volume. Skips the very first mount so the
 * landing splash (or first paint) is not doubled.
 */
export function PageTransition() {
  const { pathname } = useLocation();
  const { t } = useI18n();
  const firstPathRef = useRef<string | null>(null);
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (firstPathRef.current === null) {
      firstPathRef.current = pathname;
      return;
    }
    if (firstPathRef.current === pathname) return;
    firstPathRef.current = pathname;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hold = reduced ? 120 : HOLD_MS;
    const exit = reduced ? 80 : EXIT_MS;

    setExiting(false);
    setVisible(true);
    playPageTransitionSound();

    const exitTimer = window.setTimeout(() => setExiting(true), hold);
    const hideTimer = window.setTimeout(() => {
      setVisible(false);
      setExiting(false);
    }, hold + exit);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(hideTimer);
    };
  }, [pathname]);

  if (!visible) return null;

  return (
    <div
      className={`${styles.overlay}${exiting ? ` ${styles.exiting}` : ''}`}
      role="status"
      aria-live="polite"
      aria-label={t.a11y.splashLoading}
    >
      <div className={styles.vignette} aria-hidden="true" />
      <div className={styles.stage}>
        <div className={styles.glow} aria-hidden="true" />
        <img
          className={styles.logo}
          src={scarAlphaLogo}
          alt=""
          width={280}
          height={85}
          decoding="async"
        />
      </div>
    </div>
  );
}
