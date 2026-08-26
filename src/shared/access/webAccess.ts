import { ROUTES } from '@router/routes';
import { t } from '@shared/i18n';

export function canBrowseMarket(botAccess?: string | null): boolean {
  return botAccess === 'Allowed' || botAccess === 'AdminApprovalRequired';
}

export function canTrade(botAccess?: string | null): boolean {
  return botAccess === 'Allowed';
}

/** Web: pending users stay on /pending-approval; approved users go to dashboard. */
export function routeForWebAccess(botAccess?: string | null): string {
  if (botAccess === 'Allowed') {
    return ROUTES.home;
  }
  if (botAccess === 'AdminApprovalRequired') {
    return ROUTES.pendingApproval;
  }
  if (botAccess === 'BinollaNotConnected' || botAccess === 'SessionExpired') {
    return ROUTES.linkBinolla;
  }
  if (botAccess === 'NotEligible') {
    return ROUTES.login;
  }
  return ROUTES.home;
}

export function routeAfterWebAuth(botAccess?: string | null): string {
  return routeForWebAccess(botAccess);
}

export function isPendingApproval(botAccess?: string | null): boolean {
  return botAccess === 'AdminApprovalRequired';
}

export function getAdminNotApprovedTradeMessage(): string {
  return t('api.adminNotApprovedTrade');
}
