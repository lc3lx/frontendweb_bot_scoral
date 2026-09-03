import phonesDuoPng from '@landing/assets/images/hero/phones-duo.png';
import phoneSplashPng from '@landing/assets/images/hero/phone-splash.png';
import phoneDashboardPng from '@landing/assets/images/hero/phone-dashboard.png';
import phonesDuo400 from '@landing/assets/images/hero/phones-duo-400w.webp';
import phonesDuo563 from '@landing/assets/images/hero/phones-duo-563w.webp';
import phonesDuo800 from '@landing/assets/images/hero/phones-duo-800w.webp';
import phonesDuo1126 from '@landing/assets/images/hero/phones-duo-1126w.webp';
import phoneSplash200 from '@landing/assets/images/hero/phone-splash-200w.webp';
import phoneSplash249 from '@landing/assets/images/hero/phone-splash-249w.webp';
import phoneSplash400 from '@landing/assets/images/hero/phone-splash-400w.webp';
import phoneSplash498 from '@landing/assets/images/hero/phone-splash-498w.webp';
import phoneDashboard200 from '@landing/assets/images/hero/phone-dashboard-200w.webp';
import phoneDashboard249 from '@landing/assets/images/hero/phone-dashboard-249w.webp';
import phoneDashboard400 from '@landing/assets/images/hero/phone-dashboard-400w.webp';
import phoneDashboard498 from '@landing/assets/images/hero/phone-dashboard-498w.webp';
import type { AssetSourceSet } from '@landing/assets';

/** Display width in CSS — matches Figma / HeroSection.module.css layout. */
export const HERO_PHONES_DUO_SIZES = '(max-width: 768px) 1px, (max-width: 1280px) 45vw, 563px';

export const HERO_PHONE_SINGLE_SIZES = '(max-width: 430px) 42vw, 249px';

export const heroPhoneImages = {
  phonesDuo: {
    src: phonesDuoPng,
    webpSources: [
      { src: phonesDuo400, width: 400, mime: 'image/webp' },
      { src: phonesDuo563, width: 563, mime: 'image/webp' },
      { src: phonesDuo800, width: 800, mime: 'image/webp' },
      { src: phonesDuo1126, width: 1126, mime: 'image/webp' },
    ] satisfies AssetSourceSet[],
    width: 563,
    height: 749,
    sizes: HERO_PHONES_DUO_SIZES,
  },
  phoneSplash: {
    src: phoneSplashPng,
    webpSources: [
      { src: phoneSplash200, width: 200, mime: 'image/webp' },
      { src: phoneSplash249, width: 249, mime: 'image/webp' },
      { src: phoneSplash400, width: 400, mime: 'image/webp' },
      { src: phoneSplash498, width: 498, mime: 'image/webp' },
    ] satisfies AssetSourceSet[],
    width: 249,
    height: 591,
    sizes: HERO_PHONE_SINGLE_SIZES,
  },
  phoneDashboard: {
    src: phoneDashboardPng,
    webpSources: [
      { src: phoneDashboard200, width: 200, mime: 'image/webp' },
      { src: phoneDashboard249, width: 249, mime: 'image/webp' },
      { src: phoneDashboard400, width: 400, mime: 'image/webp' },
      { src: phoneDashboard498, width: 498, mime: 'image/webp' },
    ] satisfies AssetSourceSet[],
    width: 249,
    height: 591,
    sizes: HERO_PHONE_SINGLE_SIZES,
  },
} as const;
