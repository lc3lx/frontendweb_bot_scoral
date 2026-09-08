import { useState, type FormEvent } from 'react';

import { AppModal } from '@components/AppModal';
import { useI18n, type Messages } from '@i18n';
import type { ReferralPayoutDto } from '@shared/api';
import { cn } from '@utils';

import styles from './PayoutSection.module.css';

function payoutStatusLabel(status: string, labels: Messages['referral']['payout']['status']): string {
  switch (status) {
    case 'Pending':
      return labels.pending;
    case 'Approved':
      return labels.approved;
    case 'Rejected':
      return labels.rejected;
    case 'Paid':
      return labels.paid;
    default:
      return status;
  }
}

type PayoutSectionProps = {
  availableBalance: number;
  minPayoutUsd: number;
  payouts: ReferralPayoutDto[];
  locale: string;
  onSubmit: (input: { amount: number; method: string; destination: string }) => Promise<void>;
};

function formatUsd(amount: number): string {
  return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const statusStyle: Record<string, string> = {
  Pending: 'statusPending',
  Approved: 'statusApproved',
  Rejected: 'statusRejected',
  Paid: 'statusPaid',
};

export function PayoutSection({ availableBalance, minPayoutUsd, payouts, locale, onSubmit }: PayoutSectionProps) {
  const { t } = useI18n();
  const [isOpen, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('');
  const [destination, setDestination] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function resetAndClose() {
    setOpen(false);
    setAmount('');
    setMethod('');
    setDestination('');
    setError(null);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const parsed = Number(amount);
    if (!parsed || parsed <= 0) {
      setError(t.referral.payout.amountLabel);
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({ amount: parsed, method: method.trim(), destination: destination.trim() });
      setSuccess(true);
      resetAndClose();
      window.setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className={styles.card}>
      <div className={styles.head}>
        <div>
          <p className={styles.title}>{t.referral.payout.title}</p>
          <p className={styles.available}>
            {t.referral.payout.availableLabel}: <strong>{formatUsd(availableBalance)}</strong>
          </p>
          <p className={styles.minNote}>{t.referral.payout.minNote.replace('{min}', String(minPayoutUsd))}</p>
        </div>
        <button type="button" className={styles.requestButton} onClick={() => setOpen(true)}>
          {t.referral.payout.request}
        </button>
      </div>

      {success ? <p className={styles.successNote}>{t.referral.payout.success}</p> : null}

      <p className={styles.historyTitle}>{t.referral.payout.history}</p>
      {payouts.length === 0 ? (
        <p className={styles.empty}>{t.referral.payout.empty}</p>
      ) : (
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <tbody>
              {payouts.map((payout) => (
                <tr key={payout.id}>
                  <td>{new Date(payout.requestedAt).toLocaleDateString(locale)}</td>
                  <td className={styles.amount}>{formatUsd(payout.amount)}</td>
                  <td>{payout.method}</td>
                  <td>
                    <span className={cn(styles.status, styles[statusStyle[payout.status] ?? 'statusPending'])}>
                      {payoutStatusLabel(payout.status, t.referral.payout.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AppModal
        isOpen={isOpen}
        onClose={resetAndClose}
        title={t.referral.payout.request}
        size="compact"
      >
        <form className={styles.form} onSubmit={(event) => void handleSubmit(event)}>
          <label className={styles.field}>
            <span>{t.referral.payout.amountLabel}</span>
            <input
              type="number"
              min={minPayoutUsd}
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              required
            />
          </label>
          <label className={styles.field}>
            <span>{t.referral.payout.methodLabel}</span>
            <input type="text" value={method} onChange={(event) => setMethod(event.target.value)} required />
          </label>
          <label className={styles.field}>
            <span>{t.referral.payout.destinationLabel}</span>
            <input type="text" value={destination} onChange={(event) => setDestination(event.target.value)} required />
          </label>

          {error ? <p className={styles.errorNote}>{error}</p> : null}

          <div className={styles.formActions}>
            <button type="button" className={styles.cancelButton} onClick={resetAndClose}>
              {t.referral.payout.cancel}
            </button>
            <button type="submit" className={styles.submitButton} disabled={submitting}>
              {t.referral.payout.submit}
            </button>
          </div>
        </form>
      </AppModal>
    </section>
  );
}
