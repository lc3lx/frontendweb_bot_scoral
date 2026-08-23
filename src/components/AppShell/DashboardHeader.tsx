import { dashboardAssets } from '@assets';
import { useI18n } from '@i18n';

import styles from './DashboardHeader.module.css';
import { ProfileDropdown } from './ProfileDropdown';

type DashboardHeaderProps = {
  title: string;
  profileDropdownOpen?: boolean;
};

export function DashboardHeader({ title, profileDropdownOpen = false }: DashboardHeaderProps) {
  const { t } = useI18n();

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{title}</h1>

      <div className={styles.actions}>
        <div className={styles.profileWrap}>
          <button
            type="button"
            className={`${styles.profile} ${profileDropdownOpen ? styles.profileOpen : ''}`}
            aria-label={t.dashboard.profileAria}
            aria-expanded={profileDropdownOpen}
            aria-haspopup="menu"
          >
            <span className={styles.avatar} aria-hidden="true" />
            <span className={styles.profileText}>
              <span className={styles.profileName}>{t.dashboard.user.name}</span>
              <span className={styles.profileBalanceRow}>
                <span className={styles.profileBalance}>{t.dashboard.user.balance}</span>
                <span className={styles.profileDemo}>{t.dashboard.user.demo}</span>
              </span>
            </span>
            <img
              className={styles.chevron}
              src={dashboardAssets.iconChevronDown}
              alt=""
              width={16}
              height={16}
              aria-hidden="true"
            />
          </button>
          {profileDropdownOpen ? <ProfileDropdown /> : null}
        </div>

        <button type="button" className={styles.notifButton} aria-label={t.dashboard.notificationsAria}>
          <img
            className={styles.notifIcon}
            src={dashboardAssets.iconBell}
            alt=""
            width={16}
            height={16}
            aria-hidden="true"
          />
          <span className={styles.notifDot} aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
