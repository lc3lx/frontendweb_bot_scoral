import { useEffect, useState } from 'react';

import { useI18n } from '@i18n';

import { AccountSubBar } from './AccountSubBar';
import { accountService } from './data/accountService';
import styles from './AccountPage.module.css';

type EditProfileContentProps = {
  figmaNode: string;
};

export function EditProfileContent({ figmaNode }: EditProfileContentProps) {
  const { t } = useI18n();

  const [fullName, setFullName] = useState('');
  const [country, setCountry] = useState('');
  const [telegramId, setTelegramId] = useState('');
  const [binollaAccountId, setBinollaAccountId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    void (async () => {
      const profile = await accountService.fetchProfile();
      setFullName(profile.fullName);
      setCountry(profile.country);
      setTelegramId(profile.telegram);
    })();
  }, []);

  return (
    <div className={styles.page} data-figma-node={figmaNode}>
      <AccountSubBar title={t.account.subBar.editProfile} />

      <form
        className={styles.formPanel}
        onSubmit={(event) => {
          event.preventDefault();
          setError(null);
          void (async () => {
            try {
              await accountService.updateProfile({
                fullName,
                country,
                telegramId,
                binollaSsid: binollaAccountId,
              });
              setSaved(true);
            } catch (err) {
              setError(err instanceof Error ? err.message : t.account.actions.saveChanges);
            }
          })();
        }}
      >
        {error ? <p role="alert">{error}</p> : null}
        {saved ? <p>{t.account.actions.saveChanges}</p> : null}

        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="account-full-name">
            {t.account.fields.fullName}
          </label>
          <input
            id="account-full-name"
            className={styles.fieldInput}
            type="text"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            autoComplete="name"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="account-country">
            {t.account.fields.country}
          </label>
          <input
            id="account-country"
            className={styles.fieldInput}
            type="text"
            value={country}
            onChange={(event) => setCountry(event.target.value)}
            autoComplete="country-name"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="account-telegram-id">
            {t.account.fields.telegramId}
          </label>
          <input
            id="account-telegram-id"
            className={styles.fieldInput}
            type="text"
            value={telegramId}
            onChange={(event) => setTelegramId(event.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="account-binolla-id">
            {t.account.fields.binollaAccountId}
          </label>
          <input
            id="account-binolla-id"
            className={styles.fieldInput}
            type="text"
            value={binollaAccountId}
            onChange={(event) => setBinollaAccountId(event.target.value)}
          />
        </div>

        <button type="submit" className={styles.primaryButton}>
          {t.account.actions.saveChanges}
        </button>
      </form>
    </div>
  );
}
