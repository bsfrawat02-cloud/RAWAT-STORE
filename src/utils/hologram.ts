import { HolographicOverlayType, CardRarity } from '../types';

export interface HologramConfig {
  id: HolographicOverlayType;
  name: string;
  badge: string;
  tagline: string;
  description: string;
  accentColor: string;
  secondaryColor: string;
  glowColor: string;
  iconName: string;
  recommendedRarities: CardRarity[];
  // Overlay Visual Properties
  gradientCss: string;
  blendMode: 'screen' | 'overlay' | 'color-dodge' | 'hard-light' | 'soft-light';
  foilPattern: 'prism' | 'laser' | 'starlight' | 'gold_leaf' | 'circuit' | 'liquid' | 'crystal' | 'aurora' | 'glitch' | 'none';
  defaultIntensity: number; // 0.1 to 1.0
  lightRayClass: string;
}

export const HOLOGRAM_CONFIGS: Record<HolographicOverlayType, HologramConfig> = {
  prism_rainbow: {
    id: 'prism_rainbow',
    name: 'Prism Rainbow Shimmer',
    badge: 'PRISM 7-COLOR',
    tagline: 'Multi-angle spectral dispersion with diamond light splits',
    description: 'Simulates high-grade optical prism holographic diffraction grating with sweeping rainbow streaks and acute specular flash.',
    accentColor: '#38bdf8',
    secondaryColor: '#f43f5e',
    glowColor: 'rgba(56, 189, 248, 0.4)',
    iconName: 'Sparkles',
    recommendedRarities: ['Epic', 'Mythic', 'Legendary'],
    gradientCss: 'linear-gradient(135deg, rgba(255,0,128,0.28) 0%, rgba(255,165,0,0.25) 20%, rgba(255,255,0,0.22) 40%, rgba(0,255,128,0.25) 60%, rgba(0,180,255,0.3) 80%, rgba(180,0,255,0.28) 100%)',
    blendMode: 'color-dodge',
    foilPattern: 'prism',
    defaultIntensity: 0.85,
    lightRayClass: 'bg-gradient-to-tr from-cyan-400/20 via-pink-500/25 to-yellow-300/20',
  },
  quantum_laser: {
    id: 'quantum_laser',
    name: 'Quantum Laser Matrix',
    badge: 'QUANTUM LASER',
    tagline: 'High-frequency neon diffraction laser grid beams',
    description: 'Cross-hatch micro-etched laser foil with vivid neon cyan and hot magenta photon beams that activate on card tilt.',
    accentColor: '#06b6d4',
    secondaryColor: '#ec4899',
    glowColor: 'rgba(6, 182, 212, 0.45)',
    iconName: 'Zap',
    recommendedRarities: ['Rare', 'Epic', 'Legendary'],
    gradientCss: 'linear-gradient(45deg, rgba(6,182,212,0.35) 0%, rgba(236,72,153,0.35) 50%, rgba(59,130,246,0.35) 100%)',
    blendMode: 'screen',
    foilPattern: 'laser',
    defaultIntensity: 0.9,
    lightRayClass: 'bg-gradient-to-r from-cyan-500/25 via-fuchsia-500/30 to-blue-500/25',
  },
  cosmic_starlight: {
    id: 'cosmic_starlight',
    name: 'Cosmic Starlight Glow',
    badge: 'COSMIC STARLIGHT',
    tagline: 'Deep astral nebula with celestial stardust sparkles',
    description: 'Interstellar velvet sheen layered with twinkling particle stars, violet gas clusters, and supernova glimmers.',
    accentColor: '#a855f7',
    secondaryColor: '#eab308',
    glowColor: 'rgba(168, 85, 247, 0.45)',
    iconName: 'Moon',
    recommendedRarities: ['Mythic', 'Legendary'],
    gradientCss: 'radial-gradient(ellipse at center, rgba(168,85,247,0.35) 0%, rgba(59,130,246,0.25) 45%, rgba(234,179,8,0.2) 100%)',
    blendMode: 'color-dodge',
    foilPattern: 'starlight',
    defaultIntensity: 0.8,
    lightRayClass: 'bg-gradient-to-br from-purple-500/30 via-indigo-400/20 to-amber-300/20',
  },
  hyper_gold_foil: {
    id: 'hyper_gold_foil',
    name: 'Hyper 24K Gold Foil',
    badge: '24K SOLAR FOIL',
    tagline: 'Ultra-pure gilded micro-embossed metallic luster',
    description: 'Heavily stamped micro-relief gold leafing with warm sunburst specular flares and high-carat bullion sheen.',
    accentColor: '#fbbf24',
    secondaryColor: '#f59e0b',
    glowColor: 'rgba(251, 191, 36, 0.5)',
    iconName: 'Crown',
    recommendedRarities: ['Legendary'],
    gradientCss: 'linear-gradient(120deg, rgba(251,191,36,0.45) 0%, rgba(245,158,11,0.3) 30%, rgba(254,240,138,0.5) 60%, rgba(217,119,6,0.35) 100%)',
    blendMode: 'overlay',
    foilPattern: 'gold_leaf',
    defaultIntensity: 0.95,
    lightRayClass: 'bg-gradient-to-tr from-amber-400/30 via-yellow-200/40 to-amber-600/30',
  },
  obsidian_circuit: {
    id: 'obsidian_circuit',
    name: 'Obsidian Cyber Circuit',
    badge: 'CYBER CIRCUIT',
    tagline: 'Nano-scale electric trace paths on dark titanium',
    description: 'Blackened titanium matrix with pulsing ultraviolet bus traces and micro-conductive quantum logic paths.',
    accentColor: '#c084fc',
    secondaryColor: '#38bdf8',
    glowColor: 'rgba(192, 132, 252, 0.4)',
    iconName: 'Cpu',
    recommendedRarities: ['Epic', 'Mythic'],
    gradientCss: 'linear-gradient(90deg, rgba(192,132,252,0.3) 0%, rgba(56,189,248,0.2) 50%, rgba(147,51,234,0.35) 100%)',
    blendMode: 'screen',
    foilPattern: 'circuit',
    defaultIntensity: 0.75,
    lightRayClass: 'bg-gradient-to-r from-purple-500/25 via-sky-400/20 to-purple-600/25',
  },
  iridescent_liquid: {
    id: 'iridescent_liquid',
    name: 'Iridescent Liquid Chrome',
    badge: 'LIQUID CHROME',
    tagline: 'Fluid mercury reflection with shifting oil-slick sheen',
    description: 'Dynamic fluid metallic surface that changes color fluidly as ambient lighting sweeps from left to right.',
    accentColor: '#2dd4bf',
    secondaryColor: '#f43f5e',
    glowColor: 'rgba(45, 212, 191, 0.4)',
    iconName: 'Droplets',
    recommendedRarities: ['Rare', 'Epic', 'Mythic'],
    gradientCss: 'linear-gradient(160deg, rgba(45,212,191,0.35) 0%, rgba(244,63,94,0.28) 40%, rgba(168,85,247,0.3) 70%, rgba(56,189,248,0.3) 100%)',
    blendMode: 'color-dodge',
    foilPattern: 'liquid',
    defaultIntensity: 0.85,
    lightRayClass: 'bg-gradient-to-tr from-teal-400/25 via-rose-400/20 to-indigo-400/25',
  },
  amethyst_flare: {
    id: 'amethyst_flare',
    name: 'Amethyst Crystal Flare',
    badge: 'AMETHYST GEODE',
    tagline: 'Multi-faceted gemstone refraction with violet sparkle',
    description: 'Precision-cut crystalline facets creating geometric purple diamond flares and vivid royal prismatic sparkles.',
    accentColor: '#d946ef',
    secondaryColor: '#8b5cf6',
    glowColor: 'rgba(217, 70, 239, 0.45)',
    iconName: 'Gem',
    recommendedRarities: ['Epic', 'Mythic'],
    gradientCss: 'linear-gradient(135deg, rgba(217,70,239,0.35) 0%, rgba(139,92,246,0.35) 50%, rgba(244,114,182,0.3) 100%)',
    blendMode: 'screen',
    foilPattern: 'crystal',
    defaultIntensity: 0.85,
    lightRayClass: 'bg-gradient-to-br from-fuchsia-500/30 via-purple-500/25 to-pink-400/25',
  },
  emerald_aurora: {
    id: 'emerald_aurora',
    name: 'Emerald Aurora Matrix',
    badge: 'AURORA EMERALD',
    tagline: 'Polar electromagnetic green waves with teal currents',
    description: 'Ethereal ribbons of emerald and mint luminescence inspired by the Arctic borealis dancing across obsidian alloy.',
    accentColor: '#10b981',
    secondaryColor: '#06b6d4',
    glowColor: 'rgba(16, 185, 129, 0.45)',
    iconName: 'Flame',
    recommendedRarities: ['Rare', 'Epic', 'Legendary'],
    gradientCss: 'linear-gradient(110deg, rgba(16,185,129,0.35) 0%, rgba(6,182,212,0.35) 45%, rgba(52,211,153,0.4) 80%, rgba(15,118,110,0.3) 100%)',
    blendMode: 'color-dodge',
    foilPattern: 'aurora',
    defaultIntensity: 0.8,
    lightRayClass: 'bg-gradient-to-tr from-emerald-400/30 via-teal-400/25 to-cyan-300/25',
  },
  glitch_hologram: {
    id: 'glitch_hologram',
    name: 'Glitch Cyber Hologram',
    badge: 'CYBER GLITCH',
    tagline: 'CRT scanlines, chromatic aberration & quantum noise',
    description: 'Retro-futuristic holographic transmission glitch with horizontal raster lines, RGB color channel split, and jitter flares.',
    accentColor: '#f43f5e',
    secondaryColor: '#06b6d4',
    glowColor: 'rgba(244, 63, 94, 0.4)',
    iconName: 'Radio',
    recommendedRarities: ['Epic', 'Mythic'],
    gradientCss: 'linear-gradient(180deg, rgba(244,63,94,0.2) 0%, rgba(6,182,212,0.25) 50%, rgba(244,63,94,0.2) 100%)',
    blendMode: 'screen',
    foilPattern: 'glitch',
    defaultIntensity: 0.75,
    lightRayClass: 'bg-gradient-to-b from-rose-500/20 via-cyan-400/20 to-rose-500/20',
  },
  none: {
    id: 'none',
    name: 'Classic Matte Lustre',
    badge: 'CLASSIC MATTE',
    tagline: 'Subtle specular sheen with clean metallic reflection',
    description: 'Pure refined collectible aesthetic with smooth brushed alloy texture and balanced specular highlight without heavy holographic dispersion.',
    accentColor: '#94a3b8',
    secondaryColor: '#cbd5e1',
    glowColor: 'rgba(148, 163, 184, 0.25)',
    iconName: 'Layers',
    recommendedRarities: ['Common', 'Rare'],
    gradientCss: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 60%, rgba(255,255,255,0.05) 100%)',
    blendMode: 'overlay',
    foilPattern: 'none',
    defaultIntensity: 0.3,
    lightRayClass: 'bg-gradient-to-tr from-white/10 via-transparent to-white/5',
  },
};

export const ALL_HOLOGRAMS: HolographicOverlayType[] = [
  'prism_rainbow',
  'quantum_laser',
  'cosmic_starlight',
  'hyper_gold_foil',
  'obsidian_circuit',
  'iridescent_liquid',
  'amethyst_flare',
  'emerald_aurora',
  'glitch_hologram',
  'none',
];

export function getHologramConfig(type?: HolographicOverlayType | string): HologramConfig {
  if (type && HOLOGRAM_CONFIGS[type as HolographicOverlayType]) {
    return HOLOGRAM_CONFIGS[type as HolographicOverlayType];
  }
  return HOLOGRAM_CONFIGS['prism_rainbow'];
}
