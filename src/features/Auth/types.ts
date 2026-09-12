import type { BrokerId } from '@shared/api/types';

export type FormStatus = 'idle' | 'loading' | 'success' | 'error';

export type FieldErrors<T extends string> = Partial<Record<T, string>>;

export type AuthSession = {
  accessToken: string;
  userId: string;
};

export type BinollaAuthSession = AuthSession & {
  /**
   * The broker interrupted with a human check. The account is signed in, but the broker
   * is not linked until the user answers the challenge in the guided login.
   */
  requiresGuidedLogin?: boolean;
  access: string;
  connected: boolean;
  balance?: number | null;
  accountType?: string;
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
