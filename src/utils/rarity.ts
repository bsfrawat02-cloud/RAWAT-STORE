import { CardRarity } from '../types';

export interface RarityConfig {
  name: CardRarity;
  label: string;
  tagline: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  cardBorderGlow: string;
  cardOuterShadow: string;
  cardAuraClass: string;
  ringClass: string;
  accentHex: string;
  dropRate: string;
  particleColor: string;
}

export const RARITY_CONFIGS: Record<CardRarity, RarityConfig> = {
  Common: {
    name: 'Common',
    label: 'COMMON',
    tagline: 'Standard Collector Issue',
    badgeBg: 'bg-slate-900/90 backdrop-blur-md',
    badgeText: 'text-slate-200',
    badgeBorder: 'border-slate-400/80',
    cardBorderGlow: 'border-slate-400/60 hover:border-slate-300 shadow-[0_0_16px_rgba(148,163,184,0.25)]',
    cardOuterShadow: 'shadow-[0_0_18px_rgba(148,163,184,0.2)]',
    cardAuraClass: 'from-slate-500/15 via-transparent to-transparent',
    ringClass: 'ring-1 ring-slate-400/30',
    accentHex: '#94a3b8',
    dropRate: 'Standard Issue',
    particleColor: 'rgba(148, 163, 184, 0.5)',
  },
  Rare: {
    name: 'Rare',
    label: 'RARE',
    tagline: 'Cobalt Specular Core',
    badgeBg: 'bg-sky-950/90 backdrop-blur-md',
    badgeText: 'text-sky-300',
    badgeBorder: 'border-sky-400',
    cardBorderGlow: 'border-sky-400/70 hover:border-sky-300 shadow-[0_0_24px_rgba(56,189,248,0.4)]',
    cardOuterShadow: 'shadow-[0_0_26px_rgba(56,189,248,0.35)]',
    cardAuraClass: 'from-sky-500/25 via-sky-900/15 to-transparent',
    ringClass: 'ring-1 ring-sky-400/50 shadow-sky-500/25',
    accentHex: '#38bdf8',
    dropRate: 'Limited Run (Top 25%)',
    particleColor: 'rgba(56, 189, 248, 0.75)',
  },
  Epic: {
    name: 'Epic',
    label: 'EPIC',
    tagline: 'Royal Prismatic Foil',
    badgeBg: 'bg-purple-950/90 backdrop-blur-md',
    badgeText: 'text-purple-300',
    badgeBorder: 'border-purple-400',
    cardBorderGlow: 'border-purple-400/80 hover:border-purple-300 shadow-[0_0_30px_rgba(192,132,252,0.5)]',
    cardOuterShadow: 'shadow-[0_0_32px_rgba(192,132,252,0.45)]',
    cardAuraClass: 'from-purple-600/30 via-fuchsia-900/20 to-transparent',
    ringClass: 'ring-1 ring-purple-400/60 shadow-purple-500/35',
    accentHex: '#c084fc',
    dropRate: 'Exclusive Run (Top 10%)',
    particleColor: 'rgba(192, 132, 252, 0.85)',
  },
  Mythic: {
    name: 'Mythic',
    label: 'MYTHIC',
    tagline: 'Prismatic Crimson Core',
    badgeBg: 'bg-gradient-to-r from-rose-950/95 via-red-950/90 to-rose-900/95 backdrop-blur-md',
    badgeText: 'text-rose-300',
    badgeBorder: 'border-rose-500',
    cardBorderGlow: 'border-rose-500/85 hover:border-rose-300 shadow-[0_0_35px_rgba(244,63,94,0.55)]',
    cardOuterShadow: 'shadow-[0_0_38px_rgba(244,63,94,0.5)]',
    cardAuraClass: 'from-rose-600/35 via-red-900/25 to-transparent',
    ringClass: 'ring-2 ring-rose-400/70 shadow-rose-500/40',
    accentHex: '#f43f5e',
    dropRate: 'Mythical Artifact (Top 3%)',
    particleColor: 'rgba(244, 63, 94, 0.9)',
  },
  Legendary: {
    name: 'Legendary',
    label: 'LEGENDARY',
    tagline: '24K Solar Crown Jewel',
    badgeBg: 'bg-gradient-to-r from-amber-950/95 via-yellow-950/90 to-amber-900/95 backdrop-blur-md',
    badgeText: 'text-amber-300',
    badgeBorder: 'border-amber-400',
    cardBorderGlow: 'border-amber-400/90 hover:border-yellow-300 shadow-[0_0_40px_rgba(251,191,36,0.65)]',
    cardOuterShadow: 'shadow-[0_0_42px_rgba(251,191,36,0.55)]',
    cardAuraClass: 'from-amber-500/35 via-yellow-500/25 to-amber-950/15',
    ringClass: 'ring-2 ring-amber-400/70 shadow-amber-500/45',
    accentHex: '#fbbf24',
    dropRate: 'Apex Masterpiece (Top 1%)',
    particleColor: 'rgba(251, 191, 36, 0.95)',
  },
};

export const ALL_RARITIES: CardRarity[] = ['Common', 'Rare', 'Epic', 'Mythic', 'Legendary'];

export function getRarityConfig(rarity?: string | CardRarity): RarityConfig {
  if (rarity && RARITY_CONFIGS[rarity as CardRarity]) {
    return RARITY_CONFIGS[rarity as CardRarity];
  }
  return RARITY_CONFIGS.Rare; // default fallback
}
