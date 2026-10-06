import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  CardProduct,
  PromoCoupon,
  UserAccount,
  PaymentRequest,
  WalletTransaction
} from '../types';
import { CardNetworkLogo } from '../components/cards/CardNetworkLogo';
import { RarityBadge } from '../components/cards/RarityBadge';
import {
  Package,
  Tag,
  ShoppingBag,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Sparkles,
  Layers,
  Shield,
  Search,
  DollarSign,
  QrCode,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Wallet as WalletIcon,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownLeft,
  Lock,
  Eye,
  Users,
  Receipt,
  Gift,
  Phone,
  Mail,
  UserCheck,
  UserX,
  Share2,
  CreditCard,
  History,
  TrendingUp,
  Award,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  AlertTriangle,
  Crown,
  Radio,
  LifeBuoy,
  Download,
  Activity,
  MessageSquare,
  Zap,
  ArrowLeft,
  Boxes,
  CheckSquare,
  Square
} from 'lucide-react';
import { BulkActionPanel } from '../components/admin/BulkActionPanel';
import { playSound } from '../utils/audio';
import { AdminPaymentSettings } from '../components/admin/AdminPaymentSettings';
import { AdminLiveAnalytics } from '../components/admin/AdminLiveAnalytics';
import { AdminVIPTierManager } from '../components/admin/AdminVIPTierManager';
import { AdminCardCreatorModal } from '../components/admin/AdminCardCreatorModal';
import { AdminWalletAdjustmentModal } from '../components/admin/AdminWalletAdjustmentModal';
import { AdminCouponManager } from '../components/admin/AdminCouponManager';
import { AdminExportReports } from '../components/admin/AdminExportReports';
import { AdminBroadcastBanner } from '../components/admin/AdminBroadcastBanner';
import { AdminSecurityFraudMonitor } from '../components/admin/AdminSecurityFraudMonitor';
import { AdminReferralProgramSettings } from '../components/admin/AdminReferralProgramSettings';
import { AdminSupportTickets } from '../components/admin/AdminSupportTickets';
import { AdminAnalyticsDashboard } from '../components/admin/AdminAnalyticsDashboard';
import { AdminLiveChatConsole } from '../components/admin/AdminLiveChatConsole';
import { Realistic3DCard } from '../components/cards/Realistic3DCard';
import { AdminHologramStudioModal } from '../components/admin/AdminHologramStudioModal';
import { HolographicOverlayType } from '../types';
import { HOLOGRAM_CONFIGS, ALL_HOLOGRAMS, getHologramConfig } from '../utils/hologram';
import { AdminPageSkeleton } from '../components/common/Skeletons';

