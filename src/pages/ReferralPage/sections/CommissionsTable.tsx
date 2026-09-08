import { useI18n } from '@i18n';
import type { ReferralCommissionDto, ReferralRewardDto } from '@shared/api';
import { cn } from '@utils';

import styles from './CommissionsTable.module.css';

type CommissionsTableProps = {
  commissions: ReferralCommissionDto[];
  rewards: ReferralRewardDto[];
  locale: string;
};

function formatUsd(amount: number): string {
  return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function CommissionsTable({ commissions, rewards, locale }: CommissionsTableProps) {
  const { t } = useI18n();

  return (
    <div className={styles.wrap}>
      <section className={styles.card}>
        <p className={styles.title}>{t.referral.earnings.commissionsTitle}</p>
        {commissions.length === 0 ? (
          <p className={styles.empty}>{t.referral.earnings.empty}</p>
        ) : (
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t.referral.earnings.columns.date}</th>
                  <th>{t.referral.earnings.columns.user}</th>
                  <th>{t.referral.earnings.columns.rate}</th>
                  <th>{t.referral.earnings.columns.amount}</th>
                </tr>
              </thead>
              <tbody>
                {commissions.map((row) => (
                  <tr key={row.id}>
                    <td>{new Date(row.createdAt).toLocaleDateString(locale)}</td>
                    <td>{row.referredDisplayName ?? row.referredUserId.slice(0, 8)}</td>
                    <td>{row.ratePercent.toLocaleString(undefined, { maximumFractionDigits: 2 })}%</td>
                    <td className={styles.amount}>{formatUsd(row.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className={styles.card}>
        <p className={styles.title}>{t.referral.earnings.rewardsTitle}</p>
        {rewards.length === 0 ? (
          <p className={styles.empty}>{t.referral.earnings.emptyRewards}</p>
        ) : (
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t.referral.earnings.columns.date}</th>
                  <th>{t.referral.earnings.columns.kind}</th>
                  <th>{t.referral.earnings.columns.amount}</th>
                  <th>{t.referral.earnings.columns.status}</th>
                </tr>
              </thead>
              <tbody>
                {rewards.map((row) => (
                  <tr key={row.id}>
                    <td>{new Date(row.grantedAt).toLocaleDateString(locale)}</td>
                    <td>{row.kind === 'IPhone' ? t.referral.earnings.rewardKind.iphone : t.referral.earnings.rewardKind.tierGift}</td>
                    <td className={styles.amount}>{row.amount > 0 ? formatUsd(row.amount) : '—'}</td>
                    <td>
                      <span
                        className={cn(
                          styles.status,
                          row.status === 'Paid' ? styles.statusPaid : row.status === 'Cancelled' ? styles.statusCancelled : styles.statusGranted,
                        )}
                      >
                        {row.status === 'Paid'
                          ? t.referral.earnings.rewardStatus.paid
                          : row.status === 'Cancelled'
                            ? t.referral.earnings.rewardStatus.cancelled
                            : t.referral.earnings.rewardStatus.granted}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
