export type AccountProfile = {
  fullName: string;
  email: string;
  country: string;
  telegram: string;
  binollaId: string;
  unreadNotifications: number;
};

export const ACCOUNT_PROFILE: AccountProfile = {
  fullName: 'Alex Morgan',
  email: 'alex.morgan@scaralpha.ai',
  country: 'United States',
  telegram: '@alexmorgan',
  binollaId: 'BNL-482910',
  unreadNotifications: 3,
};
