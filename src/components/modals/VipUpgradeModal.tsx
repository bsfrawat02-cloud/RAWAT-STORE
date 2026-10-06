import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../context/StoreContext';
import { VIPTier } from '../../types';
import { VIP_CONFIGS, getVIPConfig } from '../../utils/vip';
import { playSound } from '../../utils/audio';
import { triggerCoinFountain } from '../common/CoinBurst';
import confetti from 'canvas-confetti';
import {
  X,
  Crown,
  Sparkles,
  ShieldCheck,
  Check,
  Zap,
  ArrowRight,
  TrendingUp,
  Percent
} from 'lucide-react';

interface VipUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetTier?: VIPTier;
}

export const VipUpgradeModal: React.FC<VipUpgradeModalProps> = ({
  isOpen,
  onClose,
  targetTier = 'PLATINUM',
}) => {
  const { soundEnabled, userProfile } = useStore();
  const [activeTier, setActiveTier] = useState<VIPTier>(targetTier);

  if (!isOpen) return null;

  const vipConfig = VIP_CONFIGS[activeTier] || VIP_CONFIGS.PLATINUM;

  const handleClaim = () => {
    playSound('supernova', soundEnabled);
    confetti({
      particleCount: 100,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#a855f7', '#38bdf8', '#fbbf24', '#ffffff'],
    });
    triggerCoinFountain({ count: 20 });
    setTimeout(onClose, 400);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Backdrop Glow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-40 cursor-pointer"
        />

        {/* Celebration Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 30 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-lg rounded-3xl border border-white/20 bg-gradient-to-b from-zinc-950 via-[#0d091a] to-black shadow-[0_0_120px_rgba(168,85,247,0.5)] backdrop-blur-3xl z-50 overflow-hidden my-auto p-6 sm:p-8 flex flex-col items-center text-center"
        >
          {/* Ambient Supernova Blast Radial Glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-purple-600/30 blur-[120px] pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={() => {
              playSound('click', soundEnabled);
              onClose();
            }}
            className="absolute top-4 right-4 p-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-all cursor-pointer z-50"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header Tag */}
          <div className="space-y-1 mb-6 z-10">
            <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-amber-400 font-bold uppercase tracking-widest">
              <Crown className="w-4 h-4 text-amber-400 animate-bounce" />
              <span>VIP TIER ASCENSION CEREMONY</span>
            </div>
            <h2 className="font-tech font-black text-2xl sm:text-3xl text-white">
              Status Upgraded to {vipConfig.label}!
            </h2>
          </div>

          {/* ========================================================
              3D ROTATING METALLIC BADGE MORPHING STAGE
          ======================================================== */}
          <div className="relative w-36 h-36 my-3 flex items-center justify-center preserve-3d">
            {/* Outer Spinning Halo Ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
              className="absolute inset-0 rounded-full border-2 border-dashed border-purple-400/50"
            />
            
            {/* Outer Secondary Counter-Spin Ring */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 12, ease: 'linear' }}
              className="absolute -inset-2 rounded-full border border-cyan-400/30"
            />

            {/* Inner Metallic Emblem Badge */}
            <motion.div
              initial={{ scale: 0, rotateY: 180 }}
              animate={{ scale: 1, rotateY: 0 }}
              transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }}
              className={`w-28 h-28 rounded-3xl ${vipConfig.badgeBg} border-2 ${vipConfig.badgeBorder} shadow-2xl flex flex-col items-center justify-center p-3 relative overflow-hidden backdrop-blur-xl group`}
            >
              {/* Shimmer Specular Beam */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/25 to-transparent animate-shimmer pointer-events-none" />

              <Crown className="w-10 h-10 text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)] mb-1" />
              <span className="font-tech font-black text-xs text-white tracking-widest uppercase">
                {activeTier}
              </span>
              <span className="text-[9px] font-mono text-cyan-300 font-bold">
                +{vipConfig.discountPercent}% OFF
              </span>
            </motion.div>
          </div>

          {/* Quick Tier Switcher Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/60 border border-white/10 my-3 z-10">
            {(['SILVER', 'GOLD', 'PLATINUM', 'OBSIDIAN'] as VIPTier[]).map((t) => (
              <button
                key={t}
                onClick={() => {
                  playSound('click', soundEnabled);
                  setActiveTier(t);
                }}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold transition-all cursor-pointer ${
                  activeTier === t
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Privilege Stats Summary Cards */}
          <div className="grid grid-cols-2 gap-3 w-full my-3 z-10">
            <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 text-left">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                Catalog Discount
              </span>
              <span className="font-tech font-bold text-lg text-emerald-400">
                {vipConfig.discountPercent}% OFF
              </span>
              <span className="text-[9px] font-mono text-slate-500 block">Applied automatically</span>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 text-left">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                Deposit Bonus
              </span>
              <span className="font-tech font-bold text-lg text-cyan-400">
                +{vipConfig.depositBonusPercent}% Cash
              </span>
              <span className="text-[9px] font-mono text-slate-500 block">On all UPI deposits</span>
            </div>
          </div>

          {/* Unlocked Capabilities List */}
          <div className="w-full p-4 rounded-2xl bg-black/50 border border-white/10 text-left space-y-2 z-10 my-2">
            <span className="text-[10px] font-mono text-purple-300 uppercase tracking-wider font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Unlocked VIP Privileges:</span>
            </span>
            <div className="space-y-1.5 font-mono text-xs text-slate-300">
              {vipConfig.perks.map((perk, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span className="truncate">{perk}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Claim Button */}
          <div className="w-full pt-3 z-10">
            <button
              onClick={handleClaim}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 hover:opacity-95 text-white font-mono text-xs font-black uppercase tracking-wider shadow-lg shadow-purple-600/40 transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Claim & Activate VIP Status</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
