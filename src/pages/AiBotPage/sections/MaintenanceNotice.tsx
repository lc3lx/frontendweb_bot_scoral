import { t } from '@shared/i18n';
import styles from './MaintenanceNotice.module.css';

type MaintenanceNoticeProps = {
  /** Optional note the admin typed when stopping the fleet. */
  message?: string | null;
};

/**
 * Shown in place of the bot controls while an admin has stopped every bot.
 *
 * Deliberately scoped to this page only: the rest of the app stays usable, so a user can
 * still review their history and account while trading is held down. Showing a whole-site
 * outage screen for what is a trading pause would be misleading.
 */
export function MaintenanceNotice({ message }: MaintenanceNoticeProps) {
  return (
    <section className={styles.wrap} role="status" aria-live="polite">
      <span className={styles.iconRing} aria-hidden="true">
        <svg viewBox="0 0 24 24" className={styles.icon} fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>

      <h2 className={styles.title}>{t('bot.maintenance.title')}</h2>

      <p className={styles.body}>
        {message?.trim() ? message : t('bot.maintenance.body')}
      </p>

      <span className={styles.badge}>
        <span className={styles.dot} aria-hidden="true" />
        {t('bot.maintenance.badge')}
      </span>
    </section>
  );
}
