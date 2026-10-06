import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Search,
  Bell,
  Mail,
  User,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Sparkles,
  Layers,
  ShoppingBag,
  Sliders,
  DollarSign,
  Plus,
  Receipt,
  LogOut,
  Shield,
  KeyRound,
  AlertTriangle,
  Send,
  Headphones,
  Swords,
  ChevronRight,
  Crown
} from 'lucide-react';
import { playSound } from '../../utils/audio';
import { AnimatedCounter } from './AnimatedCounter';

interface HeaderProps {
  onOpenSearchModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSearchModal }) => {
  const {
    activeTab,
    setActiveTab,
    notifications,
    markNotificationAsRead,
    clearNotifications,
    currentUser,
    currentBalance,
    formatPrice,
    soundEnabled,
    setIsPaymentModalOpen,
    setIsAuthModalOpen,
    setAuthModalMode,
    logoutUser,
    requestLogout,
    isAdmin,
    setIsComparisonModalOpen,
    paymentRequests,
    setIsNotificationsModalOpen,
    setIsVipConciergeOpen
  } = useStore();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const pendingDepositsCount = paymentRequests.filter(
    (p) => p.status === 'PENDING_VERIFICATION' || p.status === 'PROCESSING'
  ).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#050505]/95 backdrop-blur-2xl border-b border-white/5 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
        {/* 1. Brand Title Zone */}
        <div
          onClick={() => {
            playSound('click', soundEnabled);
            setActiveTab('home');
          }}
          className="flex items-center gap-2 sm:gap-3 cursor-pointer shrink-0 group select-none"
        >
          <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-black text-white shadow-md shadow-purple-600/30 text-sm sm:text-base">
            R
          </div>
          <div>
            <h1 className="text-sm sm:text-xl font-bold tracking-tight text-white group-hover:text-slate-200 transition-colors font-tech leading-tight">
              RAWAT <span className="text-purple-400">CARD STORE</span>
            </h1>
            <div className="flex items-center gap-1.5 text-[8px] sm:text-[9px] uppercase tracking-widest text-slate-400 font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)] animate-pulse" />
              <span>COLLECTOR VAULT</span>
            </div>
          </div>
        </div>

        {/* 2. Navigation Links (Center Zone) */}
        <nav className="hidden lg:flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 backdrop-blur-md">
          <button
            onClick={() => {
              playSound('click', soundEnabled);
              setActiveTab('home');
            }}
            className={`px-3 py-1 rounded-full text-xs font-mono font-medium transition-all ${
              activeTab === 'home' ? 'bg-white/10 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            HOME
          </button>
          <button
            onClick={() => {
              playSound('click', soundEnabled);
              setActiveTab('cards');
            }}
            className={`px-3 py-1 rounded-full text-xs font-mono font-medium transition-all ${
              activeTab === 'cards' ? 'bg-white/10 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            STORE
          </button>
          <button
            onClick={() => {
              playSound('click', soundEnabled);
              setActiveTab('orders');
            }}
            className={`px-3 py-1 rounded-full text-xs font-mono font-medium transition-all ${
              activeTab === 'orders' ? 'bg-white/10 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            ORDERS
          </button>
          <button
            onClick={() => {
              playSound('click', soundEnabled);
              setActiveTab('vault');
            }}
            className={`px-3 py-1 rounded-full text-xs font-mono font-medium transition-all ${
              activeTab === 'vault' ? 'bg-white/10 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            MY COLLECTION
          </button>
          <button
            onClick={() => {
              playSound('click', soundEnabled);
              setActiveTab('transactions');
            }}
            className={`px-3 py-1 rounded-full text-xs font-mono font-medium transition-all ${
              activeTab === 'transactions' ? 'bg-white/10 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            WALLET
          </button>
          <a
            href="https://t.me/carderseller1"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playSound('click', soundEnabled)}
            className="px-3 py-1 rounded-full text-xs font-mono font-medium transition-all text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 flex items-center gap-1.5 border border-sky-500/20"
          >
            <Send className="w-3 h-3" />
            <span>SUPPORT</span>
          </a>
        </nav>

        {/* 3. Search, Balance & Actions Zone */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* VIP Concierge Lounge Button */}
          <button
            onClick={() => {
              playSound('gold_chime', soundEnabled);
              setIsVipConciergeOpen(true);
            }}
            title="Private High-Roller VIP Concierge Lounge"
            className="flex h-8 sm:h-9 items-center justify-center rounded-full border border-amber-500/40 bg-gradient-to-r from-amber-950/40 to-black px-2.5 sm:px-3 text-amber-300 hover:text-white hover:border-amber-400/80 transition-all cursor-pointer shrink-0 gap-1.5 shadow-sm shadow-amber-500/20 group"
          >
            <Crown className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
            <span className="hidden sm:inline text-xs font-mono font-bold">VIP Lounge</span>
          </button>

          {/* Holographic Duel Matrix Launcher */}
          <button
            onClick={() => {
              playSound('whoosh', soundEnabled);
              setIsComparisonModalOpen(true);
            }}
            title="3D Card Duel Comparison Arena"
            className="hidden sm:flex h-8 sm:h-9 items-center justify-center rounded-full border border-purple-500/40 bg-purple-950/30 px-2.5 sm:px-3 text-purple-300 hover:text-white hover:border-purple-400 transition-all cursor-pointer shrink-0 gap-1.5 shadow-sm shadow-purple-500/10 group"
          >
            <Swords className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" />
            <span className="hidden xl:inline text-xs font-mono font-bold">Duel Arena</span>
          </button>

          {/* Telegram Support Quick Button */}
          <a
            href="https://t.me/carderseller1"
            target="_blank"
            rel="noopener noreferrer"
            title="Telegram Support (@carderseller1)"
            onClick={() => playSound('click', soundEnabled)}
            className="hidden md:flex h-8 sm:h-9 items-center justify-center rounded-full border border-sky-500/40 bg-sky-950/30 px-2.5 sm:px-3 text-sky-300 hover:text-white hover:bg-sky-600/30 hover:border-sky-400 transition-all cursor-pointer shrink-0 gap-1.5 shadow-sm shadow-sky-500/10"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="text-xs font-mono font-bold">Support</span>
          </a>

          {/* Balance Pill + Add Funds */}
          <div className="flex items-center gap-1 p-0.5 sm:p-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
            <button
              onClick={() => {
                playSound('click', soundEnabled);
                setActiveTab('transactions');
              }}
              className="px-2 sm:px-3 py-1 text-[11px] sm:text-xs font-mono text-emerald-400 font-bold hover:text-emerald-300 transition-colors whitespace-nowrap flex items-center"
            >
              <AnimatedCounter
                value={currentBalance}
                formatter={(val) => `₹${val.toLocaleString('en-IN')}`}
              />
            </button>
            <button
              onClick={() => {
                playSound('click', soundEnabled);
                setIsPaymentModalOpen(true);
              }}
              className="p-1 sm:px-2.5 sm:py-1 rounded-full bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1 shadow-sm shadow-purple-600/30 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span className="hidden sm:inline">Add</span>
            </button>
          </div>

          {/* Search Trigger */}
          <button
            onClick={() => {
              playSound('click', soundEnabled);
              onOpenSearchModal();
            }}
            aria-label="Search collection"
            className="flex h-8 w-8 sm:h-9 sm:w-32 items-center justify-center sm:justify-start rounded-full border border-white/10 bg-white/5 sm:px-3 text-slate-400 hover:text-white hover:border-white/20 transition-all cursor-pointer shrink-0"
          >
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
            <span className="hidden sm:inline text-xs text-slate-500 ml-2 font-mono truncate">
              Search...
            </span>
          </button>

          {/* Profile Avatar Trigger / Auth */}
          <div className="relative" ref={profileRef}>
            {currentUser ? (
              <button
                id="header-profile-avatar-btn"
                onClick={() => {
                  playSound('click', soundEnabled);
                  setShowProfileMenu(!showProfileMenu);
                }}
                className={`relative h-9 w-9 rounded-full border bg-gradient-to-tr from-purple-900 via-slate-900 to-slate-950 flex items-center justify-center font-bold text-white shadow-lg cursor-pointer transition-all text-xs ${
                  isAdmin
                    ? 'border-amber-400/60 shadow-amber-500/20 hover:border-amber-300'
                    : 'border-purple-500/50 shadow-purple-500/10 hover:border-purple-400'
                }`}
              >
                {currentUser.username.charAt(0).toUpperCase()}
                {unreadCount > 0 && (
                  <span
                    title={`${unreadCount} unread notifications`}
                    className="absolute -top-0.5 -left-0.5 w-2.5 h-2.5 rounded-full bg-purple-500 border border-black shadow-[0_0_6px_rgba(168,85,247,0.9)]"
                  />
                )}
                {isAdmin && (
                  <span
                    title="Administrator Account Active"
                    className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-amber-400 border border-black shadow-[0_0_6px_rgba(251,191,36,0.9)]"
                  />
                )}
              </button>
            ) : (
              <button
                onClick={() => {
                  setAuthModalMode('register');
                  setIsAuthModalOpen(true);
                }}
                className="px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono text-xs font-bold transition-all shadow-sm shadow-purple-600/30 cursor-pointer"
              >
                Sign Up
              </button>
            )}

            {/* Profile Dropdown */}
            {showProfileMenu && currentUser && (
              <div className="absolute right-0 mt-3 w-64 bg-[#0c0d15]/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="p-2 border-b border-white/5 mb-2">
                  <div className="flex items-center justify-between">
                    <p className="font-tech font-bold text-sm text-white">@{currentUser.username}</p>
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/40">
                      {currentUser.role === 'super_admin' ? 'Super Admin' : currentUser.membershipTier || 'Collector'}
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-slate-400 truncate">{currentUser.email}</p>
                  <div className="mt-2.5 p-2 rounded-2xl bg-white/5 border border-white/10 flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-400">Balance:</span>
                    <span className="font-bold text-emerald-400">
                      {formatPrice(currentBalance)}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  {/* Single Dedicated Admin Console Entry Point (Admin Only) */}
                  {isAdmin && (
                    <button
                      id="profile-menu-admin-console-btn"
                      onClick={() => {
                        playSound('upgrade', soundEnabled);
                        setActiveTab('admin');
                        setShowProfileMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-mono text-xs transition-all text-left mb-1.5 cursor-pointer border ${
                        activeTab === 'admin'
                          ? 'bg-gradient-to-r from-amber-500/20 via-purple-900/40 to-indigo-900/40 text-amber-300 border-amber-500/50 shadow-md ring-1 ring-amber-400/30'
                          : 'bg-gradient-to-r from-amber-950/30 via-purple-950/30 to-black hover:from-amber-900/40 hover:to-purple-900/40 text-amber-300 hover:text-white border-amber-500/30 hover:border-amber-400/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Shield className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="font-bold tracking-wide">Admin Console</span>
                      </div>
                      {pendingDepositsCount > 0 ? (
                        <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-black text-[9px] font-black font-mono animate-pulse">
                          {pendingDepositsCount} PENDING
                        </span>
                      ) : activeTab === 'admin' ? (
                        <span className="text-[10px] font-mono text-amber-400 font-bold">Active</span>
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-amber-400/70" />
                      )}
                    </button>
                  )}

                  {/* Customer Mode Toggle when on Admin Page */}
                  {activeTab === 'admin' && (
                    <button
                      onClick={() => {
                        playSound('click', soundEnabled);
                        setActiveTab('home');
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono text-white transition-colors text-left cursor-pointer border border-white/10"
                    >
                      <Layers className="w-4 h-4 text-purple-400" />
                      <span>Back to Storefront</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      playSound('click', soundEnabled);
                      setIsNotificationsModalOpen(true);
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/5 text-xs font-mono text-slate-300 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Bell className="w-4 h-4 text-purple-400" />
                      <span>Notifications</span>
                    </div>
                    {unreadCount > 0 ? (
                      <span className="px-1.5 py-0.5 rounded-full bg-purple-500 text-white text-[9px] font-bold font-mono animate-pulse">
                        {unreadCount} NEW
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-500">Inbox</span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      playSound('gold_chime', soundEnabled);
                      setIsVipConciergeOpen(true);
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-xs font-mono text-amber-300 border border-amber-500/30 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Crown className="w-4 h-4 text-amber-400" />
                      <span className="font-bold">VIP Concierge Lounge</span>
                    </div>
                    <span className="text-[9px] font-mono uppercase text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/40">
                      Private
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('profile');
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/5 text-xs font-mono text-slate-300 transition-colors text-left cursor-pointer"
                  >
                    <User className="w-4 h-4 text-purple-400" />
                    <span>Customer Dashboard</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('transactions');
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/5 text-xs font-mono text-slate-300 transition-colors text-left cursor-pointer"
                  >
                    <Receipt className="w-4 h-4 text-purple-400" />
                    <span>Transactions Ledger</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('vault');
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/5 text-xs font-mono text-slate-300 transition-colors text-left cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>My 3D Vault</span>
                  </button>
                  <a
                    href="https://t.me/carderseller1"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      playSound('click', soundEnabled);
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-sky-950/40 hover:bg-sky-900/50 text-xs font-mono text-sky-300 border border-sky-500/30 transition-colors text-left cursor-pointer my-1"
                  >
                    <div className="flex items-center gap-2.5">
                      <Send className="w-4 h-4 text-sky-400" />
                      <span className="font-bold">Telegram Support</span>
                    </div>
                    <span className="text-[10px] text-sky-400 font-mono">@carderseller1</span>
                  </a>
                  <button
                    onClick={() => {
                      requestLogout();
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-rose-950/40 text-xs font-mono text-rose-300 transition-colors text-left mt-1 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-400" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
