import { useI18n } from '@i18n';
import type { ReferralMemberDto } from '@shared/api';
import { cn } from '@utils';

import styles from './MembersTable.module.css';

type MembersTableProps = {
  members: ReferralMemberDto[];
  locale: string;
};

export function MembersTable({ members, locale }: MembersTableProps) {
  const { t } = useI18n();

  if (members.length === 0) {
    return (
      <section className={styles.card}>
        <p className={styles.title}>{t.referral.members.title}</p>
        <p className={styles.empty}>{t.referral.members.empty}</p>
      </section>
    );
  }

  return (
    <section className={styles.card}>
      <p className={styles.title}>{t.referral.members.title}</p>

      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t.referral.members.columns.user}</th>
              <th>{t.referral.members.columns.referredAt}</th>
              <th>{t.referral.members.columns.deposit}</th>
              <th>{t.referral.members.columns.activeDays}</th>
              <th>{t.referral.members.columns.status}</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.userId}>
                <td>{member.displayName ?? member.userId.slice(0, 8)}</td>
                <td>{new Date(member.referredAt).toLocaleDateString(locale)}</td>
                <td>{member.depositMet ? '✓' : '—'}</td>
                <td>
                  {member.activeDaysCount}/{member.requiredActiveDays}
                </td>
                <td>
                  <span className={cn(styles.status, member.qualified ? styles.statusQualified : styles.statusPending)}>
                    {member.qualified ? t.referral.members.status.qualified : t.referral.members.status.pending}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
