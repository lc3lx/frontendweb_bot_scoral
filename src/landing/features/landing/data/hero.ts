import phonesDuoUrl from '@landing/assets/images/hero/phones-duo.png';
import phoneSplashUrl from '@landing/assets/images/hero/phone-splash.png';
import phoneDashboardUrl from '@landing/assets/images/hero/phone-dashboard.png';
import glowLeftUrl from '@landing/assets/backgrounds/hero/glow-left.svg';
import glowRightUrl from '@landing/assets/backgrounds/hero/glow-right.svg';
import eyebrowShieldUrl from '@landing/assets/icons/hero-eyebrow-shield.svg';
import arrowRightUrl from '@landing/assets/icons/arrow-right.svg';
import { registerAsset } from '@landing/assets';
import { TELEGRAM_BOT_HREF } from '../constants/links';

registerAsset({
  id: 'hero-phones-duo',
  kind: 'image',
  src: phonesDuoUrl,
  alt: 'Scar Alpha AI mobile app preview on two phones',
  format: 'png',
  figmaNodeId: '388:1507',
  width: 563,
  height: 749,
  preload: true,
});

registerAsset({
  id: 'hero-phone-splash',
  kind: 'image',
  src: phoneSplashUrl,
  alt: 'Scar Alpha AI splash screen on iPhone',
  format: 'png',
  figmaNodeId: '388:1508',
  width: 249,
  height: 591,
});

registerAsset({
  id: 'hero-phone-dashboard',
  kind: 'image',
  src: phoneDashboardUrl,
  alt: 'Scar Alpha AI dashboard on iPhone',
  format: 'png',
  figmaNodeId: '388:1516',
  width: 249,
  height: 591,
});

registerAsset({
  id: 'hero-glow-left',
  kind: 'background',
  src: glowLeftUrl,
  alt: '',
  format: 'svg',
  figmaNodeId: '388:1529',
  width: 754,
  height: 596,
});

registerAsset({
  id: 'hero-glow-right',
  kind: 'background',
  src: glowRightUrl,
  alt: '',
  format: 'svg',
  figmaNodeId: '388:1530',
  width: 646,
  height: 646,
});

registerAsset({
  id: 'icon-hero-eyebrow-shield',
  kind: 'icon',
  src: eyebrowShieldUrl,
  alt: '',
  format: 'svg',
  figmaNodeId: '55:519',
  width: 20,
  height: 20,
});

registerAsset({
  id: 'icon-arrow-right',
  kind: 'icon',
  src: arrowRightUrl,
  alt: '',
  format: 'svg',
  figmaNodeId: '55:531',
  width: 20,
  height: 20,
});

export const HERO_COPY = {
  eyebrow: 'Premium AI-powered trading control',
  title: 'Scar Alpha AI — Smart AI Trading Bot for Binary Options',
  description:
    'Control your strategies, follow live trades, manage indicators, and trade through Binolla from one intelligent interface.',
  primaryCta: 'Create Account',
  secondaryCta: 'View Bot Preview',
  secondaryHref: TELEGRAM_BOT_HREF,
} as const;

export const heroAssets = {
  phonesDuo: phonesDuoUrl,
  phoneSplash: phoneSplashUrl,
  phoneDashboard: phoneDashboardUrl,
  glowLeft: glowLeftUrl,
  glowRight: glowRightUrl,
  eyebrowShield: eyebrowShieldUrl,
  arrowRight: arrowRightUrl,
} as const;