export const AdminPage: React.FC = () => {
  const {
    currentUser,
    users,
    wallets,
    isAdmin,
    isSuperAdmin,
    cards,
    addCard,
    updateCard,
    deleteCard,
    coupons,
    addCoupon,
    updateCoupon,
    deleteCoupon,
    orders,
    deleteOrder,
    clearAllPurchasingHistory,
    refundOrder,
    bulkProcessOrders,
    bulkUpdateCardStock,
    transactions,
    referrals,
    paymentRequests,
    approvePaymentRequest,
    rejectPaymentRequest,
    adminCreditBalance,
    adminDebitBalance,
    adminManualVerifyUser,
    adminUpdateUserStatus,
    deleteUser,
    auditLogs,
    formatPrice,
    soundEnabled,
    setIsAuthModalOpen,
    setAuthModalMode,
    isInitialLoading,
    setActiveTab,
  } = useStore();

  const [adminTab, setAdminTab] = useState<
    | 'pending_deposits'
    | 'processed_transactions'
    | 'user_management'
    | 'dashboard'
    | 'analytics'
    | 'live_chat'
    | 'vip_tiers'
    | 'products'
    | 'customers'
    | 'coupons'
    | 'broadcast'
    | 'security'
    | 'referrals'
    | 'support'
    | 'payments'
    | 'payment_settings'
    | 'export_reports'
    | 'transactions'
    | 'orders'
    | 'audit_logs'
    | 'bulk_actions'
  >('pending_deposits');

  // Multi-Order Selection state in orders tab
  const [selectedOrdersInTab, setSelectedOrdersInTab] = useState<string[]>([]);

  if (isInitialLoading) {
    return <AdminPageSkeleton />;
  }

  // Customer Search & Filter
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [customerStatusFilter, setCustomerStatusFilter] = useState<'ALL' | 'active' | 'pending_verification' | 'suspended'>('ALL');
  
  // Selected Customer for 360° Dossier View
  const [dossierUser, setDossierUser] = useState<UserAccount | null>(null);

  // Customer Wallet Credit/Debit Modal state
  const [walletTargetUser, setWalletTargetUser] = useState<UserAccount | null>(null);
  const [creditAmount, setCreditAmount] = useState<string>('500');
  const [creditReason, setCreditReason] = useState<string>('Administrative wallet adjustment');
  const [creditActionType, setCreditActionType] = useState<'ADD' | 'REMOVE'>('ADD');
  const [walletActionFeedback, setWalletActionFeedback] = useState<string | null>(null);

  // Transactions Search & Filter
  const [txnSearchQuery, setTxnSearchQuery] = useState('');
  const [txnTypeFilter, setTxnTypeFilter] = useState<string>('ALL');

  // Payment Requests Action state
  const [paymentSearchQuery, setPaymentSearchQuery] = useState('');
  const [selectedPaymentRequest, setSelectedPaymentRequest] = useState<PaymentRequest | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('Payment could not be verified in bank records');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [paymentActionFeedback, setPaymentActionFeedback] = useState<string | null>(null);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<
    'ALL' | 'PROCESSING' | 'PENDING_VERIFICATION' | 'APPROVED' | 'SUCCESS' | 'REJECTED' | 'FAILED' | 'CANCELLED'
  >('PENDING_VERIFICATION');

  // Card Editor Modal
  const [editingCard, setEditingCard] = useState<CardProduct | null>(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  
  // 3D Holographic Preview Mode & Studio states
  const [cardViewMode, setCardViewMode] = useState<'grid' | 'hologram_preview'>('hologram_preview');
  const [selectedHoloCard, setSelectedHoloCard] = useState<CardProduct | null>(null);
  const [isHoloStudioOpen, setIsHoloStudioOpen] = useState(false);
  const [globalOverlayFilter, setGlobalOverlayFilter] = useState<HolographicOverlayType | 'all'>('all');
  const [previewPerspectiveMode, setPreviewPerspectiveMode] = useState<'unowned' | 'owned'>('unowned');
  const [activeCardOverlays, setActiveCardOverlays] = useState<Record<string, HolographicOverlayType>>({});
  const [lightSweepAnimation, setLightSweepAnimation] = useState(true);

  const [cardFormData, setCardFormData] = useState<Partial<CardProduct>>({
    name: '',
    tagline: '',
    tier: 'BLACK',
    rarity: 'Epic',
    finish: 'obsidian',
    network: 'RAWAT',
    price: 499,
    status: 'AVAILABLE',
    maskedIdentifier: '**** **** **** 4821',
    expDate: '**/**',
    cvv: '***',
    edition: 'Custom RAWAT Series',
    description: '',
    perks: ['RAWAT Vault Security', '3D Hologram Shader'],
    stockCount: 20,
    featured: false,
    accentColor: '#a855f7',
    gradientClass: 'from-zinc-950 via-zinc-900 to-black',
    borderGlowClass: 'group-hover:border-purple-500/50',
  });

  // Coupon Editor Modal
  const [editingCoupon, setEditingCoupon] = useState<PromoCoupon | null>(null);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponFormData, setCouponFormData] = useState<Partial<PromoCoupon>>({
    code: '',
    discountType: 'percentage',
    discountValue: 20,
    minOrderValue: 0,
    description: '',
    isActive: true,
  });

  // Delete Confirmation Modal
  const [userToDelete, setUserToDelete] = useState<UserAccount | null>(null);

  // Security Check Barrier
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-6 animate-in fade-in duration-200">
        <div className="w-16 h-16 rounded-3xl bg-rose-950/60 border border-rose-500/50 flex items-center justify-center mx-auto text-rose-400 shadow-xl shadow-rose-500/10">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-tech font-bold text-white">Admin Access Restricted</h2>
          <p className="text-xs font-mono text-slate-400">
            Administrative panel requires authorized administrator privileges. Please sign in with an Admin account.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs font-mono text-slate-300 text-center space-y-1">
          <p className="text-slate-400">Admin privileges required.</p>
          <div className="pt-2 border-t border-white/10 text-[11px] text-slate-500">
            Current Session: @{currentUser?.username || 'unauthenticated'} ({currentUser?.role || 'none'})
          </div>
        </div>

        <button
          onClick={() => {
            setAuthModalMode('login');
            setIsAuthModalOpen(true);
          }}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-tech font-bold text-sm tracking-wider uppercase transition-all shadow-lg shadow-purple-600/30 cursor-pointer"
        >
          Sign In to Admin Portal
        </button>
      </div>
    );
  }

  // Calculate high-level metrics
  const totalUsersCount = users.length;
  const verifiedUsersCount = users.filter((u) => u.isEmailVerified).length;
  const pendingUsersCount = users.filter((u) => !u.isEmailVerified).length;

  const totalVaultBalance = Object.values(wallets).reduce((sum, w) => sum + (w.balance || 0), 0);
  
  const totalApprovedDeposits = paymentRequests
    .filter((p) => p.status === 'APPROVED')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingDepositsCount = paymentRequests.filter(
    (p) => p.status === 'PENDING_VERIFICATION' || p.status === 'PROCESSING'
  ).length;
  
  const totalReferralCommissionPaid = referrals.reduce((sum, r) => sum + (r.totalCommissionEarned || 0) + (r.signupBonusReferrer || 0), 0);
  
  const totalCardSalesVolume = orders
    .filter((o) => o.status === 'COMPLETED' || o.status === 'VAULT ARCHIVED')
    .reduce((sum, o) => sum + o.finalPrice, 0);

  // Filtered users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      (user.username && user.username.toLowerCase().includes(customerSearchQuery.toLowerCase())) ||
      (user.fullName && user.fullName.toLowerCase().includes(customerSearchQuery.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(customerSearchQuery.toLowerCase())) ||
      (user.phone && user.phone.includes(customerSearchQuery)) ||
      (user.referralCode && user.referralCode.toLowerCase().includes(customerSearchQuery.toLowerCase())) ||
      (user.id && user.id.toLowerCase().includes(customerSearchQuery.toLowerCase()));

    const matchesStatus =
      customerStatusFilter === 'ALL'
        ? true
        : customerStatusFilter === 'pending_verification'
        ? !user.isEmailVerified
        : user.status === customerStatusFilter;

    return matchesSearch && matchesStatus;
  });

  // Filtered transactions
  const filteredTransactions = transactions.filter((txn) => {
    const user = users.find((u) => u.id === txn.userId);
    const matchesSearch =
      txn.id.toLowerCase().includes(txnSearchQuery.toLowerCase()) ||
      txn.username.toLowerCase().includes(txnSearchQuery.toLowerCase()) ||
      (user?.fullName && user.fullName.toLowerCase().includes(txnSearchQuery.toLowerCase())) ||
      (txn.description && txn.description.toLowerCase().includes(txnSearchQuery.toLowerCase())) ||
      (txn.reason && txn.reason.toLowerCase().includes(txnSearchQuery.toLowerCase()));

    const matchesType = txnTypeFilter === 'ALL' || txn.type === txnTypeFilter;
    return matchesSearch && matchesType;
  });

  // Filtered payment requests
  const filteredPayments = paymentRequests.filter((p) => {
    const matchesStatus =
      paymentStatusFilter === 'ALL'
        ? true
        : paymentStatusFilter === 'PENDING_VERIFICATION'
        ? p.status === 'PENDING_VERIFICATION' || p.status === 'PROCESSING'
        : p.status === paymentStatusFilter;

    const matchesSearch =
      !paymentSearchQuery ||
      p.id.toLowerCase().includes(paymentSearchQuery.toLowerCase()) ||
      p.username.toLowerCase().includes(paymentSearchQuery.toLowerCase()) ||
      p.userEmail.toLowerCase().includes(paymentSearchQuery.toLowerCase()) ||
      (p.utrRef && p.utrRef.toLowerCase().includes(paymentSearchQuery.toLowerCase())) ||
      (p.providerReference && p.providerReference.toLowerCase().includes(paymentSearchQuery.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  // Handle Wallet Balance Adjustment
  const handleExecuteWalletAction = () => {
    if (!walletTargetUser) return;
    const numAmount = parseFloat(creditAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setWalletActionFeedback('Please specify a valid positive amount.');
      return;
    }

    if (creditActionType === 'ADD') {
      adminCreditBalance(walletTargetUser.id, numAmount, creditReason || 'Admin Manual Credit');
      setWalletActionFeedback(`Successfully credited ₹${numAmount.toFixed(2)} to @${walletTargetUser.username}!`);
    } else {
      const currentBal = wallets[walletTargetUser.id]?.balance || 0;
      if (numAmount > currentBal) {
        setWalletActionFeedback(`Cannot debit more than user's current balance (₹${currentBal.toFixed(2)}).`);
        return;
      }
      adminDebitBalance(walletTargetUser.id, numAmount, creditReason || 'Admin Manual Debit');
      setWalletActionFeedback(`Successfully debited ₹${numAmount.toFixed(2)} from @${walletTargetUser.username}!`);
    }

    playSound('success', soundEnabled);
    setTimeout(() => {
      setWalletTargetUser(null);
      setWalletActionFeedback(null);
    }, 1500);
  };

  return (
    <div id="rawat-admin-panel" className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* ========================================================
          ADMIN PANEL HEADER & GLOBAL METRICS BAR
      ======================================================== */}
      <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-[#0c0d14] via-[#10121d] to-[#0a0b12] p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 font-mono text-xs font-bold tracking-wider">
              <Shield className="w-3.5 h-3.5 text-purple-400" />
              <span>RAWAT CARD STORE • MASTER ADMIN PANEL</span>
              {isSuperAdmin && (
                <span className="ml-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                  SUPER ADMIN
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-4xl font-tech font-bold text-white tracking-tight">
              Administrator Command Center
            </h1>
            <p className="text-xs sm:text-sm font-mono text-slate-400 max-w-2xl">
              Real-time user accounts, Gmail OTP verifications, deposit approval queue, referral trees & transaction ledgers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="admin-back-to-store-btn"
              onClick={() => {
                playSound('click', soundEnabled);
                setActiveTab('home');
              }}
              className="px-3.5 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white font-mono text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
              title="Return to customer storefront"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-purple-400" />
              <span>Back to Store</span>
            </button>

            <div className="px-4 py-2.5 rounded-2xl bg-black/40 border border-white/10 flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div className="text-left font-mono">
                <div className="text-[10px] text-slate-400">ADMIN SESSION</div>
                <div className="text-xs font-bold text-white">@{currentUser?.username}</div>
              </div>
            </div>

            {pendingDepositsCount > 0 && (
              <button
                onClick={() => setAdminTab('payments')}
                className="px-4 py-2.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 font-mono text-xs font-bold flex items-center gap-2 transition-all cursor-pointer animate-bounce"
              >
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span>{pendingDepositsCount} Pending Deposit{pendingDepositsCount > 1 ? 's' : ''}</span>
              </button>
            )}
          </div>
        </div>

        {/* Global Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
            <div className="flex items-center gap-2 text-slate-400 text-[11px] font-mono mb-1">
              <Users className="w-3.5 h-3.5 text-purple-400" />
              <span>Total Customers</span>
            </div>
            <div className="text-xl font-bold font-tech text-white">{totalUsersCount}</div>
            <div className="text-[10px] font-mono text-emerald-400">{verifiedUsersCount} Verified • {pendingUsersCount} Pending</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
            <div className="flex items-center gap-2 text-slate-400 text-[11px] font-mono mb-1">
              <WalletIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>Vault Balances</span>
            </div>
            <div className="text-xl font-bold font-tech text-emerald-400">{formatPrice(totalVaultBalance)}</div>
            <div className="text-[10px] font-mono text-slate-400">Total User Wallets</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
            <div className="flex items-center gap-2 text-slate-400 text-[11px] font-mono mb-1">
              <DollarSign className="w-3.5 h-3.5 text-blue-400" />
              <span>Total Deposits</span>
            </div>
            <div className="text-xl font-bold font-tech text-blue-400">{formatPrice(totalApprovedDeposits)}</div>
            <div className="text-[10px] font-mono text-slate-400">Approved Payments</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
            <div className="flex items-center gap-2 text-slate-400 text-[11px] font-mono mb-1">
              <Gift className="w-3.5 h-3.5 text-amber-400" />
              <span>Referral Payouts</span>
            </div>
            <div className="text-xl font-bold font-tech text-amber-400">{formatPrice(totalReferralCommissionPaid)}</div>
            <div className="text-[10px] font-mono text-slate-400">{referrals.length} Referral Links</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
            <div className="flex items-center gap-2 text-slate-400 text-[11px] font-mono mb-1">
              <ShoppingBag className="w-3.5 h-3.5 text-indigo-400" />
              <span>Card Sales</span>
            </div>
            <div className="text-xl font-bold font-tech text-indigo-400">{formatPrice(totalCardSalesVolume)}</div>
            <div className="text-[10px] font-mono text-slate-400">{orders.length} Orders Placed</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
            <div className="flex items-center gap-2 text-slate-400 text-[11px] font-mono mb-1">
              <Package className="w-3.5 h-3.5 text-pink-400" />
              <span>Active Catalog</span>
            </div>
            <div className="text-xl font-bold font-tech text-pink-400">{cards.length} Cards</div>
            <div className="text-[10px] font-mono text-slate-400">{coupons.length} Promo Coupons</div>
          </div>
        </div>
      </div>

      {/* ========================================================
          ADMIN OPERATIONAL SLOTS MATRIX: 5 DEDICATED SLOTS
      ======================================================== */}
      {(() => {
        const adminSlots = [
          {
            id: 'finance_slot',
            slotNumber: 'SLOT 01',
            title: 'Financial Clearance & Gateways',
            shortName: 'Finance & Ledger',
            description: 'UPI UTR Verification, Wallet Credits & QR Gateway',
            icon: DollarSign,
            accentColor: 'amber',
            accentBorder: 'border-amber-500/40',
            accentBg: 'bg-amber-500/10',
            accentText: 'text-amber-400',
            accentGlow: 'shadow-[0_0_24px_rgba(245,158,11,0.2)]',
            gradient: 'from-amber-950/70 via-amber-900/25 to-black',
            activeRing: 'ring-2 ring-amber-500/60 border-amber-400/80',
            badge: pendingDepositsCount > 0 ? `${pendingDepositsCount} ACTION REQUIRED` : `${transactions.length} Txns`,
            isAlert: pendingDepositsCount > 0,
            subTabs: [
              {
                id: 'pending_deposits' as const,
                aliases: ['pending_deposits', 'payments'],
                label: 'Pending Deposits',
                icon: DollarSign,
                badge: pendingDepositsCount > 0 ? `${pendingDepositsCount} PENDING` : undefined,
                isAlert: pendingDepositsCount > 0,
              },
              {
                id: 'processed_transactions' as const,
                aliases: ['processed_transactions', 'transactions'],
                label: 'Processed Ledger',
                icon: Receipt,
                badge: `${transactions.length}`,
              },
              {
                id: 'payment_settings' as const,
                aliases: ['payment_settings'],
                label: 'Gateway & UPI QR',
                icon: QrCode,
              },
            ],
          },
          {
            id: 'catalog_slot',
            slotNumber: 'SLOT 02',
            title: '3D Card Studio & Inventory',
            shortName: 'Cards & Orders',
            description: '3D Shader Cards, Orders Fulfillment & Coupons',
            icon: Layers,
            accentColor: 'purple',
            accentBorder: 'border-purple-500/40',
            accentBg: 'bg-purple-500/10',
            accentText: 'text-purple-400',
            accentGlow: 'shadow-[0_0_24px_rgba(168,85,247,0.2)]',
            gradient: 'from-purple-950/70 via-purple-900/25 to-black',
            activeRing: 'ring-2 ring-purple-500/60 border-purple-400/80',
            badge: `${cards.length} Cards`,
            isAlert: false,
            subTabs: [
              {
                id: 'products' as const,
                aliases: ['products'],
                label: '3D Card Studio',
                icon: Package,
                badge: `${cards.length}`,
              },
              {
                id: 'orders' as const,
                aliases: ['orders'],
                label: 'Customer Orders',
                icon: ShoppingBag,
                badge: `${orders.length}`,
              },
              {
                id: 'coupons' as const,
                aliases: ['coupons'],
                label: 'Promo Coupons',
                icon: Tag,
                badge: `${coupons.length}`,
              },
              {
                id: 'bulk_actions' as const,
                aliases: ['bulk_actions', 'bulk'],
                label: 'Bulk Operations',
                icon: CheckSquare,
                badge: orders.filter((o) => o.refundStatus === 'REQUESTED' && o.status !== 'REFUNDED').length > 0
                  ? `${orders.filter((o) => o.refundStatus === 'REQUESTED' && o.status !== 'REFUNDED').length} PENDING`
                  : 'BATCH',
                isAlert: orders.filter((o) => o.refundStatus === 'REQUESTED' && o.status !== 'REFUNDED').length > 0,
              },
            ],
          },
          {
            id: 'crm_slot',
            slotNumber: 'SLOT 03',
            title: 'Customer Directory & VIP CRM',
            shortName: 'Customers & CRM',
            description: 'Account Dossiers, KYC, VIP Matrix & Support Desk',
            icon: Users,
            accentColor: 'sky',
            accentBorder: 'border-sky-500/40',
            accentBg: 'bg-sky-500/10',
            accentText: 'text-sky-400',
            accentGlow: 'shadow-[0_0_24px_rgba(56,189,248,0.2)]',
            gradient: 'from-sky-950/70 via-sky-900/25 to-black',
            activeRing: 'ring-2 ring-sky-500/60 border-sky-400/80',
            badge: `${users.length} Users`,
            isAlert: false,
            subTabs: [
              {
                id: 'user_management' as const,
                aliases: ['user_management', 'customers'],
                label: 'User Directory & KYC',
                icon: Users,
                badge: `${users.length}`,
              },
              {
                id: 'vip_tiers' as const,
                aliases: ['vip_tiers'],
                label: 'VIP Status Matrix',
                icon: Crown,
              },
              {
                id: 'live_chat' as const,
                aliases: ['live_chat'],
                label: 'Live Customer Desk',
                icon: MessageSquare,
              },
              {
                id: 'support' as const,
                aliases: ['support'],
                label: 'Support SLA Tickets',
                icon: LifeBuoy,
              },
            ],
          },
          {
            id: 'intelligence_slot',
            slotNumber: 'SLOT 04',
            title: 'Intelligence & Marketing Hub',
            shortName: 'Intelligence & Ads',
            description: 'Live Command Gauges, Revenue Trends & Affiliates',
            icon: TrendingUp,
            accentColor: 'emerald',
            accentBorder: 'border-emerald-500/40',
            accentBg: 'bg-emerald-500/10',
            accentText: 'text-emerald-400',
            accentGlow: 'shadow-[0_0_24px_rgba(16,185,129,0.2)]',
            gradient: 'from-emerald-950/70 via-emerald-900/25 to-black',
            activeRing: 'ring-2 ring-emerald-500/60 border-emerald-400/80',
            badge: `${referrals.length} Links`,
            isAlert: false,
            subTabs: [
              {
                id: 'dashboard' as const,
                aliases: ['dashboard'],
                label: 'Live Overview',
                icon: TrendingUp,
              },
              {
                id: 'analytics' as const,
                aliases: ['analytics'],
                label: 'Profit Intelligence',
                icon: Activity,
              },
              {
                id: 'referrals' as const,
                aliases: ['referrals'],
                label: 'Referral Engine',
                icon: Gift,
                badge: `${referrals.length}`,
              },
              {
                id: 'broadcast' as const,
                aliases: ['broadcast'],
                label: 'Broadcast Alerts',
                icon: Radio,
              },
            ],
          },
          {
            id: 'security_slot',
            slotNumber: 'SLOT 05',
            title: 'Security Sentinel & Compliance',
            shortName: 'Security & Audits',
            description: 'Fraud Detection, Immutable Audit Trail & CSV Exports',
            icon: ShieldAlert,
            accentColor: 'rose',
            accentBorder: 'border-rose-500/40',
            accentBg: 'bg-rose-500/10',
            accentText: 'text-rose-400',
            accentGlow: 'shadow-[0_0_24px_rgba(244,63,94,0.2)]',
            gradient: 'from-rose-950/70 via-rose-900/25 to-black',
            activeRing: 'ring-2 ring-rose-500/60 border-rose-400/80',
            badge: 'Audit & Guard',
            isAlert: false,
            subTabs: [
              {
                id: 'security' as const,
                aliases: ['security'],
                label: 'Fraud Sentinel',
                icon: ShieldAlert,
              },
              {
                id: 'audit_logs' as const,
                aliases: ['audit_logs'],
                label: 'Audit Trail',
                icon: Shield,
              },
              {
                id: 'export_reports' as const,
                aliases: ['export_reports'],
                label: 'Reports & CSV Export',
                icon: Download,
              },
            ],
          },
        ];

        const activeSlot = adminSlots.find((slot) =>
          slot.subTabs.some((tab) => (tab.aliases as string[]).includes(adminTab))
        ) || adminSlots[0];

        return (
          <div className="space-y-6">
            {/* Slots Matrix Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-6 w-1 rounded-full bg-gradient-to-b from-amber-400 to-purple-500" />
                <h2 className="font-tech font-bold text-lg text-white tracking-wide">
                  OPERATIONAL COMMAND SLOTS
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 font-mono text-[10px] font-bold">
                  5 SLOTS CONFIGURED
                </span>
              </div>
              <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
                <span>Active Slot:</span>
                <span className={`px-2 py-0.5 rounded-md ${activeSlot.accentBg} ${activeSlot.accentText} border ${activeSlot.accentBorder} font-bold`}>
                  {activeSlot.slotNumber} • {activeSlot.shortName}
                </span>
              </div>
            </div>

            {/* 5 Distinct Operational Slots Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {adminSlots.map((slot) => {
                const isSlotActive = slot.id === activeSlot.id;
                const SlotIcon = slot.icon;

                return (
                  <div
                    key={slot.id}
                    id={`admin-slot-card-${slot.id}`}
                    onClick={() => {
                      playSound('click', soundEnabled);
                      // Switch to first subTab if clicking on a different slot
                      if (!isSlotActive) {
                        setAdminTab(slot.subTabs[0].id);
                        if (slot.subTabs[0].id === 'pending_deposits') {
                          setPaymentStatusFilter('PENDING_VERIFICATION');
                        }
                      }
                    }}
                    className={`p-4 rounded-3xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between group ${
                      isSlotActive
                        ? `bg-gradient-to-b ${slot.gradient} ${slot.activeRing} ${slot.accentGlow}`
                        : 'bg-black/40 border-white/10 hover:border-white/20 hover:bg-white/[0.03]'
                    }`}
                  >
                    {/* Top Status & Badge */}
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className={`text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-full ${
                          isSlotActive
                            ? `${slot.accentBg} ${slot.accentText} border ${slot.accentBorder}`
                            : 'bg-white/5 text-slate-400 border border-white/10'
                        }`}>
                          {slot.slotNumber}
                        </span>

                        {slot.badge && (
                          <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase truncate max-w-[130px] ${
                            slot.isAlert
                              ? 'bg-amber-500 text-black animate-pulse font-black shadow-sm'
                              : isSlotActive
                              ? `${slot.accentBg} ${slot.accentText}`
                              : 'bg-white/5 text-slate-400'
                          }`}>
                            {slot.badge}
                          </span>
                        )}
                      </div>

                      {/* Icon & Title */}
                      <div className="flex items-start gap-3 mb-2">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                          isSlotActive
                            ? `${slot.accentBg} ${slot.accentText} border ${slot.accentBorder} shadow-lg`
                            : 'bg-white/5 text-slate-400 border border-white/10 group-hover:text-white'
                        }`}>
                          <SlotIcon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h3 className={`font-tech font-bold text-sm tracking-wide transition-colors ${
                            isSlotActive ? 'text-white' : 'text-slate-200 group-hover:text-white'
                          }`}>
                            {slot.shortName}
                          </h3>
                          <p className="text-[10px] font-mono text-slate-400 line-clamp-1 mt-0.5">
                            {slot.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Sub-Feature Quick Pills inside Slot */}
                    <div className="pt-3 border-t border-white/10 mt-2 space-y-1.5">
                      <div className="text-[9px] font-mono uppercase tracking-widest text-slate-500 font-bold">
                        Slot Features:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {slot.subTabs.map((sub) => {
                          const isSubActive = (sub.aliases as string[]).includes(adminTab);
                          const SubIcon = sub.icon;

                          return (
                            <button
                              key={sub.id}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                playSound('click', soundEnabled);
                                setAdminTab(sub.id);
                                if (sub.id === 'pending_deposits') {
                                  setPaymentStatusFilter('PENDING_VERIFICATION');
                                }
                              }}
                              className={`px-2 py-1 rounded-xl text-[10px] font-mono font-medium flex items-center gap-1 transition-all cursor-pointer ${
                                isSubActive
                                  ? `${slot.accentBg} ${slot.accentText} border ${slot.accentBorder} font-bold shadow-sm`
                                  : 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
                              }`}
                            >
                              <SubIcon className="w-3 h-3 shrink-0" />
                              <span className="truncate max-w-[90px]">{sub.label}</span>
                              {sub.badge && (
                                <span className={`text-[8px] font-bold px-1 rounded ${
                                  sub.isAlert
                                    ? 'bg-amber-500 text-black animate-pulse'
                                    : 'bg-white/10 text-slate-300'
                                }`}>
                                  {sub.badge}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Active Slot Control Ribbon & Breadcrumb Bar */}
            <div className={`p-4 rounded-3xl border transition-all ${activeSlot.gradient} ${activeSlot.accentBorder} shadow-xl backdrop-blur-xl`}>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left: Active Slot Metadata */}
                <div className="flex items-center gap-3.5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${activeSlot.accentBg} ${activeSlot.accentText} border ${activeSlot.accentBorder} shadow-md`}>
                    <activeSlot.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${activeSlot.accentBg} ${activeSlot.accentText} border ${activeSlot.accentBorder}`}>
                        {activeSlot.slotNumber}
                      </span>
                      <span className="font-tech font-bold text-white text-base tracking-wide">
                        {activeSlot.title}
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                      {activeSlot.description}
                    </p>
                  </div>
                </div>

                {/* Right: Sub-Slot Feature Switcher Pills */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold hidden sm:inline mr-1">
                    Select Feature:
                  </span>
                  {activeSlot.subTabs.map((sub) => {
                    const isSubActive = (sub.aliases as string[]).includes(adminTab);
                    const SubIcon = sub.icon;

                    return (
                      <button
                        key={sub.id}
                        id={`subslot-btn-${sub.id}`}
                        onClick={() => {
                          playSound('click', soundEnabled);
                          setAdminTab(sub.id);
                          if (sub.id === 'pending_deposits') {
                            setPaymentStatusFilter('PENDING_VERIFICATION');
                          }
                        }}
                        className={`px-3.5 py-2 rounded-2xl font-mono text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
                          isSubActive
                            ? `${activeSlot.accentBg} ${activeSlot.accentText} border ${activeSlot.accentBorder} ring-2 ring-white/20 shadow-md`
                            : 'bg-black/50 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <SubIcon className="w-4 h-4 shrink-0" />
                        <span>{sub.label}</span>
                        {sub.badge && (
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                            sub.isAlert
                              ? 'bg-amber-500 text-black font-black animate-pulse'
                              : 'bg-white/10 text-slate-300'
                          }`}>
                            {sub.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ========================================================
          TAB 1: DASHBOARD OVERVIEW & LIVE ANALYTICS
      ======================================================== */}
      {adminTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Live Charts & KPI Visualizer */}
          <AdminLiveAnalytics />

          {/* Quick Actions & Pending Requests */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pending Deposits Box */}
            <div className="lg:col-span-2 rounded-3xl border border-white/15 bg-black/40 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-amber-400" />
                  <h3 className="font-tech font-bold text-white text-lg">
                    Pending Deposit Verification Requests
                  </h3>
                </div>
                <button
                  onClick={() => setAdminTab('payments')}
                  className="text-xs font-mono text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>View All</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {pendingDepositsCount === 0 ? (
                <div className="p-8 rounded-2xl bg-white/[0.02] border border-dashed border-white/10 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <p className="text-xs font-mono text-slate-400">All customer deposit requests are up to date. No pending approvals.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {paymentRequests
                    .filter((p) => p.status === 'PENDING_VERIFICATION')
                    .slice(0, 4)
                    .map((req) => (
                      <div
                        key={req.id}
                        className="p-4 rounded-2xl bg-white/[0.03] border border-amber-500/20 hover:border-amber-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1 font-mono">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">@{req.username}</span>
                            <span className="text-[11px] text-slate-400">({req.userEmail})</span>
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                              {req.id}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 flex items-center gap-3">
                            <span>Amount: <strong className="text-emerald-400">{formatPrice(req.amount)}</strong></span>
                            {req.utrRef && <span>UTR: <strong className="text-white">{req.utrRef}</strong></span>}
                            <span>{req.requestedAt}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => {
                              approvePaymentRequest(req.id);
                              playSound('success', soundEnabled);
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedPaymentRequest(req);
                              setShowRejectModal(true);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-500/30 text-rose-300 font-mono text-xs transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Quick Actions & Navigation */}
            <div className="rounded-3xl border border-white/15 bg-black/40 p-6 space-y-4">
              <h3 className="font-tech font-bold text-white text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <span>Admin Quick Actions</span>
              </h3>

              <div className="grid grid-cols-1 gap-2.5">
                <button
                  onClick={() => setAdminTab('customers')}
                  className="w-full p-3 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-purple-500/40 hover:bg-white/[0.08] transition-all text-left flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-purple-400" />
                    <div>
                      <div className="text-xs font-mono font-bold text-white">Manage Customers</div>
                      <div className="text-[10px] font-mono text-slate-400">View user details, verify OTPs, adjust wallet</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                </button>

                <button
                  onClick={() => setAdminTab('transactions')}
                  className="w-full p-3 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-purple-500/40 hover:bg-white/[0.08] transition-all text-left flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Receipt className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="text-xs font-mono font-bold text-white">Master Transaction Ledger</div>
                      <div className="text-[10px] font-mono text-slate-400">View every customer credit, debit & purchase</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                </button>

                <button
                  onClick={() => setAdminTab('referrals')}
                  className="w-full p-3 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-purple-500/40 hover:bg-white/[0.08] transition-all text-left flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Gift className="w-4 h-4 text-amber-400" />
                    <div>
                      <div className="text-xs font-mono font-bold text-white">Referral Performance</div>
                      <div className="text-[10px] font-mono text-slate-400">Track 20% commission & customer referral tree</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                </button>

                <button
                  onClick={() => setAdminTab('payment_settings')}
                  className="w-full p-3 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-purple-500/40 hover:bg-white/[0.08] transition-all text-left flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <QrCode className="w-4 h-4 text-blue-400" />
                    <div>
                      <div className="text-xs font-mono font-bold text-white">Configure UPI & QR Code</div>
                      <div className="text-[10px] font-mono text-slate-400">Update payment gateway QR & UPI ID</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                </button>
              </div>
            </div>
          </div>

          {/* Recent Global Transactions Overview */}
          <div className="rounded-3xl border border-white/15 bg-black/40 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-purple-400" />
                <h3 className="font-tech font-bold text-white text-lg">
                  Recent Global Activity
                </h3>
              </div>
              <button
                onClick={() => setAdminTab('transactions')}
                className="text-xs font-mono text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Full Ledger ({transactions.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-3">Txn ID</th>
                    <th className="py-3 px-3">Customer</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Amount</th>
                    <th className="py-3 px-3">Description</th>
                    <th className="py-3 px-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {transactions.slice(0, 6).map((txn) => {
                    const user = users.find((u) => u.id === txn.userId);
                    const isCredit = txn.type === 'ADMIN_CREDIT' || txn.type === 'PAYMENT_DEPOSIT' || txn.type === 'REFUND' || txn.type === 'REFERRAL_SIGNUP_BONUS' || txn.type === 'REFERRAL_DEPOSIT_COMMISSION';
                    return (
                      <tr key={txn.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-3 text-slate-400">{txn.id}</td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-white">{user?.fullName || txn.username}</div>
                          <div className="text-[10px] text-purple-400">@{txn.username}</div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-slate-300">
                            {txn.type}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`font-bold ${isCredit ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isCredit ? '+' : '-'}{formatPrice(Math.abs(txn.amount))}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-300 max-w-xs truncate">{txn.description}</td>
                        <td className="py-3 px-3 text-slate-400 whitespace-nowrap">{txn.createdAt}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB: PROFIT INTELLIGENCE & BUSINESS ANALYTICS
      ======================================================== */}
      {adminTab === 'analytics' && (
        <div className="space-y-6">
          <AdminAnalyticsDashboard />
        </div>
      )}

      {/* ========================================================
          TAB: LIVE CUSTOMER SUPPORT & REALTIME DESK
      ======================================================== */}
      {adminTab === 'live_chat' && (
        <div className="space-y-6">
          <AdminLiveChatConsole />
        </div>
      )}

      {/* ========================================================
          CORE TAB: USER MANAGEMENT & COLLECTORS DIRECTORY
      ======================================================== */}
      {(adminTab === 'user_management' || adminTab === 'customers') && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* User Management Metric Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
              <div className="text-[11px] font-mono text-slate-400">Total Registered Users</div>
              <div className="text-2xl font-tech font-bold text-white mt-1">{users.length}</div>
              <div className="text-[10px] font-mono text-purple-400 mt-0.5">Collectors & Admins</div>
            </div>
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
              <div className="text-[11px] font-mono text-slate-400">Verified Accounts</div>
              <div className="text-2xl font-tech font-bold text-emerald-400 mt-1">{verifiedUsersCount}</div>
              <div className="text-[10px] font-mono text-emerald-400/80 mt-0.5">Gmail OTP Confirmed</div>
            </div>
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
              <div className="text-[11px] font-mono text-slate-400">Pending Verification</div>
              <div className="text-2xl font-tech font-bold text-amber-400 mt-1">{pendingUsersCount}</div>
              <div className="text-[10px] font-mono text-amber-400/80 mt-0.5">Awaiting Activation</div>
            </div>
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
              <div className="text-[11px] font-mono text-slate-400">Total Vault Liquidity</div>
              <div className="text-2xl font-tech font-bold text-sky-400 mt-1">{formatPrice(totalVaultBalance)}</div>
              <div className="text-[10px] font-mono text-slate-400 mt-0.5">In Active User Wallets</div>
            </div>
          </div>

          {/* Header Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-black/40 border border-white/15">
            <div className="relative flex-1 max-w-md">
              <input
                id="customer-search-input"
                type="text"
                value={customerSearchQuery}
                onChange={(e) => setCustomerSearchQuery(e.target.value)}
                placeholder="Search by Name, Username, Gmail, Phone, or Referral Code..."
                className="w-full rounded-xl border border-white/10 bg-black/60 pl-10 pr-4 py-2 text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/60"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto">
              {[
                { id: 'ALL', label: `All Users (${users.length})` },
                { id: 'active', label: `Active (${users.filter(u => u.status === 'active').length})` },
                { id: 'pending_verification', label: `Pending OTP (${pendingUsersCount})` },
                { id: 'suspended', label: `Suspended (${users.filter(u => u.status === 'suspended').length})` },
              ].map((filterTab) => (
                <button
                  key={filterTab.id}
                  onClick={() => setCustomerStatusFilter(filterTab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                    customerStatusFilter === filterTab.id
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
                  }`}
                >
                  {filterTab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Customer Table */}
          <div className="rounded-3xl border border-white/15 bg-black/40 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-white/15 bg-white/[0.03] text-slate-400 text-[11px] uppercase tracking-wider">
                    <th className="py-3.5 px-4">Customer Details</th>
                    <th className="py-3.5 px-3">Contact & Email</th>
                    <th className="py-3.5 px-3">Account Status</th>
                    <th className="py-3.5 px-3">Referral Info</th>
                    <th className="py-3.5 px-3">Wallet Balance</th>
                    <th className="py-3.5 px-3">Deposits</th>
                    <th className="py-3.5 px-3">Joined Date</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500 font-mono">
                        No customer accounts matched your search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => {
                      const userWallet = wallets[user.id]?.balance || 0;
                      const userDeposits = paymentRequests.filter(
                        (p) => p.userId === user.id && p.status === 'APPROVED'
                      );
                      const totalDeposited = userDeposits.reduce((sum, p) => sum + p.amount, 0);
                      const inviter = user.referredBy ? users.find((u) => u.id === user.referredBy) : null;
                      const isSuper = user.role === 'super_admin';

                      return (
                        <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                          {/* Customer Details */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-purple-950/60 border border-purple-500/40 flex items-center justify-center text-purple-300 font-bold font-tech text-sm shrink-0">
                                {user.username.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-white flex items-center gap-1.5">
                                  <span>{user.fullName || user.username}</span>
                                  {isSuper && (
                                    <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold">
                                      SUPER ADMIN
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-purple-400">@{user.username}</div>
                                <div className="text-[10px] text-slate-500">{user.id}</div>
                              </div>
                            </div>
                          </td>

                          {/* Contact & Email */}
                          <td className="py-3.5 px-3">
                            <div className="space-y-0.5">
                              <div className="text-white flex items-center gap-1">
                                <Mail className="w-3 h-3 text-slate-400" />
                                <span>{user.email}</span>
                              </div>
                              {user.phone && (
                                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-slate-500" />
                                  <span>{user.phone}</span>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Account Status */}
                          <td className="py-3.5 px-3">
                            {user.status === 'suspended' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-bold">
                                <UserX className="w-3 h-3 text-rose-400" />
                                <span>Suspended</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span>Active</span>
                              </span>
                            )}
                          </td>

                          {/* Referral Info */}
                          <td className="py-3.5 px-3">
                            <div className="space-y-0.5 text-[11px]">
                              <div>Code: <strong className="text-purple-300">{user.referralCode}</strong></div>
                              {inviter ? (
                                <div className="text-slate-400 text-[10px]">
                                  Invited by: <span className="text-white">@{inviter.username}</span>
                                </div>
                              ) : (
                                <div className="text-slate-600 text-[10px]">Direct Signup</div>
                              )}
                            </div>
                          </td>

                          {/* Wallet Balance */}
                          <td className="py-3.5 px-3">
                            <div className="font-bold text-emerald-400 text-sm">
                              {formatPrice(userWallet)}
                            </div>
                          </td>

                          {/* Deposits */}
                          <td className="py-3.5 px-3">
                            <div className="space-y-0.5">
                              <div className="font-bold text-white">{formatPrice(totalDeposited)}</div>
                              <div className="text-[10px] text-slate-400">{userDeposits.length} deposit(s)</div>
                            </div>
                          </td>

                          {/* Joined Date */}
                          <td className="py-3.5 px-3 text-slate-400 whitespace-nowrap text-[11px]">
                            {user.createdAt}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* 360° Dossier View */}
                              <button
                                title="View Customer Dossier (History, Deposits, Referrals)"
                                onClick={() => {
                                  playSound('click', soundEnabled);
                                  setDossierUser(user);
                                }}
                                className="p-1.5 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-300 hover:bg-purple-600 hover:text-white transition-all cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {/* Manual Verify if not verified */}
                              {!user.isEmailVerified && (
                                <button
                                  title="Manually Verify Customer Email"
                                  onClick={() => adminManualVerifyUser(user.id)}
                                  className="p-1.5 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-600 hover:text-white transition-all cursor-pointer"
                                >
                                  <UserCheck className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Adjust Wallet */}
                              <button
                                title="Credit / Debit Customer Wallet"
                                onClick={() => {
                                  playSound('click', soundEnabled);
                                  setWalletTargetUser(user);
                                  setCreditAmount('500');
                                  setCreditReason('Administrative credit');
                                  setCreditActionType('ADD');
                                }}
                                className="p-1.5 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-300 hover:bg-blue-600 hover:text-white transition-all cursor-pointer"
                              >
                                <WalletIcon className="w-3.5 h-3.5" />
                              </button>

                              {/* Suspend / Activate User */}
                              {!isSuper && (
                                <button
                                  title={user.status === 'suspended' ? 'Activate User' : 'Suspend User'}
                                  onClick={() => adminUpdateUserStatus(user.id, user.status === 'suspended' ? 'active' : 'suspended')}
                                  className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                                    user.status === 'suspended'
                                      ? 'bg-amber-600/20 border-amber-500/40 text-amber-300 hover:bg-amber-600 hover:text-white'
                                      : 'bg-slate-800 border-white/10 text-slate-400 hover:text-white hover:bg-slate-700'
                                  }`}
                                >
                                  {user.status === 'suspended' ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                                </button>
                              )}

                              {/* Delete User */}
                              {!isSuper && (
                                <button
                                  title="Delete Customer Account"
                                  onClick={() => setUserToDelete(user)}
                                  className="p-1.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-400 hover:bg-rose-600 hover:text-white transition-all cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          CORE TAB: PROCESSED TRANSACTIONS & MASTER LEDGER
      ======================================================== */}
      {(adminTab === 'processed_transactions' || adminTab === 'transactions') && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Transaction Metrics Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
              <div className="text-[11px] font-mono text-slate-400">Total Recorded Txns</div>
              <div className="text-2xl font-tech font-bold text-white mt-1">{transactions.length}</div>
              <div className="text-[10px] font-mono text-emerald-400 mt-0.5">Immutable Audit Trail</div>
            </div>
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
              <div className="text-[11px] font-mono text-slate-400">Total Deposits Volume</div>
              <div className="text-2xl font-tech font-bold text-blue-400 mt-1">{formatPrice(totalApprovedDeposits)}</div>
              <div className="text-[10px] font-mono text-blue-400/80 mt-0.5">Direct Wallet Inflows</div>
            </div>
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
              <div className="text-[11px] font-mono text-slate-400">Store Card Purchases</div>
              <div className="text-2xl font-tech font-bold text-indigo-400 mt-1">{formatPrice(totalCardSalesVolume)}</div>
              <div className="text-[10px] font-mono text-indigo-400/80 mt-0.5">{orders.length} Completed Orders</div>
            </div>
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
              <div className="text-[11px] font-mono text-slate-400">Referral Commissions</div>
              <div className="text-2xl font-tech font-bold text-amber-400 mt-1">{formatPrice(totalReferralCommissionPaid)}</div>
              <div className="text-[10px] font-mono text-amber-400/80 mt-0.5">20% Tier Bonus Disbursed</div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-black/40 border border-white/15">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={txnSearchQuery}
                onChange={(e) => setTxnSearchQuery(e.target.value)}
                placeholder="Search transactions by user name, ID, or description..."
                className="w-full rounded-xl border border-white/10 bg-black/60 pl-10 pr-4 py-2 text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/60"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto">
              {[
                { id: 'ALL', label: 'All Types' },
                { id: 'PAYMENT_DEPOSIT', label: 'Deposits' },
                { id: 'PRODUCT_PURCHASE', label: 'Card Purchases' },
                { id: 'REFERRAL_SIGNUP_BONUS', label: 'Referral Signup' },
                { id: 'REFERRAL_DEPOSIT_COMMISSION', label: '20% Commission' },
                { id: 'ADMIN_CREDIT', label: 'Admin Credits' },
                { id: 'ADMIN_DEBIT', label: 'Admin Debits' },
                { id: 'REFUND', label: 'Refunds' },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setTxnTypeFilter(filter.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                    txnTypeFilter === filter.id
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/15 bg-black/40 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-white/15 bg-white/[0.03] text-slate-400 text-[11px] uppercase tracking-wider">
                    <th className="py-3.5 px-4">Transaction ID</th>
                    <th className="py-3.5 px-4">Customer Name & Username</th>
                    <th className="py-3.5 px-3">Type</th>
                    <th className="py-3.5 px-3">Status</th>
                    <th className="py-3.5 px-3">Amount</th>
                    <th className="py-3.5 px-3">Balance After</th>
                    <th className="py-3.5 px-4">Description & Reason</th>
                    <th className="py-3.5 px-3">Created By</th>
                    <th className="py-3.5 px-4">Date & Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-500 font-mono">
                        No transactions found for the selected filter.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((txn) => {
                      const user = users.find((u) => u.id === txn.userId);
                      const isCredit = txn.type === 'ADMIN_CREDIT' || txn.type === 'PAYMENT_DEPOSIT' || txn.type === 'REFUND' || txn.type === 'REFERRAL_SIGNUP_BONUS' || txn.type === 'REFERRAL_DEPOSIT_COMMISSION';

                      return (
                        <tr key={txn.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3.5 px-4 text-slate-400 font-bold">{txn.id}</td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-white">{user?.fullName || txn.username}</div>
                            <div className="text-[11px] text-purple-400">@{txn.username}</div>
                          </td>
                          <td className="py-3.5 px-3">
                            <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-slate-300 whitespace-nowrap">
                              {txn.type}
                            </span>
                          </td>
                          <td className="py-3.5 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono inline-flex items-center gap-1 ${
                              txn.status === 'PENDING'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : txn.status === 'REJECTED' || txn.status === 'FAILED'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}>
                              {txn.status === 'COMPLETED' || !txn.status ? (
                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                              ) : null}
                              <span>{txn.status || 'COMPLETED'}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-3">
                            <span className={`font-bold text-sm ${isCredit ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {isCredit ? '+' : '-'}{formatPrice(Math.abs(txn.amount))}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-slate-300 font-bold">
                            {formatPrice(txn.balanceAfter)}
                          </td>
                          <td className="py-3.5 px-4 text-slate-300 max-w-sm">
                            <div>{txn.description}</div>
                            {txn.reason && <div className="text-[10px] text-slate-500 italic">{txn.reason}</div>}
                          </td>
                          <td className="py-3.5 px-3 text-slate-400">{txn.createdBy}</td>
                          <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap text-[11px]">{txn.createdAt}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          CORE TAB: PENDING DEPOSITS & LIVE UPI INFLOW QUEUE
      ======================================================== */}
      {(adminTab === 'pending_deposits' || adminTab === 'payments') && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Pending Deposits Metric Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-black/40 border border-amber-500/30">
              <div className="text-[11px] font-mono text-amber-400 font-bold flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Pending Verification</span>
              </div>
              <div className="text-2xl font-tech font-bold text-amber-400 mt-1">{pendingDepositsCount} Requests</div>
              <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                Total: {formatPrice(paymentRequests.filter(p => p.status === 'PENDING_VERIFICATION' || p.status === 'PROCESSING').reduce((s, p) => s + p.amount, 0))}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
              <div className="text-[11px] font-mono text-slate-400">Total Settled Deposits</div>
              <div className="text-2xl font-tech font-bold text-emerald-400 mt-1">{formatPrice(totalApprovedDeposits)}</div>
              <div className="text-[10px] font-mono text-emerald-400/80 mt-0.5">
                {paymentRequests.filter(p => p.status === 'APPROVED' || p.status === 'SUCCESS').length} Approved Orders
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
              <div className="text-[11px] font-mono text-slate-400">Total Deposit Inflow Requests</div>
              <div className="text-2xl font-tech font-bold text-white mt-1">{paymentRequests.length}</div>
              <div className="text-[10px] font-mono text-purple-400 mt-0.5">All-Time UPI Inflow Records</div>
            </div>
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
              <div className="text-[11px] font-mono text-slate-400">Rejected / Failed Inflows</div>
              <div className="text-2xl font-tech font-bold text-rose-400 mt-1">
                {paymentRequests.filter(p => p.status === 'REJECTED' || p.status === 'FAILED').length}
              </div>
              <div className="text-[10px] font-mono text-rose-400/80 mt-0.5">Declined or Invalid UTR</div>
            </div>
          </div>

          {/* Search & Filter Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-black/40 border border-white/15">
            <div className="relative flex-1 max-w-md">
              <input
                id="payment-search-input"
                type="text"
                value={paymentSearchQuery}
                onChange={(e) => setPaymentSearchQuery(e.target.value)}
                placeholder="Search by UTR Reference, Order ID, Customer, or Gmail..."
                className="w-full rounded-xl border border-white/10 bg-black/60 pl-10 pr-4 py-2 text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/60"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'PENDING_VERIFICATION', label: `Pending Action (${pendingDepositsCount})` },
                { id: 'ALL', label: `All Orders (${paymentRequests.length})` },
                { id: 'APPROVED', label: 'Admin Approved' },
                { id: 'SUCCESS', label: 'Verified Success' },
                { id: 'PROCESSING', label: 'Processing' },
                { id: 'REJECTED', label: 'Rejected' },
                { id: 'FAILED', label: 'Failed' },
              ].map((filterTab) => (
                <button
                  key={filterTab.id}
                  onClick={() => setPaymentStatusFilter(filterTab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                    paymentStatusFilter === filterTab.id
                      ? 'bg-amber-500 text-black shadow-md'
                      : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
                  }`}
                >
                  {filterTab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/15 bg-black/40 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-white/15 bg-white/[0.03] text-slate-400 text-[11px] uppercase tracking-wider">
                    <th className="py-3.5 px-4">Order ID & Provider Ref</th>
                    <th className="py-3.5 px-4">Customer Name & Email</th>
                    <th className="py-3.5 px-3">Amount</th>
                    <th className="py-3.5 px-3">Method</th>
                    <th className="py-3.5 px-3">Status</th>
                    <th className="py-3.5 px-4">Timestamp</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500 font-mono">
                        No payment records matching the selected status filter.
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((req) => {
                      const user = users.find((u) => u.id === req.userId);
                      return (
                        <tr key={req.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-white">{req.id}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {req.providerReference || req.utrRef || 'Direct UPI'}
                            </div>
                            {req.isTestMode && (
                              <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] bg-purple-950 text-purple-300 border border-purple-500/30">
                                SANDBOX TEST
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-white">{user?.fullName || req.username}</div>
                            <div className="text-[11px] text-purple-400">@{req.username} • {req.userEmail}</div>
                          </td>
                          <td className="py-3.5 px-3">
                            <span className="font-bold text-emerald-400 text-sm">
                              {formatPrice(req.amount)}
                            </span>
                          </td>
                          <td className="py-3.5 px-3">
                            <span className="px-2 py-0.5 rounded bg-black/60 border border-white/10 text-slate-300 font-mono text-[11px]">
                              {req.paymentMethod === 'GOOGLE_PAY'
                                ? 'Google Pay'
                                : req.paymentMethod === 'PHONEPE'
                                ? 'PhonePe'
                                : req.paymentMethod === 'PAYTM'
                                ? 'Paytm'
                                : req.paymentMethod === 'QR_SCAN'
                                ? 'Store QR'
                                : req.paymentMethod === 'MANUAL_UTR'
                                ? 'Manual UTR'
                                : 'UPI Intent'}
                            </span>
                          </td>
                          <td className="py-3.5 px-3">
                            {(req.status === 'APPROVED' || req.status === 'SUCCESS') && (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold inline-flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                {req.status === 'SUCCESS' ? 'VERIFIED SUCCESS' : 'APPROVED'}
                              </span>
                            )}
                            {req.status === 'PROCESSING' && (
                              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold inline-flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                                PROCESSING
                              </span>
                            )}
                            {req.status === 'PENDING_VERIFICATION' && (
                              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold inline-flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                PENDING MANUAL
                              </span>
                            )}
                            {(req.status === 'REJECTED' || req.status === 'FAILED') && (
                              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold inline-flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                                {req.status === 'FAILED' ? 'FAILED' : 'REJECTED'}
                              </span>
                            )}
                            {req.status === 'CANCELLED' && (
                              <span className="px-2.5 py-0.5 rounded-full bg-slate-500/20 text-slate-300 text-[10px] font-bold">
                                CANCELLED
                              </span>
                            )}
                            {req.status === 'EXPIRED' && (
                              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-bold">
                                EXPIRED
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap text-[11px]">
                            <div>{req.requestedAt}</div>
                            {req.reviewedAt && <div className="text-[10px] text-slate-500">Verified: {req.reviewedAt}</div>}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {req.status === 'PENDING_VERIFICATION' || req.status === 'PROCESSING' ? (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => {
                                    approvePaymentRequest(req.id);
                                    playSound('success', soundEnabled);
                                  }}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-all shadow-md flex items-center gap-1 cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Approve</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedPaymentRequest(req);
                                    setShowRejectModal(true);
                                  }}
                                  className="px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-500/30 text-rose-300 font-mono text-xs transition-all flex items-center gap-1 cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>Reject</span>
                                </button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-500">Settled</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 5: REFERRAL TREE & 20% COMMISSION TRACKER
      ======================================================== */}
      {adminTab === 'referrals' && (
        <div className="space-y-6">
          {/* Referral Stats Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-purple-950/30 border border-purple-500/30 space-y-1">
              <div className="text-xs font-mono text-purple-300">Total Referral Connections</div>
              <div className="text-2xl font-bold font-tech text-white">{referrals.length} Linked Users</div>
            </div>
            <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-1">
              <div className="text-xs font-mono text-emerald-300">Total Friend Deposit Volume</div>
              <div className="text-2xl font-bold font-tech text-emerald-400">
                {formatPrice(referrals.reduce((sum, r) => sum + (r.totalDepositedByFriend || 0), 0))}
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-1">
              <div className="text-xs font-mono text-amber-300">Total 20% Commission Distributed</div>
              <div className="text-2xl font-bold font-tech text-amber-400">
                {formatPrice(referrals.reduce((sum, r) => sum + (r.totalCommissionEarned || 0), 0))}
              </div>
            </div>
          </div>

          {/* Referral Network Table */}
          <div className="rounded-3xl border border-white/15 bg-black/40 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-white/15 bg-white/[0.03] text-slate-400 text-[11px] uppercase tracking-wider">
                    <th className="py-3.5 px-4">Referrer (Inviter)</th>
                    <th className="py-3.5 px-4">Referred Customer</th>
                    <th className="py-3.5 px-3">Referral Code</th>
                    <th className="py-3.5 px-3">Signup Bonuses</th>
                    <th className="py-3.5 px-3">Friend Deposits</th>
                    <th className="py-3.5 px-3">20% Lifetime Commission</th>
                    <th className="py-3.5 px-4">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {referrals.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500 font-mono">
                        No referrals recorded yet. Customers will appear here when they sign up with invite codes.
                      </td>
                    </tr>
                  ) : (
                    referrals.map((ref) => {
                      const referrer = users.find((u) => u.id === ref.referrerId);
                      const referred = users.find((u) => u.id === ref.referredUserId);

                      return (
                        <tr key={ref.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-white">{referrer?.fullName || ref.referrerUsername}</div>
                            <div className="text-[11px] text-purple-400">@{ref.referrerUsername}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-white">{referred?.fullName || ref.referredUsername}</div>
                            <div className="text-[11px] text-purple-400">@{ref.referredUsername} • {ref.referredEmail}</div>
                          </td>
                          <td className="py-3.5 px-3">
                            <span className="px-2 py-0.5 rounded bg-purple-500/20 border border-purple-500/30 text-purple-300 font-bold">
                              {ref.referralCodeUsed}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-emerald-400 font-bold">
                            ₹{ref.signupBonusReferrer} (Inviter) + ₹{ref.signupBonusReferred} (Customer)
                          </td>
                          <td className="py-3.5 px-3 text-white font-bold">
                            {formatPrice(ref.totalDepositedByFriend || 0)}
                          </td>
                          <td className="py-3.5 px-3 text-amber-400 font-bold text-sm">
                            {formatPrice(ref.totalCommissionEarned || 0)}
                          </td>
                          <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap text-[11px]">{ref.createdAt}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 6: CARD ORDERS & ACQUISITIONS
      ======================================================== */}
      {adminTab === 'orders' && (
        <div className="space-y-6">
          {/* Header Banner with Statistics & Reset Action */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-black/50 border border-white/15 backdrop-blur-xl shadow-xl">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
                <span className="font-mono text-xs text-purple-400 uppercase tracking-widest font-bold">
                  ORDERS & PURCHASES LEDGER
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                Customer & Admin Purchasing Records
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Total Orders: <span className="text-white font-bold">{orders.length}</span> • Total Volume: <span className="text-emerald-400 font-bold">{formatPrice(orders.reduce((sum, o) => sum + (o.finalPrice || 0), 0))}</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                id="orders-go-to-bulk-btn"
                onClick={() => {
                  playSound('click', soundEnabled);
                  setAdminTab('bulk_actions');
                }}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono text-xs font-bold transition-all shadow-lg shadow-purple-600/30 flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <CheckSquare className="w-4 h-4" />
                <span>⚡ Bulk Action Center</span>
                {orders.filter((o) => o.refundStatus === 'REQUESTED' && o.status !== 'REFUNDED').length > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-black text-[10px] font-black animate-pulse">
                    {orders.filter((o) => o.refundStatus === 'REQUESTED' && o.status !== 'REFUNDED').length} PENDING
                  </span>
                )}
              </button>

              <button
                onClick={async () => {
                  if (window.confirm('⚠️ WARNING: This will permanently delete all customer and admin card purchase history, reset all sold cards back to AVAILABLE in the store catalog, and clear collection vaults. Are you sure you want to make the website completely brand new?')) {
                    await clearAllPurchasingHistory();
                  }
                }}
                className="px-4 py-2.5 rounded-2xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-rose-200 hover:text-white font-mono text-xs font-bold transition-all shadow-lg hover:shadow-rose-950/50 flex items-center gap-2 cursor-pointer active:scale-95"
                title="Wipe all purchasing records & reset store cards to brand new"
              >
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span>Clear All Purchasing History</span>
              </button>
            </div>
          </div>

          {/* Quick Bulk Processing Toolbar when orders are selected in table */}
          {selectedOrdersInTab.length > 0 && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/90 via-slate-900 to-black border-2 border-purple-500/60 backdrop-blur-xl flex flex-wrap items-center justify-between gap-3 shadow-xl">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-purple-300 font-bold">
                  {selectedOrdersInTab.length} Orders Selected
                </span>
                <span className="font-mono text-xs text-emerald-400 font-bold">
                  Total: {formatPrice(orders.filter((o) => selectedOrdersInTab.includes(o.id)).reduce((s, o) => s + (o.finalPrice || 0), 0))}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={async () => {
                    const confirmed = window.confirm(`Bulk approve & refund ${selectedOrdersInTab.length} selected orders?`);
                    if (!confirmed) return;
                    await bulkProcessOrders({
                      orderIds: selectedOrdersInTab,
                      action: 'REFUND_APPROVE',
                      reason: 'Bulk approved by Admin',
                    });
                    setSelectedOrdersInTab([]);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Bulk Approve Refunds</span>
                </button>

                <button
                  onClick={async () => {
                    await bulkProcessOrders({
                      orderIds: selectedOrdersInTab,
                      action: 'MARK_COMPLETED',
                    });
                    setSelectedOrdersInTab([]);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 text-blue-200 font-mono text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Mark Completed</span>
                </button>

                <button
                  onClick={async () => {
                    if (window.confirm(`Permanently delete ${selectedOrdersInTab.length} selected order records?`)) {
                      await bulkProcessOrders({
                        orderIds: selectedOrdersInTab,
                        action: 'DELETE',
                      });
                      setSelectedOrdersInTab([]);
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500/40 text-rose-200 font-mono text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>

                <button
                  onClick={() => {
                    playSound('click', soundEnabled);
                    setAdminTab('bulk_actions');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 font-mono text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Advanced Processor →</span>
                </button>

                <button
                  onClick={() => setSelectedOrdersInTab([])}
                  className="text-xs font-mono text-slate-400 hover:text-white underline cursor-pointer ml-1"
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          <div className="rounded-3xl border border-white/15 bg-black/40 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-white/15 bg-white/[0.03] text-slate-400 text-[11px] uppercase tracking-wider">
                    <th className="py-3.5 px-4 w-10 text-center">
                      <button
                        onClick={() => {
                          playSound('click', soundEnabled);
                          if (selectedOrdersInTab.length === orders.length) {
                            setSelectedOrdersInTab([]);
                          } else {
                            setSelectedOrdersInTab(orders.map((o) => o.id));
                          }
                        }}
                        className="cursor-pointer text-slate-400 hover:text-white"
                      >
                        {orders.length > 0 && selectedOrdersInTab.length === orders.length ? (
                          <CheckSquare className="w-4 h-4 text-purple-400 inline" />
                        ) : (
                          <Square className="w-4 h-4 inline" />
                        )}
                      </button>
                    </th>
                    <th className="py-3.5 px-4">Order ID</th>
                    <th className="py-3.5 px-4">Customer Name & Username</th>
                    <th className="py-3.5 px-4">Card Purchased</th>
                    <th className="py-3.5 px-3">Price Paid</th>
                    <th className="py-3.5 px-3">Status</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-14 text-center text-slate-500 font-mono">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <ShoppingBag className="w-8 h-8 text-slate-600 mb-1" />
                          <div className="text-slate-400 font-bold text-sm">No card orders recorded</div>
                          <div className="text-slate-600 text-xs">Purchasing history is completely clean and new.</div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => {
                      const user = users.find((u) => u.id === order.userId);
                      const isRefunded = order.status === 'REFUNDED' || order.refundStatus === 'COMPLETED';
                      const isRefundPending = !isRefunded && order.refundStatus === 'REQUESTED';
                      const isSelected = selectedOrdersInTab.includes(order.id);

                      return (
                        <tr
                          key={order.id}
                          className={`transition-colors ${
                            isSelected
                              ? 'bg-purple-950/25 hover:bg-purple-950/35'
                              : 'hover:bg-white/[0.02]'
                          }`}
                        >
                          <td className="py-3.5 px-4 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {
                                playSound('click', soundEnabled);
                                setSelectedOrdersInTab((prev) =>
                                  prev.includes(order.id)
                                    ? prev.filter((id) => id !== order.id)
                                    : [...prev, order.id]
                                );
                              }}
                              className="w-4 h-4 rounded border-slate-700 text-purple-600 focus:ring-purple-500 cursor-pointer"
                            />
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-400">{order.id}</td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-white">{user?.fullName || user?.username || order.userId || 'Customer'}</div>
                            <div className="text-[11px] text-purple-400">@{user?.username || order.userId || 'collector'}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-white">{order.cardName}</div>
                            <div className="text-[10px] text-slate-400">{order.cardTier} Tier • {order.cardRarity}</div>
                          </td>
                          <td className="py-3.5 px-3 font-bold text-emerald-400 text-sm">
                            {formatPrice(order.finalPrice)}
                          </td>
                          <td className="py-3.5 px-3">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono inline-flex items-center gap-1 ${
                              isRefunded
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : isRefundPending
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                                : order.status === 'COMPLETED' || order.status === 'VAULT ARCHIVED'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}>
                              {isRefunded && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                              {isRefundPending && <Clock className="w-3 h-3 text-amber-400" />}
                              {!isRefunded && !isRefundPending && order.status === 'COMPLETED' && <Check className="w-3 h-3 text-emerald-400" />}
                              <span>{isRefunded ? 'REFUND COMPLETED' : isRefundPending ? 'REFUND REQUESTED' : order.status}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap text-[11px]">{order.purchaseDate || order.createdAt}</td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {isRefunded ? (
                                <span className="px-3 py-1 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-mono text-[11px] font-bold inline-flex items-center gap-1 select-none">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                  <span>Refunded</span>
                                </span>
                              ) : isRefundPending ? (
                                <button
                                  onClick={async () => {
                                    await refundOrder(order.id, order.refundReason || 'Admin approved customer refund request');
                                  }}
                                  className="px-3 py-1 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-mono text-[11px] font-bold cursor-pointer active:scale-95 transition-all shadow-md inline-flex items-center gap-1"
                                  title="Approve pending customer refund request"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Approve Refund</span>
                                </button>
                              ) : (
                                <button
                                  onClick={async () => {
                                    await refundOrder(order.id, 'Admin initiated refund');
                                  }}
                                  className="px-3 py-1 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-500/30 text-rose-300 font-mono text-[11px] font-semibold cursor-pointer active:scale-95 transition-all shadow-sm"
                                >
                                  Refund
                                </button>
                              )}

                              <button
                                onClick={async () => {
                                  if (window.confirm(`Delete order record ${order.id}?`)) {
                                    await deleteOrder(order.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-white/10 transition-colors cursor-pointer"
                                title="Delete Order Record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 7: CARD PRODUCTS INVENTORY & HOLOGRAPHIC PREVIEW STUDIO
      ======================================================== */}
      {adminTab === 'products' && (
        <div className="space-y-6">
          {/* Header Bar with View Mode Switcher */}
          <div className="p-5 rounded-3xl bg-black/60 border border-white/15 backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">
                  Card Architecture & Holographic Lab
                </span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-[9px] font-mono font-bold">
                  LIVE SHADER PREVIEW
                </span>
              </div>
              <h3 className="font-tech font-bold text-white text-xl flex items-center gap-2">
                <span>3D Card Vault & Hologram Studio</span>
                <span className="text-xs font-mono text-slate-400 font-normal">({cards.length} Cards in Catalog)</span>
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* View Mode Toggle Pill */}
              <div className="flex items-center p-1 rounded-2xl bg-black/80 border border-white/15">
                <button
                  onClick={() => {
                    playSound('click', soundEnabled);
                    setCardViewMode('hologram_preview');
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    cardViewMode === 'hologram_preview'
                      ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-lg shadow-purple-600/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Holographic Preview</span>
                </button>
                <button
                  onClick={() => {
                    playSound('click', soundEnabled);
                    setCardViewMode('grid');
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    cardViewMode === 'grid'
                      ? 'bg-white/20 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Specifications List</span>
                </button>
              </div>

              {/* Bulk Category Stock Manager Shortcut */}
              <button
                id="products-bulk-stock-btn"
                onClick={() => {
                  playSound('click', soundEnabled);
                  setAdminTab('bulk_actions');
                }}
                className="px-3.5 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all active:scale-95"
                title="Batch update stock levels for specific card categories"
              >
                <Boxes className="w-4 h-4 text-amber-400" />
                <span>Bulk Stock Synchronizer</span>
              </button>

              {/* Add New Card Button */}
              <button
                onClick={() => {
                  setEditingCard(null);
                  setCardFormData({
                    name: '',
                    tagline: '',
                    tier: 'BLACK',
                    rarity: 'Epic',
                    finish: 'obsidian',
                    holographicOverlay: 'prism_rainbow',
                    network: 'RAWAT',
                    price: 499,
                    status: 'AVAILABLE',
                    maskedIdentifier: '**** **** **** ' + Math.floor(1000 + Math.random() * 9000),
                    expDate: '12/29',
                    cvv: '***',
                    edition: 'RAWAT Series 2026',
                    description: 'Elite collectible card edition with 3D shaders and metallic finish.',
                    perks: ['RAWAT Vault Security', 'Holographic Verification'],
                    stockCount: 25,
                    featured: false,
                    accentColor: '#a855f7',
                    gradientClass: 'from-zinc-950 via-zinc-900 to-black',
                    borderGlowClass: 'group-hover:border-purple-500/50',
                  });
                  setIsCardModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-purple-600/30 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add New 3D Card</span>
              </button>
            </div>
          </div>

          {/* ========================================================
              VIEW 1: HOLOGRAPHIC PREVIEW STUDIO MODE
          ======================================================== */}
          {cardViewMode === 'hologram_preview' && (
            <div className="space-y-6">
              {/* Hologram Controls & Global Shader Filter Bar */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Holographic Overlay Filter:</span>
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      (Toggle below to preview different light dispersion shaders across the catalog)
                    </span>
                  </div>

                  {/* Simulator Options: Perspective & Light Beam Sweep */}
                  <div className="flex items-center gap-2">
                    {/* User Perspective Toggle */}
                    <div className="flex items-center p-1 rounded-xl bg-black/60 border border-white/10 text-[10px] font-mono">
                      <button
                        onClick={() => setPreviewPerspectiveMode('unowned')}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                          previewPerspectiveMode === 'unowned'
                            ? 'bg-purple-600 text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                        title="Simulate store visitor seeing masked credentials"
                      >
                        Store Visitor View
                      </button>
                      <button
                        onClick={() => setPreviewPerspectiveMode('owned')}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                          previewPerspectiveMode === 'owned'
                            ? 'bg-emerald-600 text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                        title="Simulate vault owner seeing unmasked 16-digit card and PIN/CVV"
                      >
                        Vault Owner View
                      </button>
                    </div>

                    {/* Light Sweep toggle */}
                    <button
                      onClick={() => setLightSweepAnimation(!lightSweepAnimation)}
                      className={`px-3 py-1.5 rounded-xl border text-[10px] font-mono font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        lightSweepAnimation
                          ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                      }`}
                      title="Toggle simulated specular light sweep rays"
                    >
                      <Zap className="w-3 h-3" />
                      <span>Light Sweep {lightSweepAnimation ? 'ON' : 'OFF'}</span>
                    </button>
                  </div>
                </div>

                {/* Hologram Filter Chips */}
                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-white/5">
                  <button
                    onClick={() => {
                      playSound('click', soundEnabled);
                      setGlobalOverlayFilter('all');
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                      globalOverlayFilter === 'all'
                        ? 'bg-white/20 text-white font-bold border border-white/30'
                        : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
                    }`}
                  >
                    All Shaders
                  </button>

                  {ALL_HOLOGRAMS.map((holoId) => {
                    const cfg = HOLOGRAM_CONFIGS[holoId];
                    const isSelected = globalOverlayFilter === holoId;
                    return (
                      <button
                        key={holoId}
                        onClick={() => {
                          playSound('click', soundEnabled);
                          setGlobalOverlayFilter(holoId);
                        }}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'text-white font-bold shadow-md'
                            : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
                        }`}
                        style={{
                          backgroundColor: isSelected ? `${cfg.accentColor}33` : undefined,
                          borderColor: isSelected ? cfg.accentColor : undefined,
                          borderWidth: isSelected ? '1px' : undefined,
                        }}
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: cfg.accentColor }}
                        />
                        <span>{cfg.badge}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3D Holographic Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {cards
                  .filter((card) => {
                    if (globalOverlayFilter === 'all') return true;
                    const cardOverlay = activeCardOverlays[card.id] || card.holographicOverlay || 'prism_rainbow';
                    return cardOverlay === globalOverlayFilter;
                  })
                  .map((card) => {
                    const currentCardOverlay =
                      activeCardOverlays[card.id] !== undefined
                        ? activeCardOverlays[card.id]
                        : card.holographicOverlay || 'prism_rainbow';
                    const holoConfig = getHologramConfig(currentCardOverlay);

                    return (
                      <div
                        key={card.id}
                        className="p-5 rounded-3xl border border-white/15 bg-black/60 hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-4 backdrop-blur-xl relative overflow-hidden group shadow-xl"
                      >
                        {/* Background Subtle Accent Glow */}
                        <div
                          className="absolute -right-20 -top-20 w-44 h-44 rounded-full blur-3xl pointer-events-none opacity-20 transition-all group-hover:opacity-35"
                          style={{ backgroundColor: holoConfig.accentColor }}
                        />

                        {/* Top Card Info & Rarity */}
                        <div className="space-y-1 z-10">
                          <div className="flex items-center justify-between">
                            <span
                              className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 border"
                              style={{
                                backgroundColor: `${holoConfig.accentColor}15`,
                                borderColor: `${holoConfig.accentColor}40`,
                                color: holoConfig.accentColor,
                              }}
                            >
                              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: holoConfig.accentColor }} />
                              <span>{holoConfig.badge}</span>
                            </span>
                            <RarityBadge rarity={card.rarity || 'Epic'} size="xs" showGlow={true} />
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <div>
                              <h4 className="font-tech font-bold text-white text-base truncate max-w-[180px]">
                                {card.name}
                              </h4>
                              <p className="text-[11px] font-mono text-slate-400 truncate max-w-[200px]">
                                {card.tagline}
                              </p>
                            </div>
                            <span className="text-emerald-400 font-mono font-bold text-sm">
                              {formatPrice(card.price)}
                            </span>
                          </div>
                        </div>

                        {/* 3D Realistic Interactive Card Rendering */}
                        <div className="py-2 flex items-center justify-center w-full z-10">
                          <Realistic3DCard
                            card={card}
                            size="md"
                            interactiveTilt={true}
                            showFlipButton={true}
                            overlay={currentCardOverlay}
                            activeScanAnimation={lightSweepAnimation}
                            simulationPerspective={previewPerspectiveMode}
                          />
                        </div>

                        {/* Interactive Holographic Overlay Switcher Strip */}
                        <div className="space-y-2 z-10 pt-2 border-t border-white/10">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-cyan-400" />
                              <span>Toggle Hologram Overlay:</span>
                            </span>
                            <span className="text-[9px] font-mono text-cyan-300 font-bold">
                              {holoConfig.name.split(' ')[0]}
                            </span>
                          </div>

                          {/* Fast Pill Selector */}
                          <div className="grid grid-cols-5 gap-1">
                            {ALL_HOLOGRAMS.map((holoId) => {
                              const cfg = HOLOGRAM_CONFIGS[holoId];
                              const isSelected = currentCardOverlay === holoId;
                              return (
                                <button
                                  key={holoId}
                                  onClick={() => {
                                    playSound('click', soundEnabled);
                                    setActiveCardOverlays((prev) => ({
                                      ...prev,
                                      [card.id]: holoId,
                                    }));
                                  }}
                                  className={`p-1 rounded-lg text-center border transition-all cursor-pointer text-[8px] font-mono truncate ${
                                    isSelected
                                      ? 'text-white font-bold ring-1 shadow-sm'
                                      : 'bg-black/40 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                                  }`}
                                  style={{
                                    backgroundColor: isSelected ? `${cfg.accentColor}33` : undefined,
                                    borderColor: isSelected ? cfg.accentColor : undefined,
                                  }}
                                  title={`${cfg.name} (${cfg.tagline})`}
                                >
                                  {cfg.badge.split(' ')[0]}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Action Buttons: Inspect in Hologram Studio / Apply Overlay / Edit Specs */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 z-10">
                          <button
                            onClick={() => {
                              playSound('click', soundEnabled);
                              setSelectedHoloCard({
                                ...card,
                                holographicOverlay: currentCardOverlay,
                              });
                              setIsHoloStudioOpen(true);
                            }}
                            className="py-2 px-3 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/30 text-cyan-300 font-mono text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Hologram Studio</span>
                          </button>

                          {currentCardOverlay !== card.holographicOverlay ? (
                            <button
                              onClick={async () => {
                                await updateCard(card.id, { holographicOverlay: currentCardOverlay });
                                playSound('success', soundEnabled);
                              }}
                              className="py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer shadow-lg shadow-purple-600/30 transition-all active:scale-95"
                              title="Save this holographic shader to store"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Apply to Card</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingCard(card);
                                setIsCardModalOpen(true);
                              }}
                              className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-mono text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Edit Specs</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* ========================================================
              VIEW 2: SPECIFICATIONS & INVENTORY LIST MODE
          ======================================================== */}
          {cardViewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cards.map((card) => (
                <div
                  key={card.id}
                  className="p-5 rounded-3xl border border-white/15 bg-black/40 hover:border-purple-500/40 transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <CardNetworkLogo network={card.network} className="h-6" />
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[9px] font-mono">
                          {getHologramConfig(card.holographicOverlay).badge}
                        </span>
                        <RarityBadge rarity={card.rarity} />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-tech font-bold text-white text-base">{card.name}</h4>
                      <p className="text-xs font-mono text-slate-400">{card.tagline}</p>
                    </div>

                    {/* Card Credentials & Limit Specs Preview */}
                    <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5 font-mono text-[11px]">
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Card Number:</span>
                        <span className="text-white font-bold tracking-wider font-mono">
                          {card.cardNumber || card.maskedIdentifier || '•••• •••• •••• 4821'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Exp & CVV:</span>
                        <span className="text-purple-300 font-bold">
                          {card.expDate || `${card.expMonth || '08'}/${(card.expYear || '2032').slice(-2)}`} • CVV: <strong className="text-white">{card.cvv || '821'}</strong>
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Overall Limit:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sky-400 font-bold">
                            ₹{(card.limit || (card.price ? Math.round(card.price * 12) : 6500)).toLocaleString('en-IN')}
                          </span>
                          {card.price && (card.limit || Math.round(card.price * 12)) >= card.price * 10 && (
                            <span className="text-[8px] font-mono font-black text-amber-300 bg-amber-950/70 border border-amber-500/30 px-1 rounded">
                              {Math.round((card.limit || Math.round(card.price * 12)) / card.price)}X+
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Daily / Monthly:</span>
                        <span className="text-cyan-300 font-bold">
                          ₹{(card.dailyLimit || Math.round((card.limit || 250000) * 0.3)).toLocaleString('en-IN')} / ₹{(card.monthlyLimit || card.limit || 250000).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Bank / PIN:</span>
                        <span className="text-amber-300 text-[10px]">
                          {card.bankName || 'RAWAT BANK'} • PIN: {card.cardPin || '4821'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-white/10">
                      <span className="text-emerald-400 font-bold text-sm">{formatPrice(card.price)}</span>
                      <span className="text-slate-400">Stock: <strong className="text-white">{card.stockCount}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-white/10">
                    <button
                      onClick={() => {
                        setSelectedHoloCard(card);
                        setIsHoloStudioOpen(true);
                      }}
                      className="p-2 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-900 cursor-pointer"
                      title="Inspect Holographic Shaders"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingCard(card);
                        setIsCardModalOpen(true);
                      }}
                      className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit Specifications</span>
                    </button>
                    <button
                      onClick={() => deleteCard(card.id)}
                      className="p-2 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-400 hover:bg-rose-900 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          VIP TIERS MATRIX
      ======================================================== */}
      {adminTab === 'vip_tiers' && (
        <div className="space-y-6">
          <AdminVIPTierManager />
        </div>
      )}

      {/* ========================================================
          PROMO COUPONS & FLASH CAMPAIGNS
      ======================================================== */}
      {adminTab === 'coupons' && (
        <div className="space-y-6">
          <AdminCouponManager />
        </div>
      )}

      {/* ========================================================
          BROADCAST NOTIFICATIONS & STOREFRONT ALERTS
      ======================================================== */}
      {adminTab === 'broadcast' && (
        <div className="space-y-6">
          <AdminBroadcastBanner />
        </div>
      )}

      {/* ========================================================
          SECURITY & FRAUD SENTINEL
      ======================================================== */}
      {adminTab === 'security' && (
        <div className="space-y-6">
          <AdminSecurityFraudMonitor />
        </div>
      )}

      {/* ========================================================
          SUPPORT TICKETS & SLA RESOLVER
      ======================================================== */}
      {adminTab === 'support' && (
        <div className="space-y-6">
          <AdminSupportTickets />
        </div>
      )}

      {/* ========================================================
          DATA EXPORT & COMPLIANCE REPORTS (CSV)
      ======================================================== */}
      {adminTab === 'export_reports' && (
        <div className="space-y-6">
          <AdminExportReports />
        </div>
      )}

      {/* ========================================================
          UPI & QR PAYMENT GATEWAY SETTINGS
      ======================================================== */}
      {adminTab === 'payment_settings' && (
        <div className="space-y-6">
          <AdminPaymentSettings />
        </div>
      )}

      {/* ========================================================
          BULK ACTIONS & INVENTORY MANAGER
      ======================================================== */}
      {adminTab === 'bulk_actions' && (
        <BulkActionPanel onNavigateTab={(tab) => setAdminTab(tab)} />
      )}

      {/* ========================================================
          TAB 10: AUDIT LOGS
      ======================================================== */}
      {adminTab === 'audit_logs' && (
        <div className="space-y-4">
          <div className="rounded-3xl border border-white/15 bg-black/40 overflow-hidden p-6 space-y-4">
            <h3 className="font-tech font-bold text-white text-lg flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-purple-400" />
              <span>Administrative Audit Trail & Security Logs</span>
            </h3>

            <div className="space-y-2">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold text-[10px]">
                        {log.action}
                      </span>
                      <span className="text-white font-bold">Admin @{log.adminUsername}</span>
                    </div>
                    <div className="text-slate-400">{log.reason}</div>
                  </div>
                  <div className="text-slate-500 text-[11px] shrink-0">{log.timestamp}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: 360° CUSTOMER DOSSIER VIEW
      ======================================================== */}
      {dossierUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl max-h-[90vh] rounded-3xl border border-white/20 bg-[#090a10] p-6 sm:p-8 shadow-2xl text-slate-100 overflow-y-auto space-y-6">
            <button
              onClick={() => setDossierUser(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* User Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-purple-950/80 border border-purple-500/50 flex items-center justify-center text-purple-300 font-bold font-tech text-2xl">
                  {dossierUser.username.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-tech font-bold text-white">
                      {dossierUser.fullName || dossierUser.username}
                    </h2>
                    {dossierUser.isEmailVerified ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">
                        Verified
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold">
                        Pending OTP ({dossierUser.verificationCode || 'No OTP'})
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-mono text-purple-400">
                    @{dossierUser.username} • {dossierUser.email} {dossierUser.phone ? `• ${dossierUser.phone}` : ''}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                    User ID: {dossierUser.id} • Referral Code: <strong className="text-purple-300">{dossierUser.referralCode}</strong> • Joined: {dossierUser.createdAt}
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/60 border border-emerald-500/30 text-right font-mono">
                <div className="text-[10px] text-slate-400 uppercase">Current Wallet Balance</div>
                <div className="text-xl font-bold text-emerald-400">
                  {formatPrice(wallets[dossierUser.id]?.balance || 0)}
                </div>
              </div>
            </div>

            {/* Dossier Tabs / Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Section 1: All User Transactions */}
              <div className="space-y-3 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                <h4 className="font-tech font-bold text-white text-sm flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-purple-400" />
                  <span>Customer Transaction History</span>
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {transactions.filter((t) => t.userId === dossierUser.id).length === 0 ? (
                    <div className="text-xs font-mono text-slate-500 text-center py-6">
                      No transactions recorded for this customer yet.
                    </div>
                  ) : (
                    transactions
                      .filter((t) => t.userId === dossierUser.id)
                      .map((txn) => {
                        const isCredit = txn.type === 'ADMIN_CREDIT' || txn.type === 'PAYMENT_DEPOSIT' || txn.type === 'REFUND' || txn.type === 'REFERRAL_SIGNUP_BONUS' || txn.type === 'REFERRAL_DEPOSIT_COMMISSION';
                        return (
                          <div
                            key={txn.id}
                            className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-xs font-mono flex items-center justify-between"
                          >
                            <div>
                              <div className="text-white font-bold">{txn.description}</div>
                              <div className="text-[10px] text-slate-400">{txn.createdAt} • {txn.type}</div>
                            </div>
                            <div className={`font-bold ${isCredit ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {isCredit ? '+' : '-'}{formatPrice(Math.abs(txn.amount))}
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>

              {/* Section 2: Deposit Requests */}
              <div className="space-y-3 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                <h4 className="font-tech font-bold text-white text-sm flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span>Deposit & Payment Requests</span>
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {paymentRequests.filter((p) => p.userId === dossierUser.id).length === 0 ? (
                    <div className="text-xs font-mono text-slate-500 text-center py-6">
                      No deposit requests submitted by this customer.
                    </div>
                  ) : (
                    paymentRequests
                      .filter((p) => p.userId === dossierUser.id)
                      .map((p) => (
                        <div
                          key={p.id}
                          className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-xs font-mono flex items-center justify-between"
                        >
                          <div>
                            <div className="text-white font-bold">{formatPrice(p.amount)} (UTR: {p.utrRef || 'N/A'})</div>
                            <div className="text-[10px] text-slate-400">{p.requestedAt}</div>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                          }`}>
                            {p.status}
                          </span>
                        </div>
                      ))
                  )}
                </div>
              </div>

              {/* Section 3: Referrals Made by this User */}
              <div className="space-y-3 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                <h4 className="font-tech font-bold text-white text-sm flex items-center gap-2">
                  <Gift className="w-4 h-4 text-amber-400" />
                  <span>Friends Invited & Referral Earnings</span>
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {referrals.filter((r) => r.referrerId === dossierUser.id).length === 0 ? (
                    <div className="text-xs font-mono text-slate-500 text-center py-6">
                      This customer has not invited any friends yet.
                    </div>
                  ) : (
                    referrals
                      .filter((r) => r.referrerId === dossierUser.id)
                      .map((r) => (
                        <div
                          key={r.id}
                          className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-xs font-mono flex items-center justify-between"
                        >
                          <div>
                            <div className="text-white font-bold">@{r.referredUsername} ({r.referredEmail})</div>
                            <div className="text-[10px] text-slate-400">Joined: {r.createdAt}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-amber-400 font-bold">+{formatPrice(r.totalCommissionEarned || 0)}</div>
                            <div className="text-[10px] text-slate-400">Friend Deposited: {formatPrice(r.totalDepositedByFriend || 0)}</div>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>

              {/* Section 4: Card Acquisitions / Orders */}
              <div className="space-y-3 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                <h4 className="font-tech font-bold text-white text-sm flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-indigo-400" />
                  <span>Purchased 3D Cards</span>
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {orders.filter((o) => o.userId === dossierUser.id).length === 0 ? (
                    <div className="text-xs font-mono text-slate-500 text-center py-6">
                      No card purchases made yet.
                    </div>
                  ) : (
                    orders
                      .filter((o) => o.userId === dossierUser.id)
                      .map((o) => (
                        <div
                          key={o.id}
                          className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-xs font-mono flex items-center justify-between"
                        >
                          <div>
                            <div className="text-white font-bold">{o.cardName}</div>
                            <div className="text-[10px] text-slate-400">{o.purchaseDate || o.createdAt} • {o.cardTier}</div>
                          </div>
                          <div className="text-emerald-400 font-bold">{formatPrice(o.finalPrice)}</div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: WALLET CREDIT / DEBIT ADJUSTMENT
      ======================================================== */}
      {walletTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl border border-white/20 bg-[#090a10] p-6 shadow-2xl text-slate-100 space-y-4">
            <button
              onClick={() => {
                setWalletTargetUser(null);
                setWalletActionFeedback(null);
              }}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 font-mono text-[10px] font-bold">
                <WalletIcon className="w-3.5 h-3.5 text-blue-400" />
                <span>ADMIN WALLET ADJUSTMENT</span>
              </div>
              <h3 className="text-lg font-tech font-bold text-white">
                Adjust Wallet: @{walletTargetUser.username}
              </h3>
              <p className="text-xs font-mono text-slate-400">
                Current Customer Balance: <strong className="text-emerald-400">{formatPrice(wallets[walletTargetUser.id]?.balance || 0)}</strong>
              </p>
            </div>

            {walletActionFeedback && (
              <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/40 text-purple-300 text-xs font-mono">
                {walletActionFeedback}
              </div>
            )}

            <div className="space-y-3">
              {/* Action Toggle */}
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-white/5 border border-white/10">
                <button
                  type="button"
                  onClick={() => setCreditActionType('ADD')}
                  className={`py-2 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                    creditActionType === 'ADD'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  + Credit (Add ₹)
                </button>
                <button
                  type="button"
                  onClick={() => setCreditActionType('REMOVE')}
                  className={`py-2 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                    creditActionType === 'REMOVE'
                      ? 'bg-rose-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  - Debit (Remove ₹)
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-300 uppercase mb-1">
                  Amount in INR (₹)
                </label>
                <input
                  type="number"
                  min={1}
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(e.target.value)}
                  placeholder="500"
                  className="w-full rounded-xl border border-white/10 bg-black/60 px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-purple-500/60"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-300 uppercase mb-1">
                  Adjustment Reason
                </label>
                <input
                  type="text"
                  value={creditReason}
                  onChange={(e) => setCreditReason(e.target.value)}
                  placeholder="e.g. Compensation, Promotional top-up, Manual correction"
                  className="w-full rounded-xl border border-white/10 bg-black/60 px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-purple-500/60"
                />
              </div>

              <button
                type="button"
                onClick={handleExecuteWalletAction}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold transition-all cursor-pointer shadow-lg shadow-purple-600/30 mt-2"
              >
                Confirm {creditActionType === 'ADD' ? 'Credit' : 'Debit'} to User Wallet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: PAYMENT REJECTION REASON
      ======================================================== */}
      {showRejectModal && selectedPaymentRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl border border-white/20 bg-[#090a10] p-6 shadow-2xl text-slate-100 space-y-4">
            <h3 className="text-lg font-tech font-bold text-white">
              Reject Deposit Request ({selectedPaymentRequest.id})
            </h3>
            <p className="text-xs font-mono text-slate-400">
              Please specify the reason for rejecting @{selectedPaymentRequest.username}&apos;s payment of {formatPrice(selectedPaymentRequest.amount)}.
            </p>

            <div>
              <label className="block text-[11px] font-mono text-slate-300 uppercase mb-1">
                Rejection Reason
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {[
                  'Payment not received in bank ledger',
                  'Invalid or duplicate UTR number',
                  'Amount mismatch with bank deposit',
                  'Unverified transaction screenshot',
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setRejectionReasonInput(preset)}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-white/10 text-[10px] font-mono cursor-pointer transition-colors"
                  >
                    {preset}
                  </button>
                ))}
              </div>
              <textarea
                value={rejectionReasonInput}
                onChange={(e) => setRejectionReasonInput(e.target.value)}
                rows={3}
                placeholder="Enter specific rejection reason..."
                className="w-full rounded-xl border border-white/10 bg-black/60 p-3 text-xs font-mono text-white focus:outline-none focus:border-rose-500/60"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  rejectPaymentRequest(selectedPaymentRequest.id, rejectionReasonInput);
                  setShowRejectModal(false);
                  setSelectedPaymentRequest(null);
                  playSound('click', soundEnabled);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold cursor-pointer"
              >
                Confirm Rejection
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedPaymentRequest(null);
                }}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white font-mono text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: USER DELETION CONFIRMATION
      ======================================================== */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl border border-rose-500/30 bg-[#090a10] p-6 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-950/60 text-rose-400 border border-rose-500/40">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-tech font-bold text-white">Delete Customer Account?</h3>
                <p className="text-xs font-mono text-slate-400">This action will remove the account and its records.</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-black/60 border border-white/10 font-mono text-xs text-slate-300 space-y-1">
              <div>Customer: <strong className="text-white">@{userToDelete.username}</strong> ({userToDelete.fullName || 'No Full Name'})</div>
              <div>Email: <strong className="text-white">{userToDelete.email}</strong></div>
              <div>Wallet Balance: <strong className="text-emerald-400">{formatPrice(wallets[userToDelete.id]?.balance || 0)}</strong></div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  deleteUser(userToDelete.id);
                  setUserToDelete(null);
                  playSound('click', soundEnabled);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold cursor-pointer"
              >
                Yes, Purge Customer Account
              </button>
              <button
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white font-mono text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: CARD PRODUCT ADD / EDIT ENGINE
      ======================================================== */}
      <AdminCardCreatorModal
        isOpen={isCardModalOpen}
        onClose={() => {
          setIsCardModalOpen(false);
          setEditingCard(null);
        }}
        initialCard={editingCard}
        onSaveCard={(cardData, cardIdToUpdate) => {
          if (cardIdToUpdate) {
            updateCard(cardIdToUpdate, cardData);
          } else {
            addCard(cardData);
          }
          setIsCardModalOpen(false);
          setEditingCard(null);
        }}
        soundEnabled={soundEnabled}
      />

      {/* ========================================================
          MODAL: COUPON ADD / EDIT
      ======================================================== */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl border border-white/20 bg-[#090a10] p-6 shadow-2xl text-slate-100 space-y-4">
            <button
              onClick={() => setIsCouponModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-tech font-bold text-white">Create Promo Coupon</h3>

            <div>
              <label className="block text-[11px] font-mono text-slate-300 uppercase mb-1">Coupon Code</label>
              <input
                type="text"
                value={couponFormData.code || ''}
                onChange={(e) => setCouponFormData({ ...couponFormData, code: e.target.value.toUpperCase() })}
                placeholder="e.g. RAWAT50"
                className="w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-xs font-mono text-white uppercase"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-slate-300 uppercase mb-1">Discount Type</label>
                <select
                  value={couponFormData.discountType || 'percentage'}
                  onChange={(e) => setCouponFormData({ ...couponFormData, discountType: e.target.value as any })}
                  className="w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-xs font-mono text-white"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="flat">Flat (₹)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-300 uppercase mb-1">Discount Value</label>
                <input
                  type="number"
                  value={couponFormData.discountValue || 0}
                  onChange={(e) => setCouponFormData({ ...couponFormData, discountValue: parseFloat(e.target.value) || 0 })}
                  className="w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-xs font-mono text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-300 uppercase mb-1">Description</label>
              <input
                type="text"
                value={couponFormData.description || ''}
                onChange={(e) => setCouponFormData({ ...couponFormData, description: e.target.value })}
                placeholder="e.g. 20% discount on all RAWAT cards"
                className="w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-xs font-mono text-white"
              />
            </div>

            <button
              onClick={() => {
                if (editingCoupon) {
                  updateCoupon(editingCoupon.id, couponFormData);
                } else {
                  addCoupon(couponFormData as any);
                }
                setIsCouponModalOpen(false);
                playSound('success', soundEnabled);
              }}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold cursor-pointer"
            >
              Save Coupon
            </button>
          </div>
        </div>
      )}

      {/* Admin 3D Holographic Laboratory & Inspector Modal */}
      {selectedHoloCard && (
        <AdminHologramStudioModal
          isOpen={isHoloStudioOpen}
          card={selectedHoloCard}
          onClose={() => {
            setIsHoloStudioOpen(false);
            setSelectedHoloCard(null);
          }}
          onSaveOverlay={async (newOverlay) => {
            await updateCard(selectedHoloCard.id, { holographicOverlay: newOverlay });
            setActiveCardOverlays((prev) => ({
              ...prev,
              [selectedHoloCard.id]: newOverlay,
            }));
            setIsHoloStudioOpen(false);
            setSelectedHoloCard(null);
          }}
        />
      )}
    </div>
  );
};
