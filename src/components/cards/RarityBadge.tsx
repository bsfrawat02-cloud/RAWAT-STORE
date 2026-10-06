import React from 'react';
import { motion } from 'motion/react';
import { CardRarity } from '../../types';
import { getRarityConfig } from '../../utils/rarity';
import { Shield, Sparkles, Crown, Flame, Zap } from 'lucide-react';

interface RarityBadgeProps {
  rarity?: CardRarity | string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showGlow?: boolean;
  className?: string;
  animateEntry?: boolean;
}

export const RarityBadge: React.FC<RarityBadgeProps> = ({
  rarity = 'Rare',
  size = 'sm',
  showIcon = true,
  showGlow = false,
  className = '',
  animateEntry = true,
}) => {
  const config = getRarityConfig(rarity);

  const getIcon = () => {
    const iconSize = size === 'xs' ? 10 : size === 'sm' ? 12 : size === 'lg' ? 16 : 14;
    switch (rarity) {
      case 'Legendary':
        return (
          <span className="relative flex items-center justify-center">
            <Flame size={iconSize} className="text-amber-400 fill-amber-400/40 animate-pulse shrink-0 drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
            <span className="absolute inset-0 animate-ping opacity-30 rounded-full bg-amber-400" />
          </span>
        );
      case 'Mythic':
        return (
          <span className="relative flex items-center justify-center">
            <Zap size={iconSize} className="text-rose-300 fill-rose-400/50 animate-pulse shrink-0 drop-shadow-[0_0_6px_rgba(244,63,94,0.8)]" />
            <span className="absolute inset-0 animate-ping opacity-30 rounded-full bg-rose-400" />
          </span>
        );
      case 'Epic':
        return (
          <Crown size={iconSize} className="text-purple-300 fill-purple-400/30 shrink-0 drop-shadow-[0_0_4px_rgba(192,132,252,0.6)]" />
        );
      case 'Rare':
        return (
          <Sparkles size={iconSize} className="text-sky-300 shrink-0 drop-shadow-[0_0_4px_rgba(56,189,248,0.5)]" />
        );
      case 'Common':
      default:
        return <Shield size={iconSize} className="text-slate-300 shrink-0" />;
    }
  };

  const sizeClasses = {
    xs: 'px-2 py-0.5 text-[8px] gap-1 font-mono tracking-wider',
    sm: 'px-2.5 py-0.5 text-[9px] sm:text-[10px] gap-1.5 font-mono tracking-wider',
    md: 'px-3 py-1 text-xs gap-1.5 font-mono tracking-widest',
    lg: 'px-4 py-1.5 text-sm gap-2 font-mono tracking-widest',
  };

  // Dedicated Tier-Based Glowing Border Pulses
  const getTierPulseStyle = () => {
    switch (rarity) {
      case 'Legendary':
        return showGlow
          ? 'border-amber-400/90 bg-gradient-to-r from-amber-950/80 via-yellow-950/90 to-amber-950/80 text-amber-200 shadow-[0_0_20px_rgba(251,191,36,0.65)] ring-1 ring-amber-400/60 animate-pulse'
          : 'border-amber-400/70 bg-gradient-to-r from-amber-950/70 to-yellow-950/70 text-amber-200 shadow-[0_0_12px_rgba(251,191,36,0.45)] ring-1 ring-amber-400/40 hover:shadow-[0_0_18px_rgba(251,191,36,0.7)]';
      case 'Mythic':
        return showGlow
          ? 'border-rose-400/90 bg-gradient-to-r from-rose-950/80 via-pink-950/90 to-rose-950/80 text-rose-200 shadow-[0_0_20px_rgba(244,63,94,0.65)] ring-1 ring-rose-400/60 animate-pulse'
          : 'border-rose-400/70 bg-gradient-to-r from-rose-950/70 to-pink-950/70 text-rose-200 shadow-[0_0_12px_rgba(244,63,94,0.45)] ring-1 ring-rose-400/40 hover:shadow-[0_0_18px_rgba(244,63,94,0.7)]';
      case 'Epic':
        return showGlow
          ? 'border-purple-400/80 bg-purple-950/70 text-purple-200 shadow-[0_0_16px_rgba(192,132,252,0.55)] ring-1 ring-purple-400/40'
          : 'border-purple-500/60 bg-purple-950/50 text-purple-200 shadow-[0_0_8px_rgba(192,132,252,0.3)] ring-1 ring-purple-500/30 hover:shadow-[0_0_14px_rgba(192,132,252,0.5)]';
      case 'Rare':
        return showGlow
          ? 'border-sky-400/80 bg-sky-950/70 text-sky-200 shadow-[0_0_14px_rgba(56,189,248,0.45)] ring-1 ring-sky-400/40'
          : 'border-sky-500/50 bg-sky-950/40 text-sky-200 shadow-[0_0_6px_rgba(56,189,248,0.2)] ring-1 ring-sky-500/20';
      case 'Common':
      default:
        return 'border-slate-500/40 bg-slate-900/50 text-slate-300 shadow-sm';
    }
  };

  const badgeContent = (
    <span
      className={`relative inline-flex items-center rounded-full border uppercase font-bold font-mono transition-all duration-300 overflow-hidden ${getTierPulseStyle()} ${sizeClasses[size]} ${className}`}
    >
      {/* Ambient Inner Shimmer Sweep for Higher Tiers */}
      {(rarity === 'Legendary' || rarity === 'Mythic') && (
        <span className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
      )}

      {showIcon && getIcon()}
      <span className="relative z-10 tracking-wider">{config.label}</span>
    </span>
  );

  if (!animateEntry) {
    return badgeContent;
  }

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.88, y: -2 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="inline-flex"
    >
      {badgeContent}
    </motion.span>
  );
};
