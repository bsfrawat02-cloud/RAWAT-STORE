import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  User,
  Shield,
  Layers,
  ShoppingBag,
  HelpCircle,
  Plus,
  Volume2,
  VolumeX,
  Sparkles,
  DollarSign,
  ChevronRight,
  Receipt,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  Sliders,
  CreditCard,
  Gift,
  Share2,
  Copy,
  Check,
  Users,
  TrendingUp,
  Percent,
  Coins,
  Award,
  Zap,
  Link2,
  X,
  Send,
  ExternalLink,
  Bell
} from 'lucide-react';
import { playSound } from '../utils/audio';
import { ProfilePageSkeleton } from '../components/common/Skeletons';

export const ProfilePage: React.FC = () => {
  const {
    currentUser,
    currentBalance,
    formatPrice,
    soundEnabled,
    setSoundEnabled,
    ambientLightEnabled,
    setAmbientLightEnabled,
    currency,
    setCurrency,
    setActiveTab,
    setIsPaymentModalOpen,
    setIsAuthModalOpen,
    setAuthModalMode,
    logoutUser,
    requestLogout,
    users,
    orders,
    ownedCardIds,
    getUserTransactions,
    getUserReferrals,
    getReferralStats,
    isAdmin,
    isInitialLoading,
    notifications,
    setIsNotificationsModalOpen,
  } = useStore();

  const [activeSection, setActiveSection] = useState<'dashboard' | 'referral' | 'transactions' | 'settings' | 'support'>('dashboard');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [toast, setToast] = useState<{ id: number; title: string; message: string } | null>(null);
  const [calcDeposit, setCalcDeposit] = useState<number>(5000);

  if (isInitialLoading) {
    return <ProfilePageSkeleton />;
  }

  const transactions = getUserTransactions();
  const referrals = getUserReferrals();
  const referralStats = getReferralStats();

  const userReferralCode = currentUser?.referralCode || referralStats.referralCode || 'RAWAT2026';
  const referralLink = typeof window !== 'undefined' ? `${window.location.origin}?ref=${userReferralCode}` : `https://rawatcards.store?ref=${userReferralCode}`;

  const triggerToast = (title: string, message: string) => {
    const id = Date.now();
    setToast({ id, title, message });
    setTimeout(() => {
      setToast((curr) => (curr?.id === id ? null : curr));
    }, 3500);
  };

  const handleCopyCode = () => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(userReferralCode);
    }
    setCopiedCode(true);
    playSound('click', soundEnabled);
    triggerToast(
      'Referral Code Copied!',
      `Code "${userReferralCode}" copied to clipboard. Share with friends to earn 20% on every deposit!`
    );
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(referralLink);
    }
    setCopiedLink(true);
    playSound('click', soundEnabled);
    triggerToast(
      'Invite Link Copied!',
      `Direct referral link copied: ${referralLink}`
    );
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* 1. CUSTOMER DASHBOARD HEADER */}
      <div className="relative rounded-2xl sm:rounded-3xl border border-white/10 bg-gradient-to-br from-purple-950/40 via-black to-[#090a14] p-4 sm:p-8 overflow-hidden backdrop-blur-xl shadow-2xl">
        <div className="absolute top-0 right-0 w-72 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 relative z-10 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 min-w-0">
            {/* Avatar */}
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full border border-purple-500/50 bg-gradient-to-tr from-purple-900 via-slate-900 to-black flex items-center justify-center font-bold text-xl sm:text-2xl text-white shadow-xl shadow-purple-500/20 shrink-0">
              {currentUser?.username ? currentUser.username.charAt(0).toUpperCase() : 'U'}
            </div>

            {/* User Info & Welcome */}
            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2">
                <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white font-tech break-words">
                  Welcome, <span className="text-purple-400">@{currentUser?.username || 'collector'}</span>
                </h1>
                <span className="px-2.5 sm:px-3 py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono tracking-wider bg-white/10 text-slate-200 border border-white/10 uppercase font-semibold">
                  {currentUser?.role === 'super_admin' ? 'SUPER ADMIN' : currentUser?.role === 'admin' ? 'STORE ADMIN' : currentUser?.membershipTier || 'ROYAL NOIR'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono tracking-wider bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  <span>ACTIVE COLLECTOR</span>
                </span>
              </div>

              <p className="text-[11px] sm:text-xs font-mono text-slate-400 truncate">
                {currentUser?.email} • Member since {currentUser?.createdAt?.split(' ')[0] || 'August 2026'}
              </p>
            </div>
          </div>

          {/* Balance & Add Funds Box */}
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col items-center sm:items-end w-full sm:w-auto sm:min-w-[200px] backdrop-blur-md">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-0.5">
              Balance:
            </span>
            <span className="font-mono font-extrabold text-2xl sm:text-3xl text-emerald-400">
              {formatPrice(currentBalance)}
            </span>
            <button
              onClick={() => {
                playSound('click', soundEnabled);
                setIsPaymentModalOpen(true);
              }}
              className="mt-3 w-full py-2 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-tech font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-purple-600/30 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>ADD FUNDS</span>
            </button>
          </div>
        </div>

        {/* 2. DASHBOARD ACTION BUTTONS */}
        <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-6 gap-2 sm:gap-2.5">
          <button
            onClick={() => {
              playSound('click', soundEnabled);
              setIsPaymentModalOpen(true);
            }}
            className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-purple-600/20 border border-purple-500/40 hover:bg-purple-600/30 text-purple-300 text-xs font-mono font-bold flex flex-col items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer truncate"
          >
            <Plus className="w-4 h-4 text-purple-400 shrink-0" />
            <span className="truncate">ADD FUNDS</span>
          </button>

          <button
            onClick={() => {
              playSound('click', soundEnabled);
              setActiveSection('referral');
            }}
            className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-emerald-600/15 border border-emerald-500/30 hover:bg-emerald-600/25 text-emerald-300 text-xs font-mono font-bold flex flex-col items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer relative overflow-hidden truncate"
          >
            <span className="absolute top-1 right-1 text-[8px] bg-emerald-500 text-black font-extrabold px-1 rounded">20%</span>
            <Gift className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">REFER & EARN</span>
          </button>

          <button
            onClick={() => {
              playSound('click', soundEnabled);
              setActiveTab('orders');
            }}
            className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 text-xs font-mono font-bold flex flex-col items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer truncate"
          >
            <ShoppingBag className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="truncate">MY ORDERS</span>
          </button>

          <button
            onClick={() => {
              playSound('click', soundEnabled);
              setActiveTab('vault');
            }}
            className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 text-xs font-mono font-bold flex flex-col items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer truncate"
          >
            <Sparkles className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="truncate">MY CARDS</span>
          </button>

          <a
            href="https://t.me/carderseller1"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playSound('click', soundEnabled)}
            className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-sky-500/15 border border-sky-500/40 hover:bg-sky-500/25 text-sky-300 text-xs font-mono font-bold flex flex-col items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer truncate shadow-sm shadow-sky-500/10"
          >
            <Send className="w-4 h-4 text-sky-400 shrink-0" />
            <span className="truncate">TELEGRAM</span>
          </a>

          <button
            onClick={() => {
              playSound('click', soundEnabled);
              setActiveSection('settings');
            }}
            className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 text-xs font-mono font-bold flex flex-col items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer truncate"
          >
            <User className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="truncate">SETTINGS</span>
          </button>
        </div>
      </div>

      {/* Navigation Pills */}
      <div className="flex items-center gap-1.5 rounded-full border border-white/5 bg-black/40 p-1 backdrop-blur-md overflow-x-auto max-w-full pb-1 scrollbar-none">
        <button
          onClick={() => setActiveSection('dashboard')}
          className={`rounded-full px-3 sm:px-5 py-1.5 text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
            activeSection === 'dashboard'
              ? 'bg-white/10 text-white shadow-sm font-semibold'
              : 'text-slate-500 hover:text-white'
          }`}
        >
          Dashboard Overview
        </button>
        <button
          onClick={() => setActiveSection('referral')}
          className={`rounded-full px-3 sm:px-5 py-1.5 text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeSection === 'referral'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20 font-bold'
              : 'text-emerald-400 hover:text-emerald-300'
          }`}
        >
          <Gift className="w-3.5 h-3.5" />
          <span>Refer & Earn (20%)</span>
        </button>
        <button
          onClick={() => setActiveSection('transactions')}
          className={`rounded-full px-3 sm:px-5 py-1.5 text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
            activeSection === 'transactions'
              ? 'bg-white/10 text-white shadow-sm font-semibold'
              : 'text-slate-500 hover:text-white'
          }`}
        >
          Transactions
        </button>
        <button
          onClick={() => {
            playSound('click', soundEnabled);
            setIsNotificationsModalOpen(true);
          }}
          className="rounded-full px-3 sm:px-5 py-1.5 text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap text-purple-400 hover:text-purple-300 hover:bg-purple-950/30 border border-purple-500/20"
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Notifications</span>
          {notifications.filter((n) => !n.read).length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-purple-500 text-white text-[9px] font-bold">
              {notifications.filter((n) => !n.read).length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveSection('settings')}
          className={`rounded-full px-3 sm:px-5 py-1.5 text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
            activeSection === 'settings'
              ? 'bg-white/10 text-white shadow-sm font-semibold'
              : 'text-slate-500 hover:text-white'
          }`}
        >
          Settings
        </button>
        <button
          onClick={() => setActiveSection('support')}
          className={`rounded-full px-3 sm:px-5 py-1.5 text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeSection === 'support'
              ? 'bg-sky-600/30 text-sky-200 border border-sky-500/40 shadow-sm font-semibold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Send className="w-3.5 h-3.5 text-sky-400" />
          <span>Support & FAQ</span>
        </button>
      </div>

      {/* SECTION: DASHBOARD */}
      {activeSection === 'dashboard' && (
        <div className="space-y-6">
          {/* Referral Spotlight Card on Dashboard */}
          <div className="p-6 rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 via-black to-slate-950 relative overflow-hidden backdrop-blur-xl">
            <div className="absolute top-0 right-0 w-64 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative z-10">
              <div className="space-y-1.5 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-mono text-[10px] uppercase tracking-wider font-bold">
                  <Percent className="w-3 h-3" />
                  <span>20% LIFETIME DEPOSIT COMMISSION PROGRAM</span>
                </div>
                <h3 className="font-tech font-bold text-xl text-white">
                  Earn 20% On Every Deposit Made By Your Friends
                </h3>
                <p className="text-xs font-mono text-slate-300 leading-relaxed">
                  Invite collectors using your code <span className="text-emerald-400 font-bold font-mono">@{userReferralCode}</span>. When they add funds, 20% is instantly credited directly to your digital wallet balance!
                </p>
              </div>

              <div className="flex flex-wrap sm:flex-col items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setActiveSection('referral')}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-tech font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Gift className="w-4 h-4" />
                  <span>Open Referral Hub</span>
                </button>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleCopyLink}
                    className="flex-1 sm:flex-none px-3.5 py-2 rounded-2xl border border-purple-500/40 bg-purple-950/40 hover:bg-purple-900/60 text-purple-200 font-mono text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    title="Copy direct invite link"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Link2 className="w-3.5 h-3.5 text-purple-400" />}
                    <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
                  </button>
                  <button
                    onClick={handleCopyCode}
                    className="flex-1 sm:flex-none px-3.5 py-2 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-mono text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    title="Copy invite code"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                    <span>{copiedCode ? 'Code Copied!' : userReferralCode}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md">
              <span className="text-[10px] font-mono text-slate-500 uppercase block">AVAILABLE WALLET</span>
              <div className="text-xl font-mono font-bold text-emerald-400 mt-1">
                {formatPrice(currentBalance)}
              </div>
              <p className="text-[10px] text-slate-500 font-mono mt-1">
                Verified digital credit balance
              </p>
            </div>

            <div
              onClick={() => setActiveTab('vault')}
              className="p-5 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md hover:border-purple-500/40 cursor-pointer transition-all"
            >
              <span className="text-[10px] font-mono text-slate-500 uppercase block">CARDS IN VAULT</span>
              <div className="text-xl font-mono font-bold text-purple-400 mt-1">
                {ownedCardIds.length} Assets
              </div>
              <p className="text-[10px] text-slate-500 font-mono mt-1">
                Visa & Mastercard collectibles
              </p>
            </div>

            <div
              onClick={() => setActiveTab('orders')}
              className="p-5 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md hover:border-cyan-500/40 cursor-pointer transition-all"
            >
              <span className="text-[10px] font-mono text-slate-500 uppercase block">COMPLETED ORDERS</span>
              <div className="text-xl font-mono font-bold text-cyan-400 mt-1">
                {orders.length} Invoices
              </div>
              <p className="text-[10px] text-slate-500 font-mono mt-1">
                Downloadable digital receipts
              </p>
            </div>
          </div>

          {/* Recent Transactions Preview */}
          <div className="p-6 rounded-3xl border border-white/10 bg-black/40 space-y-4 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-purple-400" />
                <h3 className="font-tech font-bold text-lg text-white">Recent Transactions</h3>
              </div>
              <button
                onClick={() => setActiveSection('transactions')}
                className="text-xs font-mono text-purple-400 hover:underline cursor-pointer"
              >
                View All Ledger →
              </button>
            </div>

            <div className="space-y-2.5">
              {transactions.slice(0, 5).map((txn) => {
                const isPositive = txn.amount > 0;
                return (
                  <div
                    key={txn.id}
                    className="p-3.5 rounded-2xl border border-white/5 bg-white/[0.02] flex items-center justify-between gap-3 text-xs font-mono"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
                          isPositive
                            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
                            : 'bg-purple-950/40 border-purple-500/30 text-purple-400'
                        }`}
                      >
                        {isPositive ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="font-bold text-white text-xs">{txn.description}</p>
                        <p className="text-[10px] text-slate-500">{txn.id} • {txn.createdAt}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className={`font-bold ${isPositive ? 'text-emerald-400' : 'text-slate-300'}`}>
                        {isPositive ? '+' : ''}
                        {formatPrice(txn.amount)}
                      </p>
                      <span className="text-[9px] uppercase text-emerald-400">{txn.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SECTION: REFERRAL & EARN (20% LIFETIME DEPOSIT COMMISSION) */}
      {activeSection === 'referral' && (
        <div className="space-y-6">
          {/* Main Hero Card */}
          <div className="relative rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/50 via-[#0a1210] to-[#090a14] p-6 sm:p-8 overflow-hidden backdrop-blur-2xl shadow-2xl">
            <div className="absolute top-0 right-0 w-80 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-4 relative z-10">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-mono text-[10px] uppercase font-bold tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>EXCLUSIVE 20% COMMISSION REFERRAL VAULT</span>
                </div>
                <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 font-mono text-[10px] uppercase font-bold">
                  🎁 ₹50 Welcome Bonus Included
                </span>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-tech font-extrabold text-white tracking-tight">
                  Invite Friends & Earn <span className="text-emerald-400">20% On Every Deposit</span>
                </h2>
                <p className="text-xs sm:text-sm font-mono text-slate-300 max-w-3xl leading-relaxed">
                  Share your unique referral code or link. When your friend signs up, they get <strong className="text-emerald-400">₹50 welcome bonus</strong>. Whenever your referred friend deposits funds into their digital wallet, you receive an automated <strong className="text-emerald-400">20% commission</strong> directly into your wallet balance!
                </p>
              </div>

              {/* Referral Code & Share Link Action Row */}
              <div className="pt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Code Box */}
                <div className="p-4 rounded-2xl bg-black/60 border border-emerald-500/30 backdrop-blur-md space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                      Your Referral Code:
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">
                      Customer ID: {currentUser?.id}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 font-mono font-extrabold text-lg text-emerald-300 tracking-wider text-center">
                      {userReferralCode}
                    </div>
                    <button
                      onClick={handleCopyCode}
                      className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-tech font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/20"
                    >
                      {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedCode ? 'COPIED' : 'COPY'}</span>
                    </button>
                  </div>
                </div>

                {/* Direct Share Link Box */}
                <div className="p-4 rounded-2xl bg-black/60 border border-purple-500/30 backdrop-blur-md space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-300 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                      <Link2 className="w-3.5 h-3.5 text-purple-400" />
                      <span>Direct Invite Link:</span>
                    </span>
                    <span className="text-[10px] font-mono text-purple-300 bg-purple-950/60 border border-purple-500/30 px-2 py-0.5 rounded-md">
                      Auto pre-fills code
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={referralLink}
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                      className="flex-1 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 font-mono text-xs text-slate-300 truncate focus:outline-none focus:border-purple-500/40"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-tech font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-purple-600/30 active:scale-95 shrink-0"
                      title="Copy referral link to clipboard"
                    >
                      {copiedLink ? <Check className="w-4 h-4 text-white" /> : <Link2 className="w-4 h-4 text-white" />}
                      <span>{copiedLink ? 'COPIED!' : 'COPY LINK'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Referral Stats Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-5 rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl space-y-1">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-mono">
                <Users className="w-4 h-4 text-purple-400" />
                <span>Referred Friends</span>
              </div>
              <div className="text-2xl sm:text-3xl font-mono font-extrabold text-white">
                {referralStats.totalReferred}
              </div>
              <p className="text-[10px] text-slate-500 font-mono">
                Tracked under ID: {currentUser?.id || 'usr_curr'}
              </p>
            </div>

            <div className="p-5 rounded-3xl border border-emerald-500/30 bg-emerald-950/20 backdrop-blur-xl space-y-1">
              <div className="flex items-center gap-2 text-emerald-300 text-xs font-mono font-bold">
                <Percent className="w-4 h-4 text-emerald-400" />
                <span>20% Deposit Commission</span>
              </div>
              <div className="text-2xl sm:text-3xl font-mono font-extrabold text-emerald-400">
                {formatPrice(referralStats.totalCommission)}
              </div>
              <p className="text-[10px] text-emerald-500/80 font-mono">
                20% on all friend deposits
              </p>
            </div>

            <div className="p-5 rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl space-y-1">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-mono">
                <Gift className="w-4 h-4 text-indigo-400" />
                <span>Signup Bonuses</span>
              </div>
              <div className="text-2xl sm:text-3xl font-mono font-extrabold text-indigo-300">
                {formatPrice(referralStats.totalBonus)}
              </div>
              <p className="text-[10px] text-slate-500 font-mono">
                ₹50 instant registration reward
              </p>
            </div>

            <div className="p-5 rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl space-y-1">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-mono">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Commission Rate</span>
              </div>
              <div className="text-2xl sm:text-3xl font-mono font-extrabold text-amber-400">
                20.00%
              </div>
              <p className="text-[10px] text-slate-500 font-mono">
                Lifetime automated payout
              </p>
            </div>
          </div>

          {/* How It Works (3 Steps) */}
          <div className="p-6 rounded-3xl border border-white/10 bg-black/40 space-y-5 backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <h3 className="font-tech font-bold text-lg text-white">How the 20% Referral Commission Works</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl border border-white/5 bg-white/[0.02] space-y-2">
                <div className="w-8 h-8 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-300 flex items-center justify-center font-tech font-bold text-sm">
                  1
                </div>
                <h4 className="font-bold text-white text-sm font-tech">Share Your Referral Code</h4>
                <p className="text-xs font-mono text-slate-400 leading-relaxed">
                  Send your code <span className="text-emerald-400 font-bold">"{userReferralCode}"</span> or link to friends interested in 3D card editions.
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-white/5 bg-white/[0.02] space-y-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-950/60 border border-indigo-500/40 text-indigo-300 flex items-center justify-center font-tech font-bold text-sm">
                  2
                </div>
                <h4 className="font-bold text-white text-sm font-tech">Friend Gets ₹50 Bonus</h4>
                <p className="text-xs font-mono text-slate-400 leading-relaxed">
                  When your friend registers using your code, they immediately receive ₹50 credited into their wallet.
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-900/60 border border-emerald-400 text-emerald-300 flex items-center justify-center font-tech font-bold text-sm">
                  3
                </div>
                <h4 className="font-bold text-emerald-300 text-sm font-tech">20% On Every Deposit</h4>
                <p className="text-xs font-mono text-slate-300 leading-relaxed">
                  Whenever your referred friend adds funds to their wallet, <strong>20% of their deposit amount</strong> is automatically transferred into your balance!
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Commission Earnings Estimator */}
          <div className="p-6 rounded-3xl border border-white/10 bg-black/40 space-y-4 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-400" />
                <h3 className="font-tech font-bold text-lg text-white">Interactive Commission Calculator</h3>
              </div>
              <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-950/50 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                20% Return
              </span>
            </div>

            <p className="text-xs font-mono text-slate-400">
              Select or slide a deposit amount to simulate how much commission you will instantly earn when your referred friend deposits:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
              {[1000, 2000, 5000, 10000, 25000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => {
                    setCalcDeposit(amt);
                    playSound('click', soundEnabled);
                  }}
                  className={`py-2 px-3 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer border ${
                    calcDeposit === amt
                      ? 'bg-emerald-500 text-black border-emerald-400 shadow-md shadow-emerald-500/20'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  ₹{amt.toLocaleString('en-IN')}
                </button>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-black to-purple-950/40 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Friend's Deposit Amount</span>
                <span className="font-mono font-bold text-xl text-white">{formatPrice(calcDeposit)}</span>
              </div>

              <div className="text-center sm:text-right">
                <span className="text-[10px] font-mono text-emerald-400 uppercase block font-bold">
                  Your 20% Direct Commission Earned:
                </span>
                <span className="font-mono font-extrabold text-2xl sm:text-3xl text-emerald-400">
                  +{formatPrice(calcDeposit * 0.20)}
                </span>
              </div>
            </div>
          </div>

          {/* Referred Friends & Commission History Table */}
          <div className="p-6 rounded-3xl border border-white/10 bg-black/40 space-y-4 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-400" />
                <h3 className="font-tech font-bold text-lg text-white">Referred Friends & Earnings History</h3>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {referrals.length} {referrals.length === 1 ? 'Customer' : 'Customers'} Tracked
              </span>
            </div>

            {referrals.length === 0 ? (
              <div className="text-center py-10 px-4 border border-dashed border-white/10 rounded-2xl bg-white/[0.01] space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-950/50 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                  <Gift className="w-6 h-6" />
                </div>
                <h4 className="font-tech font-bold text-white text-base">No Referred Friends Yet</h4>
                <p className="text-xs font-mono text-slate-400 max-w-md mx-auto">
                  Share your exclusive code <span className="text-emerald-400 font-bold">{userReferralCode}</span> with fellow collectors. When they join and deposit, your 20% commission will show here in real time.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-tech font-bold text-xs uppercase transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-md shadow-purple-600/30 active:scale-95"
                    title="Copy direct invite link"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Link Copied!' : 'Copy Invite Link'}</span>
                  </button>
                  <button
                    onClick={handleCopyCode}
                    className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-tech font-bold text-xs uppercase transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95"
                    title="Copy referral code"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Code Copied!' : `Copy Code: ${userReferralCode}`}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {referrals.map((ref) => (
                  <div
                    key={ref.id}
                    className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-emerald-500/30 transition-all font-mono text-xs space-y-2.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-purple-950/60 border border-purple-500/30 text-purple-300 font-bold flex items-center justify-center font-tech text-sm">
                          {ref.referredUsername.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">@{ref.referredUsername}</span>
                            <span className="px-2 py-0.5 rounded-full text-[9px] bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 font-bold">
                              ACTIVE (20% EARNING)
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500">
                            ID: {ref.referredUserId} • Joined: {ref.createdAt?.split(' ')[0] || 'Recently'}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block uppercase">Total 20% Commission</span>
                        <span className="font-bold text-emerald-400 text-sm">
                          +{formatPrice(ref.totalCommissionEarned)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/5 text-[11px] text-slate-400">
                      <div>
                        <span className="text-[9px] text-slate-500 block uppercase">Friend Total Deposits</span>
                        <span className="text-slate-200 font-semibold">{formatPrice(ref.totalDepositedByFriend)}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 block uppercase">Signup Bonus</span>
                        <span className="text-indigo-300 font-semibold">{formatPrice(ref.signupBonusReferrer)}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 block uppercase">Code Used</span>
                        <span className="text-slate-300 font-mono font-bold">{ref.referralCodeUsed}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 block uppercase">Last Deposit Activity</span>
                        <span className="text-slate-300">{ref.lastDepositAt ? ref.lastDepositAt.split(' ')[0] : 'Pending first deposit'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION: TRANSACTIONS */}
      {activeSection === 'transactions' && (
        <div className="space-y-4">
          <div className="p-6 rounded-3xl border border-white/10 bg-black/40 space-y-4 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-tech font-bold text-lg text-white">Customer Transaction History</h3>
              <button
                onClick={() => setIsPaymentModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold"
              >
                + Add Funds
              </button>
            </div>

            <div className="space-y-3">
              {transactions.map((txn) => (
                <div
                  key={txn.id}
                  className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] space-y-2 font-mono text-xs"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      {txn.type === 'REFERRAL_DEPOSIT_COMMISSION' ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold">
                          20% REFERRAL
                        </span>
                      ) : txn.type === 'REFERRAL_SIGNUP_BONUS' ? (
                        <span className="px-2 py-0.5 rounded bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 text-[10px] font-bold">
                          SIGNUP BONUS
                        </span>
                      ) : null}
                      <span className="font-bold text-white">{txn.description}</span>
                    </div>
                    <span
                      className={`text-sm font-bold ${
                        txn.amount > 0 ? 'text-emerald-400' : 'text-slate-200'
                      }`}
                    >
                      {txn.amount > 0 ? '+' : ''}
                      {formatPrice(txn.amount)}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between text-slate-400 text-[11px] pt-1 border-t border-white/5">
                    <span>Transaction ID: {txn.id}</span>
                    <span>{txn.createdAt}</span>
                    <span className="text-emerald-400 font-bold">{txn.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION: PREFERENCES */}
      {activeSection === 'settings' && (
        <div className="p-6 rounded-3xl border border-white/10 bg-black/40 space-y-6 backdrop-blur-xl">
          <h3 className="font-tech font-bold text-lg text-white">Preferences & Security</h3>

          <div className="space-y-4 font-mono text-xs">
            {/* Unique Referral Code Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-emerald-500/20 bg-emerald-950/10">
              <div className="flex items-center gap-3">
                <Gift className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-white font-semibold">Your Referral Code (20% Lifetime Commission)</p>
                  <p className="text-slate-400 text-[11px]">Give this code to friends so you earn 20% on their deposits.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-500/30 hover:bg-purple-900 text-purple-200 font-bold font-mono text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  title="Copy referral link"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Link2 className="w-3.5 h-3.5 text-purple-400" />}
                  <span>{copiedLink ? 'Link Copied' : 'Copy Link'}</span>
                </button>
                <button
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold font-mono text-xs transition-colors cursor-pointer flex items-center gap-1"
                  title="Copy code"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{userReferralCode}</span>
                </button>
              </div>
            </div>

            {/* Audio Toggle */}
            <div className="flex items-center justify-between p-4 rounded-2xl border border-white/10 bg-white/5">
              <div className="flex items-center gap-3">
                {soundEnabled ? <Volume2 className="w-5 h-5 text-purple-400" /> : <VolumeX className="w-5 h-5 text-slate-500" />}
                <div>
                  <p className="text-white font-semibold">Sound Effects (Web Audio FX)</p>
                  <p className="text-slate-400 text-[11px]">Tactile clicks, buying chimes & modal sounds.</p>
                </div>
              </div>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`rounded-full px-4 py-1.5 font-bold transition-all cursor-pointer ${
                  soundEnabled ? 'bg-white text-black' : 'border border-white/10 bg-white/5 text-slate-400'
                }`}
              >
                {soundEnabled ? 'ENABLED' : 'MUTED'}
              </button>
            </div>

            {/* Currency Selector */}
            <div className="flex items-center justify-between p-4 rounded-2xl border border-white/10 bg-white/5">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-white font-semibold">Store Currency</p>
                  <p className="text-slate-400 text-[11px]">Display fictional balances in INR, USD or EUR.</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {(['INR', 'USD', 'EUR'] as const).map((curr) => (
                  <button
                    key={curr}
                    onClick={() => setCurrency(curr)}
                    className={`rounded-full px-3 py-1 font-bold transition-all cursor-pointer ${
                      currency === curr ? 'bg-white text-black' : 'border border-white/10 bg-white/5 text-slate-400'
                    }`}
                  >
                    {curr}
                  </button>
                ))}
              </div>
            </div>

            {/* Sign in / Logout */}
            <div className="flex items-center justify-between p-4 rounded-2xl border border-white/10 bg-white/5">
              <div>
                <p className="text-white font-semibold">Account Session</p>
                <p className="text-slate-400 text-[11px]">Currently logged in as @{currentUser?.username}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  id="profile-logout-btn"
                  onClick={requestLogout}
                  className="px-3 py-1.5 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-300 hover:bg-rose-950/80 text-xs font-mono flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION: SUPPORT & SAFETY */}
      {activeSection === 'support' && (
        <div className="space-y-6">
          {/* Official Telegram Support Banner */}
          <div className="p-6 sm:p-8 rounded-3xl border border-sky-500/40 bg-gradient-to-br from-sky-950/60 via-[#070b16] to-[#04060c] relative overflow-hidden backdrop-blur-xl shadow-2xl shadow-sky-950/40">
            <div className="absolute top-0 right-0 w-80 h-40 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-300 font-mono text-[10px] uppercase tracking-wider font-bold">
                  <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                  <span>24/7 OFFICIAL TELEGRAM SUPPORT</span>
                </div>
                <h3 className="font-tech font-bold text-2xl text-white flex items-center gap-2">
                  <span>Connect with @carderseller1</span>
                </h3>
                <p className="text-xs font-mono text-slate-300 leading-relaxed">
                  Need immediate help with Add Funds UPI verification, card details, orders, or account queries? Contact our official Telegram support directly for instant real-time assistance.
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <div className="px-3 py-1.5 rounded-xl bg-black/60 border border-sky-500/30 font-mono text-xs text-sky-300 flex items-center gap-2">
                    <span className="text-slate-400 font-normal">Telegram:</span>
                    <strong className="text-white font-bold">@carderseller1</strong>
                  </div>
                  <button
                    onClick={() => {
                      if (navigator.clipboard?.writeText) {
                        navigator.clipboard.writeText('@carderseller1');
                      }
                      playSound('click', soundEnabled);
                      triggerToast('Telegram Copied!', 'Username @carderseller1 copied to clipboard.');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 text-xs font-mono transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </button>
                </div>
              </div>

              <div className="w-full md:w-auto flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
                <a
                  href="https://t.me/carderseller1"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => playSound('click', soundEnabled)}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-tech font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 transition-all active:scale-95 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>OPEN TELEGRAM SUPPORT</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl border border-white/10 bg-black/40 space-y-4 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-purple-400">
              <HelpCircle className="w-5 h-5" />
              <h3 className="font-tech font-bold text-lg text-white">Storefront Safety & Legitimacy</h3>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-4 rounded-2xl border border-white/10 bg-white/5 space-y-1">
                <p className="font-bold text-white font-tech text-sm">
                  What is RAWAT CARD STORE?
                </p>
                <p className="text-slate-400 leading-relaxed font-mono text-[11px]">
                  RAWAT CARD STORE is a premium digital storefront showcasing 3D collectible cards with realistic shader rendering, Visa & Mastercard collectible series, and an administrative UPI payment management system.
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-950/10 space-y-1">
                <p className="font-bold text-emerald-300 font-tech text-sm flex items-center gap-1.5">
                  <Gift className="w-4 h-4 text-emerald-400" />
                  <span>How does the 20% Referral Commission work?</span>
                </p>
                <p className="text-slate-300 leading-relaxed font-mono text-[11px]">
                  When a friend registers using your unique referral code, both receive an instant ₹50 welcome bonus. Furthermore, whenever that friend deposits funds (Add Funds via UPI QR), 20% of their deposit amount is automatically calculated and credited directly to your digital wallet!
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-white/10 bg-white/5 space-y-1">
                <p className="font-bold text-white font-tech text-sm">
                  Are real credit card numbers or CVVs stored?
                </p>
                <p className="text-slate-400 leading-relaxed font-mono text-[11px]">
                  <strong>Strictly No.</strong> We never store, generate, validate, or sell real payment-card credentials, CVV, OTP, PIN, or banking credentials. All card numbers are fictional masked collectible identifiers.
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-white/10 bg-white/5 space-y-1">
                <p className="font-bold text-white font-tech text-sm">
                  How does the UPI Add Funds & Admin Verification work?
                </p>
                <p className="text-slate-400 leading-relaxed font-mono text-[11px]">
                  Customers submit a payment request after scanning the admin's UPI QR. The administrator reviews the request against the store's bank ledger in the Admin Dashboard and securely approves or rejects it before any wallet balance is credited.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm sm:max-w-md w-[calc(100vw-3rem)] animate-in fade-in slide-in-from-bottom-5 duration-300 pointer-events-auto">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0d1020] via-black to-[#0d1020] border border-emerald-500/50 shadow-2xl shadow-emerald-500/20 backdrop-blur-xl flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h5 className="font-tech font-bold text-white text-sm flex items-center gap-2">
                <span>{toast.title}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                  Copied
                </span>
              </h5>
              <p className="text-xs font-mono text-slate-300 mt-1 break-all leading-relaxed">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
