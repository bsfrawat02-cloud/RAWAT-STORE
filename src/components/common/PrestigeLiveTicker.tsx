import React, { useState, useEffect } from 'react';
import { Crown, Sparkles, X, ArrowUpRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { playSound } from '../../utils/audio';

interface PrestigeEvent {
  id: string;
  collector: string;
  action: string;
  cardName: string;
  amount: string;
  grade: string;
  timeAgo: string;
}

const PRESTIGE_EVENTS: PrestigeEvent[] = [
  {
    id: 'p-1',
    collector: '@dubai_apex',
    action: 'secured',
    cardName: 'Obsidian Zenith #004',
    amount: '₹45,000',
    grade: 'GEM-MT 10',
    timeAgo: 'Just now',
  },
  {
    id: 'p-2',
    collector: '@mumbai_vault',
    action: 'minted',
    cardName: 'Apex Dragon Genesis #001',
    amount: '₹35,000',
    grade: 'PRISTINE 10',
    timeAgo: '2m ago',
  },
  {
    id: 'p-3',
    collector: '@singapore_vault',
    action: 'verified & encased',
    cardName: 'Gold Royale Sovereign',
    amount: '₹50,000',
    grade: 'PSA 10',
    timeAgo: '5m ago',
  },
  {
    id: 'p-4',
    collector: '@london_collector',
    action: 'vaulted',
    cardName: 'Cyber Nova Limited #012',
    amount: '₹28,000',
    grade: 'GEM-MT 10',
    timeAgo: '8m ago',
  },
  {
    id: 'p-5',
    collector: '@qatar_royale',
    action: 'ascended to',
    cardName: 'Imperial Black Edition #002',
    amount: '₹75,000',
    grade: 'MINT 9.5',
    timeAgo: '12m ago',
  },
];

export const PrestigeLiveTicker: React.FC = () => {
  const { soundEnabled, setActiveTab } = useStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % PRESTIGE_EVENTS.length);
    }, 6500);
    return () => clearInterval(timer);
  }, []);

  if (isDismissed) return null;

  const current = PRESTIGE_EVENTS[currentIndex];

  return (
    <div className="fixed bottom-14 md:bottom-4 left-3 sm:left-6 z-30 max-w-sm sm:max-w-md animate-in fade-in slide-in-from-bottom-2 duration-300 pointer-events-auto">
      <div className="flex items-center gap-3 p-2.5 sm:p-3 rounded-2xl bg-[#090a10]/95 border border-amber-500/30 backdrop-blur-xl shadow-2xl shadow-black/80 font-mono text-xs">
        {/* Gold Prestige Icon Indicator */}
        <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-900/30 border border-amber-400/40 flex items-center justify-center shrink-0 text-amber-300 shadow-[0_0_12px_rgba(212,175,55,0.25)]">
          <Crown className="w-4 h-4" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[9px] text-amber-400 font-bold uppercase tracking-widest">
              PRESTIGE MINT FEED
            </span>
            <span className="text-[8px] text-zinc-500">&bull; {current.timeAgo}</span>
          </div>

          <p className="text-[11px] text-zinc-300 truncate mt-0.5">
            <span className="text-white font-bold">{current.collector}</span>{' '}
            <span className="text-zinc-400">{current.action}</span>{' '}
            <span className="text-amber-300 font-semibold">{current.cardName}</span>
          </p>

          <div className="flex items-center gap-2 text-[9px] text-zinc-400 mt-0.5">
            <span className="text-emerald-400 font-bold">{current.amount}</span>
            <span>&bull;</span>
            <span className="text-amber-400/90 font-mono">{current.grade}</span>
          </div>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={() => {
            playSound('click', soundEnabled);
            setIsDismissed(true);
          }}
          className="h-6 w-6 rounded-full bg-white/5 hover:bg-white/10 text-zinc-500 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
          title="Dismiss prestige feed"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
