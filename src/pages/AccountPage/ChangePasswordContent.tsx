import { useState } from 'react';

import { useI18n } from '@i18n';

import { AccountSubBar } from './AccountSubBar';
import styles from './AccountPage.module.css';

type ChangePasswordContentProps = {
  figmaNode: string;
};

export function ChangePasswordContent({ figmaNode }: ChangePasswordContentProps) {
  const { t } = useI18n();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  return (
    <div className={styles.page} data-figma-node={figmaNode}>
      <AccountSubBar title={t.account.subBar.changePassword} />

      <form
        className={styles.formPanel}
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="account-current-password">
            {t.account.fields.currentPassword}
          </label>
          <input
            id="account-current-password"
            className={styles.fieldInput}
            type="password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            autoComplete="current-password"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="account-new-password">
            {t.account.fields.newPassword}
          </label>
          <input
            id="account-new-password"
            className={styles.fieldInput}
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            autoComplete="new-password"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="account-confirm-password">
            {t.account.fields.confirmPassword}
          </label>
          <input
            id="account-confirm-password"
            className={styles.fieldInput}
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
          />
        </div>

        <button type="submit" className={styles.primaryButton}>
          {t.account.actions.updatePassword}
        </button>
      </form>
    </div>
  );
}
