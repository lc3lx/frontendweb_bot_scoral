import { useCallback, useEffect, useState } from 'react';

import { accountAssets } from '@assets';
import { useI18n } from '@i18n';

import { AccountSubBar } from './AccountSubBar';
import { activityService, type WebNotificationItem } from './data/activityService';
import type { NotificationTone } from './data/notifications.mock';
import styles from './AccountPage.module.css';

type NotificationsContentProps = {
  figmaNode: string;
};

function resolveNotificationIcon(tone: NotificationTone) {
  switch (tone) {
    case 'success':
      return accountAssets.notificationSuccess;
    case 'info':
      return accountAssets.notificationInfo;
    case 'warning':
      return accountAssets.notificationWarning;
    case 'error':
      return accountAssets.notificationError;
    case 'neutral':
    default:
      return accountAssets.notificationNeutral;
  }
}

function resolveToneClass(tone: NotificationTone) {
  switch (tone) {
    case 'success':
      return styles.notificationIconSuccess;
    case 'info':
      return styles.notificationIconInfo;
    case 'warning':
      return styles.notificationIconWarning;
    case 'error':
      return styles.notificationIconError;
    case 'neutral':
    default:
      return styles.notificationIconNeutral;
  }
}

export function NotificationsContent({ figmaNode }: NotificationsContentProps) {
  const { t } = useI18n();
  const [items, setItems] = useState<WebNotificationItem[]>([]);

  const load = useCallback(async () => {
    const next = await activityService.fetchNotifications();
    setItems(next);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className={styles.page} data-figma-node={figmaNode}>
      <AccountSubBar
        title={t.account.subBar.notifications}
        trailing={
          <button
            type="button"
            className={styles.markAllButton}
            onClick={() => void activityService.markAllRead().then(load)}
          >
            {t.account.actions.markAll}
          </button>
        }
      />

      <div className={styles.notificationsGrid}>
        {items.length === 0 ? <p>{t.trades.empty}</p> : null}
        {items.map((item) => (
          <article key={item.id} className={styles.notificationCard}>
            <div className={`${styles.notificationIconWrap} ${resolveToneClass(item.tone)}`}>
              <img
                src={resolveNotificationIcon(item.tone)}
                alt=""
                width={16}
                height={16}
                aria-hidden="true"
              />
            </div>
            <div className={styles.notificationBody}>
              <div className={styles.notificationHead}>
                <h3 className={styles.notificationTitle}>{item.title}</h3>
                <time className={styles.notificationTime} dateTime={item.timeAgo}>
                  {item.timeAgo}
                </time>
              </div>
              <p className={styles.notificationDescription}>{item.description}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
