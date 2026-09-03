import { useEffect, useState } from 'react';
import { useI18n } from '@landing/i18n';
import { cn } from '@landing/utils/cn';
import { scarAlphaLogo } from '../../data';
import styles from './LogoSplash.module.css';

const HOLD_MS = 2600;
const EXIT_MS = 780;

export interface LogoSplashProps {
  onFinished: () => void;
}

/**
 * Full-viewport intro: static brand mark with a soft glow behind it, then fade out.
 */
export function LogoSplash({ onFinished }: LogoSplashProps) {
  const { t } = useI18n();
  const [phase, setPhase] = useState<'play' | 'exit' | 'gone'>('play');

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hold = reduced ? 180 : HOLD_MS;
    const exit = reduced ? 120 : EXIT_MS;
    const html = document.documentElement;
    const previousOverflow = html.style.overflow;
    html.style.overflow = 'hidden';


    const exitTimer = window.setTimeout(() => setPhase('exit'), hold);
    const doneTimer = window.setTimeout(() => {
      html.style.overflow = previousOverflow;
      setPhase('gone');
      onFinished();
    }, hold + exit);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(doneTimer);
      html.style.overflow = previousOverflow;
    };
  }, [onFinished]);

  if (phase === 'gone') return null;

  return (
    <div
      className={cn(styles.overlay, phase === 'exit' && styles.exiting)}
      role="status"
      aria-live="polite"
      aria-label={t.a11y.splashLoading}
      aria-hidden={phase === 'exit'}
    >
      <div className={styles.vignette} />

      <div className={styles.stage}>
        <div className={styles.glow} aria-hidden="true" />
        <svg
          className={styles.logo}
          viewBox="-24 -28 449 178"
          role="img"
          aria-label={t.header.logoAlt}
        >
          <image href={scarAlphaLogo} width="401" height="122" />
        </svg>
      </div>
    </div>
  );
}
