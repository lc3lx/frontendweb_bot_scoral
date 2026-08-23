import { dashboardAssets } from '@assets';
import { useI18n } from '@i18n';

import styles from './ProfileDropdown.module.css';

export function ProfileDropdown() {
  const { t } = useI18n();
  const copy = t.dashboard.accountMenu;

  return (
    <div className={styles.dropdown} role="menu" aria-label={copy.aria}>
      <div className={styles.userRow}>
        <span className={styles.avatar} aria-hidden="true" />
        <div className={styles.userText}>
          <span className={styles.userName}>{t.dashboard.user.name}</span>
          <span className={styles.userEmail}>{copy.email}</span>
        </div>
      </div>

      <div className={styles.divider} aria-hidden="true" />

      <div className={styles.accountList}>
        <button type="button" className={styles.accountItem} role="menuitem">
          <span className={styles.accountIconWrap}>
            <img
              className={styles.accountIcon}
              src={dashboardAssets.iconAccountReal}
              alt=""
              width={47}
              height={45}
              aria-hidden="true"
            />
          </span>
          <span className={styles.accountCopy}>
            <span className={styles.accountLabel}>{copy.realAccount}</span>
            <span className={styles.accountBalance}>{t.dashboard.user.balance}</span>
          </span>
        </button>

        <button type="button" className={`${styles.accountItem} ${styles.accountItemDemo}`} role="menuitem">
          <span className={styles.accountIconWrap}>
            <img
              className={styles.accountIcon}
              src={dashboardAssets.iconAccountDemo}
              alt=""
              width={47}
              height={45}
              aria-hidden="true"
            />
          </span>
          <span className={styles.accountCopy}>
            <span className={styles.accountLabel}>{copy.demoAccount}</span>
            <span className={styles.accountBalance}>{t.dashboard.user.balance}</span>
          </span>
          <span className={styles.activeBadge}>{copy.active}</span>
        </button>

        <button type="button" className={styles.accountItem} role="menuitem">
          <span className={styles.openIconWrap}>
            <img
              className={styles.openIcon}
              src={dashboardAssets.iconAccountOpen}
              alt=""
              width={18}
              height={18}
              aria-hidden="true"
            />
          </span>
          <span className={styles.accountCopy}>
            <span className={styles.openLabel}>{copy.openAccount}</span>
          </span>
          <img
            className={styles.openChevron}
            src={dashboardAssets.iconChevronRightSm}
            alt=""
            width={8}
            height={14}
            data-flip-rtl="true"
            aria-hidden="true"
          />
        </button>
      </div>
    </div>
  );
}
