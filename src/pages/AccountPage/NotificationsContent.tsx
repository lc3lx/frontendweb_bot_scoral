import { accountAssets } from '@assets';
import { useI18n } from '@i18n';

import { AccountSubBar } from './AccountSubBar';
import { NOTIFICATION_ITEMS, type NotificationTone } from './data/notifications.mock';
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

  return (
    <div className={styles.page} data-figma-node={figmaNode}>
      <AccountSubBar
        title={t.account.subBar.notifications}
        trailing={
          <button type="button" className={styles.markAllButton}>
            {t.account.actions.markAll}
          </button>
        }
      />

      <div className={styles.notificationsGrid}>
        {NOTIFICATION_ITEMS.map((item) => {
          const message = t.account.notifications.items[item.messageKey];

          return (
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
                  <h3 className={styles.notificationTitle}>{message.title}</h3>
                  <time className={styles.notificationTime} dateTime={message.timeAgo}>
                    {message.timeAgo}
                  </time>
                </div>
                <p className={styles.notificationDescription}>{message.description}</p>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
