import { useState } from 'react';

import { useI18n } from '@i18n';
import { copyToClipboard } from '@utils';

import styles from './ReferralLinkCard.module.css';

type ReferralLinkCardProps = {
  code: string;
  link: string;
  telegramShareLink: string;
};

export function ReferralLinkCard({ code, link, telegramShareLink }: ReferralLinkCardProps) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const ok = await copyToClipboard(link);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <section className={styles.card}>
      <p className={styles.title}>{t.referral.linkCard.title}</p>

      <div className={styles.codeRow}>
        <span className={styles.codeLabel}>{t.referral.linkCard.codeLabel}</span>
        <span className={styles.codeValue}>{code}</span>
      </div>

      <div className={styles.linkRow}>
        <span className={styles.linkValue} title={link}>
          {link}
        </span>
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.copyButton} onClick={() => void handleCopy()}>
          {copied ? t.referral.linkCard.copied : t.referral.linkCard.copyLink}
        </button>
        <a
          className={styles.shareButton}
          href={telegramShareLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t.referral.linkCard.shareTelegram}
        </a>
      </div>
    </section>
  );
}
