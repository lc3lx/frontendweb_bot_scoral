import iconShield from '@landing/assets/icons/security/shield.svg';
import iconLock from '@landing/assets/icons/security/lock.svg';
import iconKey from '@landing/assets/icons/security/key.svg';
import { registerAsset } from '@landing/assets';

registerAsset({
  id: 'icon-security-shield',
  kind: 'icon',
  src: iconShield,
  alt: '',
  format: 'svg',
  figmaNodeId: '55:387',
  width: 29,
  height: 29,
});

registerAsset({
  id: 'icon-security-lock',
  kind: 'icon',
  src: iconLock,
  alt: '',
  format: 'svg',
  figmaNodeId: '55:371',
  width: 29,
  height: 29,
});

registerAsset({
  id: 'icon-security-key',
  kind: 'icon',
  src: iconKey,
  alt: '',
  format: 'svg',
  figmaNodeId: '55:379',
  width: 29,
  height: 29,
});

export const SECURITY_COPY = {
  eyebrow: 'Security & access',
  title: 'Trust-focused account access',
} as const;

export type SecurityCard = {
  id: string;
  title: string;
  description: string;
  iconSrc: string;
  figmaNodeId: string;
};

/** Left → right: 55:386, 55:370, 55:378 */
export const SECURITY_CARDS: readonly SecurityCard[] = [
  {
    id: 'secure-login',
    title: 'Secure login and role-based system behind the scenes',
    description:
      'Subscription-based access and account status controls keep the experience private and controlled.',
    iconSrc: iconShield,
    figmaNodeId: '55:386',
  },
  {
    id: 'admin-approval',
    title: 'Admin approval required',
    description:
      'Subscription-based access and account status controls keep the experience private and controlled.',
    iconSrc: iconLock,
    figmaNodeId: '55:370',
  },
  {
    id: 'activation-key',
    title: 'Activation Key required',
    description:
      'Subscription-based access and account status controls keep the experience private and controlled.',
    iconSrc: iconKey,
    figmaNodeId: '55:378',
  },
] as const;
