import { VIPTier, VIPConfig } from '../types';

export const VIP_CONFIGS: Record<VIPTier, VIPConfig> = {
  STANDARD: {
    tier: 'STANDARD',
    label: 'Standard Member',
    discountPercent: 0,
    depositBonusPercent: 0,
    badgeBg: 'bg-zinc-800/80',
    badgeBorder: 'border-zinc-700/60',
    badgeText: 'text-zinc-300',
    glowClass: 'shadow-[0_0_10px_rgba(255,255,255,0.05)]',
    perks: ['Standard Store Access', 'Genesis Card Drop Access', '24/7 Security Vault']
  },
  SILVER: {
    tier: 'SILVER',
    label: 'Silver VIP',
    discountPercent: 5,
    depositBonusPercent: 2,
    badgeBg: 'bg-slate-700/60',
    badgeBorder: 'border-slate-400/50',
    badgeText: 'text-slate-200',
    glowClass: 'shadow-[0_0_15px_rgba(203,213,225,0.25)]',
    perks: ['5% Auto Discount on All Cards', '2% Extra Deposit Bonus', 'Silver VIP Card Border', 'Priority Verification']
  },
  GOLD: {
    tier: 'GOLD',
    label: 'Gold VIP',
    discountPercent: 10,
    depositBonusPercent: 5,
    badgeBg: 'bg-amber-950/60',
    badgeBorder: 'border-amber-500/60',
    badgeText: 'text-amber-300',
    glowClass: 'shadow-[0_0_20px_rgba(251,191,36,0.35)]',
    perks: ['10% Auto Discount on All Cards', '5% Extra Deposit Bonus', 'Gold Foil Aura', 'Dedicated Concierge', 'Early Vault Access']
  },
  PLATINUM: {
    tier: 'PLATINUM',
    label: 'Platinum Elite',
    discountPercent: 15,
    depositBonusPercent: 8,
    badgeBg: 'bg-cyan-950/60',
    badgeBorder: 'border-cyan-400/60',
    badgeText: 'text-cyan-200',
    glowClass: 'shadow-[0_0_25px_rgba(34,211,238,0.4)]',
    perks: ['15% Auto Discount on All Cards', '8% Extra Deposit Bonus', 'Cyan Specular Halo', 'Zero Fee Fast Transfers', 'Exclusive Drops']
  },
  OBSIDIAN: {
    tier: 'OBSIDIAN',
    label: 'Obsidian Royale',
    discountPercent: 25,
    depositBonusPercent: 15,
    badgeBg: 'bg-purple-950/80',
    badgeBorder: 'border-purple-500/70',
    badgeText: 'text-purple-200',
    glowClass: 'shadow-[0_0_30px_rgba(168,85,247,0.5)]',
    perks: ['25% Supreme Discount', '15% Extra Deposit Bonus', 'Infinite Noir Hologram', 'Personal Account Manager', 'Custom Card Engraving']
  }
};

export const getVIPConfig = (tierName?: string): VIPConfig => {
  if (!tierName) return VIP_CONFIGS.STANDARD;
  const normalized = tierName.toUpperCase().trim();
  
  if (normalized.includes('OBSIDIAN') || normalized.includes('ROYALE') || normalized.includes('DIAMOND')) {
    return VIP_CONFIGS.OBSIDIAN;
  }
  if (normalized.includes('PLATINUM') || normalized.includes('ELITE')) {
    return VIP_CONFIGS.PLATINUM;
  }
  if (normalized.includes('GOLD')) {
    return VIP_CONFIGS.GOLD;
  }
  if (normalized.includes('SILVER')) {
    return VIP_CONFIGS.SILVER;
  }
  return VIP_CONFIGS.STANDARD;
};

export const calculateVIPDiscount = (price: number, membershipTier?: string): { discountAmount: number; finalPrice: number; discountPercent: number } => {
  const config = getVIPConfig(membershipTier);
  const discountPercent = config.discountPercent;
  const discountAmount = Math.round((price * discountPercent) / 100);
  const finalPrice = Math.max(0, price - discountAmount);
  return {
    discountAmount,
    finalPrice,
    discountPercent
  };
};
