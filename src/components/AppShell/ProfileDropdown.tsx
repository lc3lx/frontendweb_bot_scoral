import { dashboardAssets } from '@assets';
import { useI18n } from '@i18n';
import type { AccountMode } from '@hooks/useSessionProfile';

import styles from './ProfileDropdown.module.css';

type ProfileDropdownProps = {
  name: string;
  email: string;
  accountType: AccountMode;
  demoBalance: string;
  realBalance: string;
  switching?: boolean;
  error?: string | null;
  onSelectAccount: (next: AccountMode) => void;
};

export function ProfileDropdown({
  name,
  email,
  accountType,
  demoBalance,
  realBalance,
  switching = false,
  error = null,
  onSelectAccount,
}: ProfileDropdownProps) {
  const { t } = useI18n();
  const copy = t.dashboard.accountMenu;

  return (
    <div className={styles.dropdown} role="menu" aria-label={copy.aria}>
      <div className={styles.userRow}>
        <span className={styles.avatar} aria-hidden="true" />
        <div className={styles.userText}>
          <span className={styles.userName}>{name || t.dashboard.user.name}</span>
          <span className={styles.userEmail}>{email || copy.email}</span>
        </div>
      </div>

      <div className={styles.divider} aria-hidden="true" />

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}

      <div className={styles.accountList}>
        <button
          type="button"
          className={`${styles.accountItem}${accountType === 'Real' ? ` ${styles.accountItemActive}` : ''}`}
          role="menuitemradio"
          aria-checked={accountType === 'Real'}
          disabled={switching}
          onClick={() => onSelectAccount('Real')}
        >
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
            <span className={styles.accountBalance}>{realBalance}</span>
          </span>
          {accountType === 'Real' ? <span className={styles.activeBadge}>{copy.active}</span> : null}
        </button>

        <button
          type="button"
          className={`${styles.accountItem}${accountType === 'Demo' ? ` ${styles.accountItemActive}` : ''}`}
          role="menuitemradio"
          aria-checked={accountType === 'Demo'}
          disabled={switching}
          onClick={() => onSelectAccount('Demo')}
        >
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
            <span className={styles.accountBalance}>{demoBalance}</span>
          </span>
          {accountType === 'Demo' ? <span className={styles.activeBadge}>{copy.active}</span> : null}
        </button>
      </div>
    </div>
  );
}
