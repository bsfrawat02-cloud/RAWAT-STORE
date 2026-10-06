import React from 'react';
import { HeroSection } from '../components/home/HeroSection';
import { CollectionSection } from '../components/home/CollectionSection';
import { useStore } from '../context/StoreContext';
import {
  ShieldCheck,
  Tag,
  Sparkles,
  Layers,
  Lock,
  Cpu,
  Crown,
  Swords,
  Flame,
  ArrowRight,
  Zap
} from 'lucide-react';
import { playSound } from '../utils/audio';

interface HomePageProps {
  onOpenVipCeremony?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onOpenVipCeremony }) => {
  const {
    setActiveTab,
    setSelectedTier,
    soundEnabled,
    setIsComparisonModalOpen,
    currentUser
  } = useStore();

  return (
    <div className="space-y-12 sm:space-y-16 pb-20">
      {/* Hero Section */}
      <HeroSection />

      {/* Aesthetic Cyber Activity Cards Bar (Duel Arena + VIP Ceremony) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* 1. 3D Card Duel Arena Card */}
        <div
          onClick={() => {
            playSound('whoosh', soundEnabled);
            setIsComparisonModalOpen(true);
          }}
          className="group relative rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-purple-950/40 via-black to-sky-950/30 border border-purple-500/30 hover:border-purple-400/60 transition-all cursor-pointer overflow-hidden shadow-xl hover:shadow-[0_0_30px_rgba(168,85,247,0.25)] hover:-translate-y-1 duration-300"
        >
          <div className="absolute top-0 right-0 w-36 h-36 bg-purple-500/15 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />
          
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300 shadow-inner">
              <Swords className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
              DUEL MATRIX
            </span>
          </div>

          <h3 className="font-tech font-bold text-lg text-white group-hover:text-purple-200 transition-colors flex items-center gap-1.5">
            <span>Card Duel Comparison</span>
            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </h3>
          
          <p className="text-xs text-slate-400 font-mono mt-1.5 leading-relaxed">
            Side-by-side holographic inspection with laser scan sweeps, power meters, limit breakdowns & perks.
          </p>

          <div className="mt-4 pt-3 border-t border-purple-500/20 flex items-center justify-between text-xs font-mono text-purple-400 font-bold">
            <span>LAUNCH ARENA</span>
            <span className="text-[10px] text-purple-300/80 uppercase">Laser Scanner</span>
          </div>
        </div>

        {/* 2. VIP Tier Ascension Ceremony */}
        <div
          onClick={() => {
            playSound('upgrade', soundEnabled);
            if (onOpenVipCeremony) onOpenVipCeremony();
          }}
          className="group relative rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-rose-950/40 via-black to-purple-950/30 border border-rose-500/30 hover:border-rose-400/60 transition-all cursor-pointer overflow-hidden shadow-xl hover:shadow-[0_0_30px_rgba(244,63,94,0.25)] hover:-translate-y-1 duration-300"
        >
          <div className="absolute top-0 right-0 w-36 h-36 bg-rose-500/15 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />
          
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-300 shadow-inner">
              <Crown className="w-5 h-5 group-hover:rotate-6 transition-transform" />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">
              VIP CEREMONY
            </span>
          </div>

          <h3 className="font-tech font-bold text-lg text-white group-hover:text-rose-200 transition-colors flex items-center gap-1.5">
            <span>VIP Ascension Matrix</span>
            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </h3>
          
          <p className="text-xs text-slate-400 font-mono mt-1.5 leading-relaxed">
            Ascend through Royal Noir, Sovereign, Apex, & Celestial tiers with morphing 3D badges & starlight supernova FX.
          </p>

          <div className="mt-4 pt-3 border-t border-rose-500/20 flex items-center justify-between text-xs font-mono text-rose-400 font-bold">
            <span>VIEW TIERS</span>
            <span className="text-[10px] text-rose-300/80 uppercase">Sound-Reactive</span>
          </div>
        </div>
      </section>

      {/* Promotional Coupon Strip */}
      <section className="w-full">
        <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-r from-purple-950/70 via-indigo-950/60 to-purple-950/70 border border-purple-500/30 p-4 sm:p-7 overflow-hidden shadow-xl shadow-purple-950/30">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-purple-500/20 blur-3xl rounded-full pointer-events-none" />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 z-10 relative">
            <div className="flex items-start sm:items-center gap-3 sm:gap-4 text-left">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-purple-300 shrink-0">
                <Tag className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <span className="font-mono text-[10px] text-purple-300 uppercase tracking-widest font-bold">
                  PROMOTIONAL DEMO OFFERS
                </span>
                <h3 className="font-tech font-bold text-base sm:text-xl text-white">
                  Unlock Exclusive Discounts On Digital Cards
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Apply promo codes like <strong className="text-purple-300 font-mono">RAWAT20</strong> or{' '}
                  <strong className="text-purple-300 font-mono">RAWATVIP</strong> at checkout.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-start sm:justify-end mt-2 sm:mt-0">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 border border-purple-500/40 font-mono text-xs text-purple-300">
                <span className="text-zinc-500 font-normal">CODE:</span>
                <span className="font-bold tracking-wider">RAWAT20</span>
              </div>
              <button
                onClick={() => {
                  playSound('click', soundEnabled);
                  setActiveTab('cards');
                }}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
              >
                APPLY CODE
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Collection Grid */}
      <CollectionSection />

      {/* Luxury Features Breakdown */}
      <section className="w-full">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <span className="text-xs font-mono text-purple-400 uppercase tracking-wider font-semibold">
            ENGINEERING & LUXURY CRAFT
          </span>
          <h2 className="font-tech font-extrabold text-2xl sm:text-3xl text-white mt-1">
            Built for Next-Generation Digital Collectors
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-2">
            Every card in the RAWAT collection is rendered with real-time 3D physics, metallic sheen reflections, and cryptographic token simulations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="p-5 sm:p-6 rounded-2xl bg-zinc-950/70 border border-zinc-800 hover:border-purple-500/40 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-800/60 flex items-center justify-center text-purple-400">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-tech font-bold text-base text-white">Dynamic 3D Tilt Shaders</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Experience dynamic specular light reflections, specular foil sweeps, and real-time gyro and pointer tracking.
            </p>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-zinc-950/70 border border-zinc-800 hover:border-purple-500/40 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sky-950/60 border border-sky-800/60 flex items-center justify-center text-sky-400">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-tech font-bold text-base text-white">Digital Vault Wallet</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Manage your acquired fictional cards in your interactive digital fan wallet with permanent simulated ledger IDs.
            </p>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-zinc-950/70 border border-zinc-800 hover:border-purple-500/40 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-tech font-bold text-base text-white">Safe Design Challenge Showcase</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Zero real payment processing or banking credentials. 100% demo-safe design challenge digital storefront.
            </p>
          </div>
        </div>
      </section>

      {/* Safety Notice Footer Banner */}
      <section className="w-full">
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 flex items-center gap-3.5 text-xs text-zinc-400 font-mono">
          <Lock className="w-5 h-5 text-purple-400 shrink-0" />
          <div className="leading-relaxed">
            <strong className="text-zinc-200">Safety & Compliance Guarantee: </strong>
            RAWAT CARD STORE is a design prototype created strictly for showcasing high-fidelity 3D UI/UX. All card identifiers, CVVs, and transactions are simulated placeholders.
          </div>
        </div>
      </section>
    </div>
  );
};
