import { LANDING_SECTION_IDS } from '../constants/sectionIds';
import type { NavKey } from '@landing/i18n';

export interface HeaderNavItem {
  id: NavKey;
  href: string;
}

/** Navigation order from Figma 55:588 — labels come from i18n. */
export const HEADER_NAV_ITEMS: HeaderNavItem[] = [
  { id: 'home', href: `#${LANDING_SECTION_IDS.hero}` },
  { id: 'howItWorks', href: `#${LANDING_SECTION_IDS.features}` },
  { id: 'aiBot', href: `#${LANDING_SECTION_IDS.botEngine}` },
  { id: 'trading', href: `#${LANDING_SECTION_IDS.trading}` },
  { id: 'dashboard', href: `#${LANDING_SECTION_IDS.statistics}` },
  { id: 'pricing', href: `#${LANDING_SECTION_IDS.pricing}` },
];
