import { useEffect, useState } from 'react';
import { getAccountStatusCached } from '@shared/api/botSessionCache';
import { setBrokerLinkWatch, subscribeBrokerLink } from '@shared/api/brokerLink';
import { tokenStore } from '@shared/auth/tokenStore';
import { getLocale } from '@shared/i18n';
import styles from './BrokerReconnectNotice.module.css';

/**
 * The page talks only to our server. When the broker socket drops, the server
 * reconnects on its own and this notice stays up until that socket is back.
 */
export function BrokerReconnectNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => subscribeBrokerLink(setVisible), []);

  useEffect(() => {
    let stopped = false;

    const tick = async () => {
      if (!tokenStore.isAuthenticated()) {
        if (!stopped) setBrokerLinkWatch(false);
        return;
      }

      try {
        const status = await getAccountStatusCached(true);
        const restoring =
          !status.binollaConnected &&
          (status.botAccess === 'Allowed' || status.botAccess === 'AdminApprovalRequired');
        if (!stopped) setBrokerLinkWatch(restoring);
      } catch {
        /* a failed status poll is not a reason to hide a reconnect already in progress */
      }
    };

    void tick();
    const id = window.setInterval(() => void tick(), 6000);
    return () => {
      stopped = true;
      window.clearInterval(id);
      setBrokerLinkWatch(false);
    };
  }, []);

  if (!visible) return null;

  const ar = getLocale() === 'ar';

  return (
    <div className={styles.overlay} role="status" aria-live="polite">
      <div className={styles.card}>
        <div className={styles.spinner} aria-hidden="true" />
        <p className={styles.title}>{ar ? 'عم نعيد الربط مع كوتكس' : 'Reconnecting to Quotex'}</p>
        <p className={styles.sub}>
          {ar
            ? 'الربط بيرجع لحاله. خلّي الصفحة مفتوحة.'
            : 'The link comes back on its own. Keep this page open.'}
        </p>
      </div>
    </div>
  );
}
