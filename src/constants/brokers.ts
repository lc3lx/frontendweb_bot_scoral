import type { BrokerId } from '@shared/api/types';

/**
 * Per-broker links and labels.
 *
 * Signup URLs carry our affiliate id — the referral program depends on a user arriving
 * through them, so a plain broker link here silently loses the attribution and with it the
 * commission for whoever referred them.
 */
type BrokerLinks = {
  label: string;
  /** Referral signup, with the affiliate id attached. */
  signupUrl: string;
  loginUrl: string;
};

export const BROKER_LINKS: Record<BrokerId, BrokerLinks> = {
  binolla: {
    label: 'Binolla',
    signupUrl: 'https://binolla.com/signup/?lid=15968',
    loginUrl: 'https://binolla.com/login/',
  },
  quotex: {
    label: 'Quotex',
    signupUrl: 'https://broker-qx.pro/?lid=2345315',
    loginUrl: 'https://broker-qx.pro/',
  },
};

/** Signup link for a broker, falling back to Binolla for anything unrecognised. */
export function brokerSignupUrl(broker: BrokerId | string | null | undefined): string {
  const key = String(broker ?? '').trim().toLowerCase();
  return (BROKER_LINKS as Record<string, BrokerLinks>)[key]?.signupUrl
    ?? BROKER_LINKS.binolla.signupUrl;
}

export function brokerLoginUrl(broker: BrokerId | string | null | undefined): string {
  const key = String(broker ?? '').trim().toLowerCase();
  return (BROKER_LINKS as Record<string, BrokerLinks>)[key]?.loginUrl
    ?? BROKER_LINKS.binolla.loginUrl;
}
