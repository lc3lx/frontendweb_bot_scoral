import { accountApi, authApi, binollaApi, meApi } from '@shared/api';
import { tokenStore } from '@shared/auth/tokenStore';
import { t } from '@shared/i18n';
import type { AccountProfile } from './account.mock';

function formatApproval(status: string): string {
  switch (status) {
    case 'Approved':
      return t('common.approved');
    case 'Rejected':
      return t('common.rejected');
    default:
      return t('common.pending');
  }
}

export const accountService = {
  async fetchProfile(): Promise<AccountProfile & { approvalStatus: string; botAccess: string }> {
    const [me, status] = await Promise.all([meApi.get(), accountApi.status()]);
    return {
      fullName: me.fullName?.trim() || me.username?.trim() || me.email?.trim() || t('common.trader'),
      email: me.email?.trim() || '—',
      country: me.country?.trim() || '—',
      telegram: me.username ? `@${me.username.replace(/^@/, '')}` : '—',
      binollaId: status.binollaConnected ? t('account.value.connected') : t('account.value.notConnected'),
      unreadNotifications: 0,
      approvalStatus: formatApproval(status.approvalStatus),
      botAccess: status.botAccess,
    };
  },

  async updateProfile(input: {
    fullName: string;
    country: string;
    telegramId: string;
    binollaSsid?: string;
  }): Promise<void> {
    await meApi.update({
      fullName: input.fullName.trim(),
      country: input.country.trim(),
      username: input.telegramId.trim() || undefined,
    });
    const ssid = input.binollaSsid?.trim();
    if (ssid) {
      await binollaApi.connect({ ssid, accountType: 'Demo' });
    }
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await authApi.changePassword({ currentPassword, newPassword });
  },

  logout(): void {
    tokenStore.clear();
  },
};
