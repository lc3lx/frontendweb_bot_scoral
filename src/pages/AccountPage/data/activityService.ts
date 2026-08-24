import { notificationsApi } from '@shared/api';
import { t } from '@shared/i18n';
import type { NotificationTone } from './notifications.mock';

export type WebNotificationItem = {
  id: string;
  tone: NotificationTone;
  title: string;
  description: string;
  timeAgo: string;
  read: boolean;
};

function toneFromVariant(variant: string): NotificationTone {
  if (variant.includes('profit') || variant.includes('approved')) return 'success';
  if (variant.includes('loss') || variant.includes('limit')) return 'error';
  if (variant.includes('signal') || variant.includes('live')) return 'warning';
  if (variant.includes('bot') || variant.includes('activation')) return 'info';
  return 'neutral';
}

function formatRelative(iso: string): string {
  const created = new Date(iso).getTime();
  if (Number.isNaN(created)) return iso;
  const minutes = Math.floor((Date.now() - created) / 60_000);
  if (minutes < 1) return t('notifications.justNow');
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export const activityService = {
  async fetchNotifications(): Promise<WebNotificationItem[]> {
    const response = await notificationsApi.list();
    return response.items.map((item) => ({
      id: item.id,
      tone: toneFromVariant(item.variant),
      title: item.title,
      description: item.description,
      timeAgo: formatRelative(item.createdAt),
      read: item.read,
    }));
  },

  async markAllRead(): Promise<void> {
    await notificationsApi.markAllRead();
  },
};
