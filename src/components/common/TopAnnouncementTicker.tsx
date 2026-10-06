import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { Megaphone, Sparkles, X, ArrowRight, Zap, Bell, Flame } from 'lucide-react';
import { playSound } from '../../utils/audio';

export const TopAnnouncementTicker: React.FC = () => {
  const { soundEnabled, setActiveTab, setIsPaymentModalOpen } = useStore();
  const [dismissed, setDismissed] = useState(false);
  const [announcements, setAnnouncements] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('rawat_store_announcements_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter((a: any) => a.isActive !== false).map((a: any) => ({
            id: a.id,
            title: a.title,
            highlight: a.message,
            type: a.type || 'SALE',
            action: a.type === 'SALE' ? 'EXPLORE_CARDS' : a.type === 'REWARD' ? 'ADD_FUNDS' : 'VAULT'
          }));
        }
      }
    } catch {}
    return [
      {
        id: 'ann-flash-sale',
        title: '🔥 LIMITED FLASH SALE: Up to 50% OFF on Noir & Apex Edition Cards!',
        highlight: 'Use code "RAWAT20" at checkout for instant extra savings.',
        type: 'SALE',
        action: 'EXPLORE_CARDS'
      },
      {
        id: 'ann-deposit-cashback',
        title: '⚡ DEPOSIT CASHBACK: Deposit ₹500+ via UPI to get 1 Free Lucky Scratch Card (Win up to ₹250 instant cashback)!',
        highlight: 'Zero Gateway Fees. Instant 10-Second UPI Verification.',
        type: 'REWARD',
        action: 'ADD_FUNDS'
      },
      {
        id: 'ann-store-active',
        title: '💎 OFFICIAL MERCHANDISE: Verified Merchant @carderseller1 Online 24/7.',
        highlight: 'Instant Digital Key Delivery & 3D Interactive Card Vault Active.',
        type: 'INFO',
        action: 'VAULT'
      }
    ];
  });

  const [currentIndex, setCurrentIndex] = useState(0);

  // Rotate ticker every 7 seconds
  useEffect(() => {
    if (announcements.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [announcements.length]);

  if (dismissed || announcements.length === 0) return null;

  const current = announcements[currentIndex];

  const handleAction = () => {
    playSound('click', soundEnabled);
    if (current.action === 'ADD_FUNDS') {
      setIsPaymentModalOpen(true);
    } else if (current.action === 'EXPLORE_CARDS') {
      setActiveTab('cards');
    } else if (current.action === 'VAULT') {
      setActiveTab('vault');
    }
  };

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'SALE':
        return 'bg-gradient-to-r from-amber-500/30 to-orange-500/30 border-amber-500/40 text-amber-300';
      case 'REWARD':
        return 'bg-gradient-to-r from-emerald-500/30 to-teal-500/30 border-emerald-500/40 text-emerald-300';
      default:
        return 'bg-gradient-to-r from-purple-500/30 to-indigo-500/30 border-purple-500/40 text-purple-300';
    }
  };

  return (
    <div className="relative z-50 w-full bg-gradient-to-r from-purple-950/90 via-zinc-950 to-indigo-950/90 border-b border-purple-500/30 py-2 px-3 sm:px-6 backdrop-blur-xl shadow-lg shadow-purple-950/20 text-xs font-mono">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 min-w-0">
        {/* Left Icon Pulse */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-600/30 border border-purple-400/40 shadow-[0_0_10px_rgba(168,85,247,0.4)]">
            {current.type === 'SALE' ? (
              <Flame className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
            ) : current.type === 'REWARD' ? (
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
            ) : (
              <Zap className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
            )}
          </div>

          <span
            className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getBadgeStyle(
              current.type
            )}`}
          >
            {current.type === 'SALE' ? '🔥 FLASH DEAL' : current.type === 'REWARD' ? '🎁 CASHBACK' : '⚡ NOTICE'}
          </span>
        </div>

        {/* Center Marquee Content with smooth fade */}
        <div className="flex-1 min-w-0 flex items-center justify-center sm:justify-start gap-2 overflow-hidden text-center sm:text-left">
          <span className="font-semibold text-slate-100 truncate text-[11px] sm:text-xs">
            {current.title}
          </span>
          <span className="hidden md:inline text-slate-400 text-[11px] truncate">
            {current.highlight}
          </span>
        </div>

        {/* Right CTA Button & Close */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleAction}
            className="px-2.5 sm:px-3 py-1 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] sm:text-xs transition-all shadow-md shadow-purple-600/30 flex items-center gap-1 cursor-pointer whitespace-nowrap"
          >
            <span>{current.action === 'ADD_FUNDS' ? 'Deposit ₹500+' : current.action === 'EXPLORE_CARDS' ? 'Claim 50% Off' : 'Open Vault'}</span>
            <ArrowRight className="w-3 h-3" />
          </button>

          <button
            onClick={() => setDismissed(true)}
            title="Dismiss Announcement"
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
