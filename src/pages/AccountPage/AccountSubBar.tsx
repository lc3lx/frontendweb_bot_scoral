import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

import { accountAssets } from '@assets';
import { useI18n } from '@i18n';
import { ROUTES } from '@router/routes';

import styles from './AccountPage.module.css';

type AccountSubBarProps = {
  title: string;
  trailing?: ReactNode;
};

export function AccountSubBar({ title, trailing }: AccountSubBarProps) {
  const { t } = useI18n();
  const navigate = useNavigate();

  return (
    <header className={styles.subTopBar}>
      <button
        type="button"
        className={styles.backButton}
        onClick={() => navigate(ROUTES.account)}
        aria-label={t.account.actions.back}
      >
        <img
          className={styles.backIcon}
          src={accountAssets.iconBack}
          alt=""
          width={18}
          height={18}
          data-flip-rtl="true"
          aria-hidden="true"
        />
      </button>
      <h2 className={styles.subTopBarTitle}>{title}</h2>
      <div className={styles.subTopBarTrailing}>{trailing ?? <span className={styles.subTopBarSpacer} />}</div>
    </header>
  );
}
