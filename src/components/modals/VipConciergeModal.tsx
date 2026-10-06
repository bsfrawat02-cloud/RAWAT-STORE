import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Crown,
  Send,
  Sparkles,
  ShieldCheck,
  Award,
  Lock,
  ArrowRight,
  X,
  CreditCard,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { playSound } from '../../utils/audio';

interface VipConciergeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VipConciergeModal: React.FC<VipConciergeModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, currentBalance, formatPrice, soundEnabled, setActiveTab } = useStore();
  const [activeTabSub, setActiveTabSub] = useState<'concierge' | 'allocations' | 'card'>('concierge');

  if (!isOpen) return null;

  const vipTier = currentUser?.membershipTier || 'Royal Noir';

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-200 overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#101018] via-[#09090e] to-[#050508] border border-amber-500/30 rounded-3xl p-5 sm:p-8 shadow-[0_25px_80px_rgba(0,0,0,0.9),0_0_40px_rgba(212,175,55,0.1)] text-white">
        {/* Top Close Button */}
        <button
          onClick={() => {
            playSound('click', soundEnabled);
            onClose();
          }}
          className="absolute top-4 right-4 h-9 w-9 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-white/10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with VIP Seal */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-600 flex items-center justify-center text-black font-black shadow-lg shadow-amber-500/30">
            <Crown className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-brand font-black text-xl sm:text-2xl text-amber-300 tracking-wide">
                VIP CONCIERGE LOUNGE
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[9px] font-mono font-bold uppercase">
                {vipTier}
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-mono">
              High-Net-Worth Collector Suite &bull; Verified Merchant @carderseller1
            </p>
          </div>
        </div>

        {/* Segmented Sub-tabs */}
        <div className="flex items-center gap-2 p-1 rounded-xl bg-black/60 border border-white/10 mb-6 font-mono text-xs">
          <button
            onClick={() => {
              playSound('click', soundEnabled);
              setActiveTabSub('concierge');
            }}
            className={`flex-1 py-1.5 px-3 rounded-lg transition-all cursor-pointer text-center font-bold ${
              activeTabSub === 'concierge'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Direct Concierge Desk
          </button>
          <button
            onClick={() => {
              playSound('click', soundEnabled);
              setActiveTabSub('allocations');
            }}
            className={`flex-1 py-1.5 px-3 rounded-lg transition-all cursor-pointer text-center font-bold ${
              activeTabSub === 'allocations'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Reserved Secret Allocations
          </button>
          <button
            onClick={() => {
              playSound('click', soundEnabled);
              setActiveTabSub('card');
            }}
            className={`flex-1 py-1.5 px-3 rounded-lg transition-all cursor-pointer text-center font-bold ${
              activeTabSub === 'card'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Metal VIP Credential
          </button>
        </div>

        {/* Tab 1: Concierge Desk */}
        {activeTabSub === 'concierge' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-amber-300">Dedicated 24/7 High-Roller Desk</h4>
                <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                  As a valued VIP collector, you bypass normal queues. Get bespoke card sourcing, instant manual UPI / Crypto deposit verification, and private over-the-counter card deals directly with founder @carderseller1.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] text-zinc-400 uppercase">Current Portfolio Power</span>
                <p className="text-lg font-bold text-emerald-400">{formatPrice(currentBalance)}</p>
                <p className="text-[10px] text-zinc-500">Instant liquidity in Rawat Vault</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] text-zinc-400 uppercase">Slab Certification Status</span>
                <p className="text-lg font-bold text-amber-300">PSA 10 Pre-Qualified</p>
                <p className="text-[10px] text-zinc-500">Every card ships with serial integrity</p>
              </div>
            </div>

            <a
              href="https://t.me/carderseller1"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => playSound('gold_chime', soundEnabled)}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-tech font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer mt-4"
            >
              <Send className="w-4 h-4" />
              <span>Connect with Private VIP Concierge (@carderseller1)</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        )}

        {/* Tab 2: Reserved Secret Allocations */}
        {activeTabSub === 'allocations' && (
          <div className="space-y-3">
            <p className="text-xs text-zinc-400 font-mono">
              Private vault reserves accessible exclusively to Tier 4+ and Royal Noir VIP holders:
            </p>

            <div className="space-y-2">
              {[
                { name: 'Apex Zenith Imperial Black #001', price: '₹65,000', rarity: 'Mythic 1-of-1', limit: '₹7,50,000 (11.5X+ Limit)' },
                { name: 'Obsidian Sovereign Dubai Royale', price: '₹48,000', rarity: 'Legendary 1-of-5', limit: '₹5,50,000 (11.4X+ Limit)' },
                { name: 'Genesis Golden Dragon Centurion', price: '₹39,000', rarity: 'Legendary 1-of-10', limit: '₹4,50,000 (11.5X+ Limit)' },
              ].map((alloc, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-white/[0.03] border border-amber-500/20 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <h5 className="font-bold text-white font-tech text-sm">{alloc.name}</h5>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono mt-0.5">
                      <span className="text-amber-400 font-bold">{alloc.rarity}</span>
                      <span>&bull;</span>
                      <span>Limit: {alloc.limit}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-amber-300 font-mono text-sm">{alloc.price}</span>
                    <a
                      href="https://t.me/carderseller1"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-[10px] font-mono text-sky-400 hover:text-sky-300 underline mt-0.5"
                    >
                      Reserve via Concierge &rarr;
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Metal VIP Credential */}
        {activeTabSub === 'card' && (
          <div className="flex flex-col items-center justify-center py-4 space-y-4">
            <div className="w-80 h-48 rounded-2xl bg-gradient-to-br from-zinc-900 via-black to-zinc-950 border border-amber-400/50 p-5 flex flex-col justify-between shadow-[0_20px_50px_rgba(212,175,55,0.25)] relative overflow-hidden font-mono">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between">
                <span className="font-brand font-black text-amber-300 tracking-widest text-sm">
                  RAWAT CENTURION
                </span>
                <Crown className="w-5 h-5 text-amber-400" />
              </div>

              <div className="space-y-1">
                <p className="text-[10px] text-zinc-500">MEMBER SINCE 2026</p>
                <p className="font-bold text-white tracking-widest text-sm">
                  {currentUser?.username ? `@${currentUser.username.toUpperCase()}` : 'VIP COLLECTOR'}
                </p>
                <p className="text-[9px] text-amber-400/90 font-bold tracking-widest">
                  TIER: {vipTier.toUpperCase()}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-white/10 pt-2 text-[8px] text-zinc-400">
                <span>EXCLUSIVE ACCESS SLAB #001</span>
                <span>AUTHENTICATED</span>
              </div>
            </div>

            <p className="text-xs text-zinc-400 font-mono text-center max-w-sm">
              Your digital metal VIP pass grants zero trading fees and automated PSA 10 slabs on all acquisitions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
