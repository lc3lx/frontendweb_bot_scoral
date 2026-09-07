import { useEffect } from 'react';
import { createPortal } from 'react-dom';

import { scarAlphaLogo } from '@assets';
import { t } from '@shared/i18n';
import styles from './MaintenanceNotice.module.css';

type MaintenanceNoticeProps = {
  /** Optional note the admin typed when stopping the fleet. */
  message?: string | null;
};

/**
 * Full-screen takeover shown while an admin has stopped every bot.
 *
 * <p>Rendered through a portal onto <code>document.body</code> rather than inside the
 * page. The bot page lives inside the app shell, so drawing it in place left the sidebar
 * and header visible around it; and the shell's own stacking contexts (transforms,
 * `isolation: isolate`) mean a plain high z-index is not reliably enough to cover them.
 * A portal sidesteps both.</p>
 *
 * <p>Page scrolling is locked while it is up, so nothing can be revealed underneath.</p>
 */
export function MaintenanceNotice({ message }: MaintenanceNoticeProps) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className={styles.overlay} role="status" aria-live="polite">
      <div className={styles.brandBar}>
        <img className={styles.brandLogo} src={scarAlphaLogo} alt="" aria-hidden="true" />
      </div>

      <div className={styles.center}>
        <span className={styles.iconRing} aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            className={styles.icon}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>

        <h1 className={styles.title}>{t('bot.maintenance.title')}</h1>

        <p className={styles.body}>{message?.trim() ? message : t('bot.maintenance.body')}</p>

        <span className={styles.badge}>
          <span className={styles.dot} aria-hidden="true" />
          {t('bot.maintenance.badge')}
        </span>
      </div>
    </div>,
    document.body,
  );
}
