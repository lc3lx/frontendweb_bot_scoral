import iconDeposit from '@landing/assets/icons/pricing/icon-deposit.svg';
import iconBonus from '@landing/assets/icons/pricing/icon-bonus.svg';
import iconBalance from '@landing/assets/icons/pricing/icon-balance.svg';
import iconProfit from '@landing/assets/icons/pricing/icon-profit.svg';
import iconTurnover from '@landing/assets/icons/pricing/icon-turnover.svg';
import iconDepositGold from '@landing/assets/icons/pricing/icon-deposit-gold.svg';
import iconBonusGold from '@landing/assets/icons/pricing/icon-bonus-gold.svg';
import iconBalanceGold from '@landing/assets/icons/pricing/icon-balance-gold.svg';
import iconProfitGold from '@landing/assets/icons/pricing/icon-profit-gold.svg';
import iconTurnoverGold from '@landing/assets/icons/pricing/icon-turnover-gold.svg';
import glowRed from '@landing/assets/icons/pricing/glow-red.svg';
import glowGold from '@landing/assets/icons/pricing/glow-gold.svg';
import { registerAsset } from '@landing/assets';
import { FIGMA_LANDING_NODES } from '@landing/constants/figma';

registerAsset({
  id: 'icon-pricing-deposit',
  kind: 'icon',
  src: iconDeposit,
  alt: '',
  format: 'svg',
  figmaNodeId: '641:317',
  width: 21,
  height: 21,
});

registerAsset({
  id: 'icon-pricing-bonus',
  kind: 'icon',
  src: iconBonus,
  alt: '',
  format: 'svg',
  figmaNodeId: '641:325',
  width: 22,
  height: 22,
});

registerAsset({
  id: 'icon-pricing-balance',
  kind: 'icon',
  src: iconBalance,
  alt: '',
  format: 'svg',
  figmaNodeId: '641:329',
  width: 22,
  height: 22,
});

registerAsset({
  id: 'icon-pricing-profit',
  kind: 'icon',
  src: iconProfit,
  alt: '',
  format: 'svg',
  figmaNodeId: '641:320',
  width: 23,
  height: 14,
});

registerAsset({
  id: 'icon-pricing-turnover',
  kind: 'icon',
  src: iconTurnover,
  alt: '',
  format: 'svg',
  figmaNodeId: '642:462',
  width: 20,
  height: 21,
});

export type PricingRowId = 'deposit' | 'bonus' | 'balance' | 'profit' | 'turnover';
export type PricingPlanId = 'starter-50' | 'starter-250' | 'starter-1000' | 'starter-2500';
export type PricingPlanTone = 'red' | 'gold';

export type PricingIcon = {
  src: string;
  width: number;
  height: number;
};

export type PricingPlan = {
  id: PricingPlanId;
  tone: PricingPlanTone;
  popular: boolean;
  figmaNodeId: string;
  glowSrc: string;
  rows: readonly PricingRowId[];
  icons: Record<PricingRowId, PricingIcon>;
};

const RED_ICONS: Record<PricingRowId, PricingIcon> = {
  deposit: { src: iconDeposit, width: 21, height: 21 },
  bonus: { src: iconBonus, width: 22, height: 22 },
  balance: { src: iconBalance, width: 22, height: 22 },
  profit: { src: iconProfit, width: 23, height: 14 },
  turnover: { src: iconTurnover, width: 20, height: 21 },
};

const GOLD_ICONS: Record<PricingRowId, PricingIcon> = {
  deposit: { src: iconDepositGold, width: 21, height: 21 },
  bonus: { src: iconBonusGold, width: 22, height: 22 },
  balance: { src: iconBalanceGold, width: 22, height: 22 },
  profit: { src: iconProfitGold, width: 23, height: 14 },
  turnover: { src: iconTurnoverGold, width: 20, height: 21 },
};

/** Bonus packages — Figma 641:182 / 642:445 / 642:463 / 642:481 */
export const PRICING_PLANS: readonly PricingPlan[] = [
  {
    id: 'starter-50',
    tone: 'red',
    popular: false,
    figmaNodeId: FIGMA_LANDING_NODES.pricingPlan50,
    glowSrc: glowRed,
    rows: ['deposit', 'bonus', 'balance', 'profit'],
    icons: RED_ICONS,
  },
  {
    id: 'starter-250',
    tone: 'red',
    popular: false,
    figmaNodeId: FIGMA_LANDING_NODES.pricingPlan250,
    glowSrc: glowRed,
    rows: ['deposit', 'bonus', 'balance', 'profit', 'turnover'],
    icons: RED_ICONS,
  },
  {
    id: 'starter-1000',
    tone: 'gold',
    popular: true,
    figmaNodeId: FIGMA_LANDING_NODES.pricingPlan1000,
    glowSrc: glowGold,
    rows: ['deposit', 'bonus', 'balance', 'profit', 'turnover'],
    icons: GOLD_ICONS,
  },
  {
    id: 'starter-2500',
    tone: 'red',
    popular: false,
    figmaNodeId: FIGMA_LANDING_NODES.pricingPlan2500,
    glowSrc: glowRed,
    rows: ['deposit', 'bonus', 'balance', 'profit', 'turnover'],
    icons: RED_ICONS,
  },
] as const;

export const pricingAssets = {
  glowRed,
  glowGold,
  deposit: iconDeposit,
  bonus: iconBonus,
  balance: iconBalance,
  profit: iconProfit,
  turnover: iconTurnover,
} as const;
