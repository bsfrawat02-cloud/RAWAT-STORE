import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Realistic3DCard } from '../cards/Realistic3DCard';
import { Sparkles, ArrowRight, Layers, Zap, Wallet, ShoppingBag, User, ShieldCheck, Crown, Lock } from 'lucide-react';
import { playSound } from '../../utils/audio';

export const HeroSection: React.FC = () => {
  const {
    cards,
    currentUser,
    currentBalance,
    formatPrice,
    orders,
    ownedCardIds,
    setActiveTab,
    setSelectedCard,
    setIsPaymentModalOpen,
    soundEnabled,
    setIsVipConciergeOpen,
    triggerCinematicUnlock
  } = useStore();

  // Featured hero card
  const heroCard = cards[0];

  return (
    <section className="mb-10 relative">
      {/* Customer Dashboard Welcome Banner (If Logged In) */}
      {currentUser && (
        <div className="mb-6 rounded-2xl sm:rounded-3xl border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-[#0c0d18] to-slate-950 p-4 sm:p-7 backdrop-blur-xl shadow-xl overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                <span className="font-mono text-[10px] sm:text-xs text-purple-300 uppercase tracking-widest font-semibold">
                  CUSTOMER DASHBOARD
                </span>
              </div>
              <h2 className="text-xl sm:text-3xl font-tech font-extrabold text-white break-words">
                Welcome, <span className="text-purple-400">@{currentUser.username}</span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 font-mono truncate">
                Member ID: {currentUser.id} • {currentUser.membershipTier}
              </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-3 w-full md:w-auto">
              <button
                onClick={() => {
                  playSound('click', soundEnabled);
                  setActiveTab('transactions');
                }}
                className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-left cursor-pointer min-w-0 overflow-hidden"
              >
                <div className="flex items-center gap-1 sm:gap-1.5 text-[9px] sm:text-[10px] font-mono text-slate-400 truncate">
                  <Wallet className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">WALLET</span>
                </div>
                <p className="text-xs sm:text-base font-mono font-bold text-emerald-400 mt-0.5 sm:mt-1 truncate block">
                  {formatPrice(currentBalance)}
                </p>
              </button>

              <button
                onClick={() => {
                  playSound('click', soundEnabled);
                  setActiveTab('orders');
                }}
                className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-left cursor-pointer min-w-0 overflow-hidden"
              >
                <div className="flex items-center gap-1 sm:gap-1.5 text-[9px] sm:text-[10px] font-mono text-slate-400 truncate">
                  <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-400 shrink-0" />
                  <span className="truncate">ORDERS</span>
                </div>
                <p className="text-xs sm:text-base font-mono font-bold text-white mt-0.5 sm:mt-1 truncate block">
                  {orders.length} Completed
                </p>
              </button>

              <button
                onClick={() => {
                  playSound('click', soundEnabled);
                  setActiveTab('vault');
                }}
                className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-left cursor-pointer min-w-0 overflow-hidden"
              >
                <div className="flex items-center gap-1 sm:gap-1.5 text-[9px] sm:text-[10px] font-mono text-slate-400 truncate">
                  <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">CARDS</span>
                </div>
                <p className="text-xs sm:text-base font-mono font-bold text-white mt-0.5 sm:mt-1 truncate block">
                  {ownedCardIds.length} Vaulted
                </p>
              </button>
            </div>
          </div>

          <div className="mt-3.5 sm:mt-4 pt-3 sm:pt-4 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  playSound('click', soundEnabled);
                  setActiveTab('cards');
                }}
                className="px-3 sm:px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-[11px] sm:text-xs font-bold transition-all shadow-md cursor-pointer text-center truncate"
              >
                BROWSE STORE
              </button>
              <button
                onClick={() => {
                  playSound('click', soundEnabled);
                  setIsPaymentModalOpen(true);
                }}
                className="px-3 sm:px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-mono text-[11px] sm:text-xs font-bold transition-all cursor-pointer text-center truncate"
              >
                + ADD FUNDS (QR)
              </button>
            </div>

            <button
              onClick={() => {
                playSound('click', soundEnabled);
                setActiveTab('profile');
              }}
              className="text-[11px] sm:text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <span>Manage Profile & Security</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Immersive Hero Banner */}
      <div className="rounded-2xl sm:rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-4 sm:p-10 backdrop-blur-md shadow-2xl relative overflow-hidden">
        {/* Ambient Subtle Glow */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-center">
          {/* Left Column: Copy & Actions */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
              <span className="font-mono text-[10px] sm:text-xs text-purple-300 tracking-widest uppercase font-semibold">
                CURATED DIGITAL INSTRUMENTS
              </span>
            </div>

            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-brand font-black tracking-tight text-white leading-[1.1] break-words">
              RAWAT CARD STORE.<br />
              <span className="gold-text-gradient">
                Private Collector Vault.
              </span>
            </h2>

            <p className="max-w-md text-slate-300 text-xs sm:text-base leading-relaxed break-words font-sans">
              Exquisite digital instruments for discerning collectors. Authentic PSA 10 graded slabs, physically-accurate holographic foil shaders, and high-roller VIP concierge service.
            </p>

            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2.5 sm:gap-3 pt-1 sm:pt-2">
              <button
                onClick={() => {
                  playSound('click', soundEnabled);
                  setActiveTab('cards');
                }}
                className="w-full sm:w-auto text-center rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 px-4 sm:px-7 py-3 text-xs sm:text-sm font-bold text-black hover:scale-105 transition-all shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer truncate font-tech"
              >
                EXPLORE STORE
              </button>

              <button
                onClick={() => {
                  playSound('gold_chime', soundEnabled);
                  setIsVipConciergeOpen(true);
                }}
                className="w-full sm:w-auto text-center rounded-full border border-amber-500/40 bg-amber-950/30 px-4 sm:px-6 py-3 text-xs sm:text-sm font-bold text-amber-300 hover:text-white hover:border-amber-400 backdrop-blur-sm transition-all active:scale-95 cursor-pointer truncate flex items-center justify-center gap-1.5 font-mono"
              >
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>VIP CONCIERGE</span>
              </button>

              <button
                onClick={() => {
                  playSound('click', soundEnabled);
                  setActiveTab('vault');
                }}
                className="w-full sm:w-auto text-center rounded-full border border-white/20 bg-white/5 px-4 sm:px-6 py-3 text-xs sm:text-sm font-bold text-white hover:bg-white/10 backdrop-blur-sm transition-all active:scale-95 cursor-pointer truncate font-mono"
              >
                MY VAULT
              </button>
            </div>
          </div>

          {/* Right Column: Signature 3D Interactive Card Showcase */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative w-full">
            <div className="relative p-3 sm:p-7 rounded-2xl sm:rounded-3xl bg-black/40 border border-white/10 backdrop-blur-xl shadow-2xl flex flex-col items-center w-full max-w-sm overflow-hidden">
              <div className="text-center mb-2 sm:mb-3">
                <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest font-semibold flex items-center justify-center gap-1.5">
                  <Zap className="w-3 h-3 text-purple-400 fill-current" />
                  SIGNATURE ASSET • 3D TILT
                </span>
              </div>

              {heroCard && (
                <div className="py-2 w-full flex justify-center items-center">
                  <Realistic3DCard
                    card={heroCard}
                    size="hero"
                    showFlipButton={true}
                    interactiveTilt={true}
                    onClick={() => setSelectedCard(heroCard)}
                  />
                </div>
              )}

              <div className="mt-3 sm:mt-4 flex items-center justify-between text-xs font-mono text-slate-400 pt-3 border-t border-white/5 w-full">
                <span>PSA 10 Slab Protected</span>
                <button
                  onClick={() => heroCard && setSelectedCard(heroCard)}
                  className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer font-mono text-[11px]"
                >
                  <span>Full Specs</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {heroCard && (
                <button
                  onClick={() => triggerCinematicUnlock(heroCard)}
                  className="w-full mt-3 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500/20 via-purple-900/30 to-black border border-amber-500/40 text-amber-300 hover:text-white font-mono text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer hover:border-amber-400"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Experience Vault Unboxing</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
