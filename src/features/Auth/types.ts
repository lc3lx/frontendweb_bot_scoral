import type { BrokerId } from '@shared/api/types';

export type FormStatus = 'idle' | 'loading' | 'success' | 'error';

export type FieldErrors<T extends string> = Partial<Record<T, string>>;

export type AuthSession = {
  accessToken: string;
  userId: string;
};

export type BinollaAuthSession = AuthSession & {
  access: string;
  connected: boolean;
};

export type LoginCredentials = {
  email: string;
  password: string;
  /** Venue to sign in to. Omitted means Binolla, which is what every existing account is. */
  broker?: BrokerId;
};

export type SignupPayload = {
  fullName: string;
  email: string;
  password: string;
  country: string;
  telegramId: string;
  binollaAccount: string;
};

export type AuthServiceError = {
  message: string;
  fieldErrors?: FieldErrors<string>;
};

export type LoginFormValues = LoginCredentials;
export type SignupFormValues = SignupPayload;
