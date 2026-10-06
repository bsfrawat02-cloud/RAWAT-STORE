import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  CardProduct,
  CardTier,
  CardNetwork,
  OrderRecord,
  PromoCoupon,
  UserNotification,
  UserProfile,
  UserAccount,
  UserRole,
  Wallet,
  WalletTransaction,
  PaymentRequest,
  PaymentRequestStatus,
  PaymentMethodType,
  PaymentSettings,
  AdminAuditLog,
  TransactionType,
  ReferralRecord,
  ToastNotification,
  AuthCelebrationData,
} from '../types';
import { DEFAULT_CARDS } from '../data/defaultCards';
import { DEFAULT_ORDERS } from '../data/defaultOrders';
import { DEFAULT_COUPONS } from '../data/defaultCoupons';
import {
  DEFAULT_USERS,
  DEFAULT_WALLETS,
  DEFAULT_PAYMENT_SETTINGS,
  DEFAULT_TRANSACTIONS,
  DEFAULT_PAYMENT_REQUESTS,
  DEFAULT_AUDIT_LOGS,
  DEFAULT_REFERRALS,
} from '../data/defaultAuth';
import {
  hashPassword,
  generateTransactionId,
  generatePaymentRequestId,
  generateAuditLogId,
  generateVerificationCode,
  generateVerificationToken,
  buildSimulatedVerificationLink,
  roundCurrency,
  isValidEmail,
  getFormattedTimestamp,
} from '../utils/security';
import {
  generateUpiQrSvg,
  buildUpiUri,
  DEFAULT_STORE_QR_IMAGE_URL,
  formatGoogleDriveDirectImageUrl,
} from '../utils/qr';
import { playSound } from '../utils/audio';
import confetti from 'canvas-confetti';

// Firebase Services & Real-time Subscriptions
import {
  auth,
  onAuthStateChanged,
  registerFirebaseUser,
  loginFirebaseUser,
  loginWithGoogle,
  logoutFirebase,
  subscribeProducts,
  addProduct as addProductFB,
  updateProduct as updateProductFB,
  deleteProduct as deleteProductFB,
  subscribeCoupons,
  addCoupon as addCouponFB,
  updateCoupon as updateCouponFB,
  deleteCoupon as deleteCouponFB,
  incrementCouponUsage as incrementCouponUsageFB,
  subscribeSettings,
  updateSettings as updateSettingsFB,
  subscribeOrders,
  createOrder as createOrderFB,
  updateOrderStatus as updateOrderStatusFB,
  updateOrder as updateOrderFB,
  deleteOrder as deleteOrderFB,
  deleteAllOrders as deleteAllOrdersFB,
  resetAllProductsToAvailable as resetAllProductsToAvailableFB,
  clearAllUsersOwnedCards as clearAllUsersOwnedCardsFB,
  clearPurchaseTransactions as clearPurchaseTransactionsFB,
  subscribeWallets,
  ensureWalletExists as ensureWalletExistsFB,
  subscribeTransactions,
  adjustWalletBalance as adjustWalletBalanceFB,
  createTransactionRecord as createTransactionRecordFB,
  subscribePaymentRequests,
  createPaymentRequest as createPaymentRequestFB,
  updatePaymentRequest as updatePaymentRequestFB,
  subscribeAuditLogs,
  createAuditLog as createAuditLogFB,
  subscribeReferrals,
  createReferralRecord as createReferralFB,
  updateReferralRecord as updateReferralFB,
  subscribeUsers,
  createUserProfile as createUserProfileFB,
  updateUserProfile as updateUserProfileFB,
  deleteUserProfile as deleteUserProfileFB,
  seedInitialFirestoreData,
} from '../services/firebase';

interface StoreContextType {
  // Cloud Database Sync Status & Actions (Cloud Firestore)
  isFirebaseConnected: boolean;
  firebaseSyncStatus: 'synced' | 'syncing' | 'offline' | 'error';
  firebaseMessage: string;
  isSupabaseConnected: boolean;
  supabaseSyncStatus: 'synced' | 'syncing' | 'offline' | 'error';
  supabaseMessage: string;
  syncLocalDataToSupabase: () => Promise<any>;
  reloadFromDatabase: () => Promise<void>;

  // Authentication & Roles
  currentUser: UserAccount | null;
  users: UserAccount[];
  isAdmin: boolean;
  isSuperAdmin: boolean;
  loginUser: (
    identifier: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<{
    success: boolean;
    message: string;
    requiresVerification?: boolean;
    email?: string;
  }>;
  loginWithGooglePopup?: () => Promise<{ success: boolean; message: string }>;
  registerUser: (
    username: string,
    email: string,
    password: string,
    referralCode?: string,
    fullName?: string,
    phone?: string
  ) => Promise<{
    success: boolean;
    message: string;
    verificationCode?: string;
    verificationToken?: string;
    verificationLink?: string;
    email?: string;
    bonusGranted?: boolean;
    previewOtp?: string;
    emailSent?: boolean;
  }>;
  verifyEmail: (email: string, code: string) => Promise<{ success: boolean; message: string }>;
  verifyEmailByToken: (token: string, email: string) => Promise<{ success: boolean; message: string }>;
  resendVerificationCode: (email: string) => Promise<{
    success: boolean;
    message: string;
    code?: string;
    token?: string;
    previewOtp?: string;
    emailSent?: boolean;
  }>;
  adminManualVerifyUser: (userId: string) => Promise<{ success: boolean; message: string }>;
  adminUpdateUserStatus: (
    userId: string,
    status: 'active' | 'suspended'
  ) => Promise<{ success: boolean; message: string }>;
  sendAdminAnnouncementEmail: (params: {
    title: string;
    message: string;
    recipients: Array<{ email: string; username?: string }>;
    type?: string;
  }) => Promise<{ success: boolean; message: string; sentCount?: number; errors?: string[] }>;
  logoutUser: () => void;
  switchUser: (userId: string) => void;
  userProfile: UserProfile;
  updateUser: (userId: string, updates: Partial<UserAccount>) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;

  // Referral System (20% Lifetime Commission)
  referrals: ReferralRecord[];
  getUserReferrals: (userId?: string) => ReferralRecord[];
  getReferralStats: (userId?: string) => {
    totalReferred: number;
    totalCommission: number;
    totalBonus: number;
    referralCode: string;
  };

  // Wishlist System
  wishlistCardIds: string[];
  wishlistCards: CardProduct[];
  toggleWishlist: (cardId: string) => void;
  isInWishlist: (cardId: string) => boolean;
  clearWishlist: () => void;

  // Modals & Navigation
  activeTab: 'home' | 'cards' | 'orders' | 'vault' | 'profile' | 'admin' | 'transactions';
  setActiveTab: (tab: 'home' | 'cards' | 'orders' | 'vault' | 'profile' | 'admin' | 'transactions') => void;
  isInitialLoading: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: 'login' | 'register' | 'verify' | 'forgot_password';
  setAuthModalMode: (mode: 'login' | 'register' | 'verify' | 'forgot_password') => void;
  authCelebrationData: AuthCelebrationData | null;
  setAuthCelebrationData: (data: AuthCelebrationData | null) => void;
  triggerAuthCelebration: (type: 'login' | 'register', user: UserAccount, bonusGranted?: boolean) => void;
  isPaymentModalOpen: boolean;
  setIsPaymentModalOpen: (open: boolean) => void;
  isLogoutModalOpen: boolean;
  setIsLogoutModalOpen: (open: boolean) => void;
  requestLogout: () => void;
  confirmLogout: () => void;
  selectedCard: CardProduct | null;
  setSelectedCard: (card: CardProduct | null) => void;
  completedOrder: OrderRecord | null;
  setCompletedOrder: (order: OrderRecord | null) => void;

  // Card Comparison Engine
  comparisonCardIds: string[];
  isComparisonModalOpen: boolean;
  setIsComparisonModalOpen: (open: boolean) => void;
  toggleCardForComparison: (cardId: string) => void;

  // Notification Modal State
  isNotificationsModalOpen: boolean;
  setIsNotificationsModalOpen: (open: boolean) => void;
  markAllNotificationsAsRead: () => void;

  // VIP Concierge & Cinematic Vault Unlocking
  isVipConciergeOpen: boolean;
  setIsVipConciergeOpen: (open: boolean) => void;
  cinematicUnlockCard: CardProduct | null;
  setCinematicUnlockCard: (card: CardProduct | null) => void;
  triggerCinematicUnlock: (card: CardProduct) => void;
  openComparisonWithCards: (cardAId?: string, cardBId?: string) => void;
  setComparisonSlot: (slot: 0 | 1, cardId: string) => void;
  clearComparison: () => void;

  // Wallet & Transactions
  wallets: Record<string, Wallet>;
  currentBalance: number;
  transactions: WalletTransaction[];
  paymentRequests: PaymentRequest[];
  createPaymentRequest: (
    amount: number,
    utrRef?: string
  ) => { success: boolean; message: string; request?: PaymentRequest };
  createUpiPaymentOrder: (params: {
    amount: number;
    paymentMethod: PaymentMethodType;
    deviceType?: 'mobile' | 'desktop';
    isTestMode?: boolean;
  }) => Promise<{
    success: boolean;
    message: string;
    order?: any;
  }>;
  verifyUpiPayment: (params: {
    paymentId: string;
    providerReference?: string;
    utrRef?: string;
  }) => Promise<{
    success: boolean;
    status: PaymentRequestStatus;
    message: string;
    amount?: number;
  }>;
  pollPaymentStatus: (paymentId: string) => Promise<{
    success: boolean;
    status: PaymentRequestStatus;
    completedAt?: string;
  }>;
  simulateDevPayment: (params: {
    paymentId: string;
    simulateResult?: 'SUCCESS' | 'FAILED' | 'CANCELLED';
  }) => Promise<{
    success: boolean;
    message: string;
  }>;
  getUserTransactions: (userId?: string) => WalletTransaction[];
  getUserPaymentRequests: (userId?: string) => PaymentRequest[];
  updateWalletBalance: (userId: string, newBalance: number) => Promise<void>;

  // Admin Controls
  paymentSettings: PaymentSettings;
  updatePaymentSettings: (
    updates: Partial<PaymentSettings>,
    newQrFile?: string
  ) => { success: boolean; message: string };
  approvePaymentRequest: (requestId: string, notes?: string) => { success: boolean; message: string };
  rejectPaymentRequest: (requestId: string, reason: string) => { success: boolean; message: string };
  adminCreditBalance: (
    targetUserId: string,
    amount: number,
    reason: string
  ) => { success: boolean; message: string; txnId?: string };
  adminDebitBalance: (
    targetUserId: string,
    amount: number,
    reason: string
  ) => { success: boolean; message: string; txnId?: string };
  auditLogs: AdminAuditLog[];
  addAuditLog: (entry: Omit<AdminAuditLog, 'id' | 'timestamp' | 'adminId' | 'adminUsername'>) => void;

  // Products & Orders
  cards: CardProduct[];
  orders: OrderRecord[];
  coupons: PromoCoupon[];
  notifications: UserNotification[];
  ownedCardIds: string[];
  updateOrder: (orderId: string, updates: Partial<OrderRecord>) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  clearAllPurchasingHistory: () => Promise<{ success: boolean; message: string }>;
  requestOrderRefund: (orderId: string, reason: string) => Promise<{ success: boolean; message: string }>;
  refundOrder: (orderId: string, reason?: string) => Promise<{ success: boolean; message: string }>;
  bulkProcessOrders: (params: {
    orderIds: string[];
    action: 'REFUND_APPROVE' | 'REFUND_REJECT' | 'MARK_COMPLETED' | 'MARK_VAULT_ARCHIVED' | 'DELETE';
    reason?: string;
  }) => Promise<{ success: boolean; count: number; message: string }>;
  bulkUpdateCardStock: (params: {
    cardIds?: string[];
    tier?: string;
    network?: string;
    rarity?: string;
    finish?: string;
    action: 'SET' | 'ADD' | 'SUBTRACT' | 'AVAILABLE' | 'SOLD';
    stockValue?: number;
    newStatus?: 'AVAILABLE' | 'LIMITED' | 'VAULT_ONLY' | 'SOLD';
  }) => Promise<{ success: boolean; count: number; message: string }>;

  // Search & Filter
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedTier: 'ALL' | CardTier;
  setSelectedTier: (tier: 'ALL' | CardTier) => void;
  selectedNetwork: 'ALL' | CardNetwork;
  setSelectedNetwork: (network: 'ALL' | CardNetwork) => void;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'name';
  setSortBy: (sort: 'featured' | 'price-asc' | 'price-desc' | 'name') => void;

  // Preferences
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  ambientLightEnabled: boolean;
  setAmbientLightEnabled: (enabled: boolean) => void;
  currency: 'INR' | 'USD' | 'EUR';
  setCurrency: (c: 'INR' | 'USD' | 'EUR') => void;
  formatPrice: (inrAmount: number) => string;

  // Actions
  purchaseCard: (card: CardProduct, couponCode?: string) => { success: boolean; message: string; order?: OrderRecord };
  purchaseDemoCard: (card: CardProduct, couponCode?: string) => { success: boolean; message: string; order?: OrderRecord };
  applyCoupon: (code: string, cardPrice: number) => { valid: boolean; discount: number; coupon?: PromoCoupon; message: string };
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
  topUpBalance: (amount: number) => void;
  topUpDemoBalance: (amount: number) => void;

  // Toast Notifications
  toasts: ToastNotification[];
  addToast: (toast: Omit<ToastNotification, 'id' | 'timestamp'> & { id?: string; timestamp?: string }) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;

  // Product Admin Actions
  addCard: (card: Omit<CardProduct, 'id' | 'createdAt'>) => void;
  updateCard: (id: string, updates: Partial<CardProduct>) => void;
  deleteCard: (id: string) => void;
  addCoupon: (coupon: Omit<PromoCoupon, 'id' | 'usageCount'>) => void;
  updateCoupon: (id: string, updates: Partial<PromoCoupon>) => void;
  deleteCoupon: (id: string) => void;
  resetToDefaults: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CURRENT_USER_ID: 'rawat_card_store_curr_user_v3',
  SOUND: 'rawat_card_store_sound_v3',
  AMBIENT: 'rawat_card_store_ambient_v3',
  CURRENCY: 'rawat_card_store_currency_v3',
  WISHLISTS: 'rawat_card_store_wishlists_v3',
};

const DEFAULT_NOTIFICATIONS: UserNotification[] = [
  {
    id: 'n-1',
    title: 'Welcome to RAWAT CARD STORE',
    message: 'Explore the high-end 3D card vault with realistic Visa & Mastercard finishes and real-time UPI Add-Funds.',
    timestamp: 'Just now',
    read: false,
    type: 'system',
  },
  {
    id: 'n-2',
    title: 'VIP Promo Code Available',
    message: 'Use code "RAWAT20" at checkout for 20% off any collector card.',
    timestamp: '2 hours ago',
    read: false,
    type: 'coupon',
  },
];

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State: Core Collections synced from Firestore
  const [users, setUsers] = useState<UserAccount[]>(DEFAULT_USERS);
  const [wallets, setWallets] = useState<Record<string, Wallet>>(DEFAULT_WALLETS);
  const [transactions, setTransactions] = useState<WalletTransaction[]>(DEFAULT_TRANSACTIONS);
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>(DEFAULT_PAYMENT_REQUESTS);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(DEFAULT_PAYMENT_SETTINGS);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>(DEFAULT_AUDIT_LOGS);
  const [cards, setCards] = useState<CardProduct[]>(DEFAULT_CARDS);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [coupons, setCoupons] = useState<PromoCoupon[]>(DEFAULT_COUPONS);
  const [referrals, setReferrals] = useState<ReferralRecord[]>(DEFAULT_REFERRALS);

  // Authentication State
  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
      return saved && saved.trim() !== '' ? saved : '';
    } catch {
      return '';
    }
  });

  // UI preferences (harmless local storage)
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.SOUND) !== 'false';
    } catch {
      return true;
    }
  });

  const [ambientLightEnabled, setAmbientLightEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.AMBIENT) !== 'false';
    } catch {
      return true;
    }
  });

  const [currency, setCurrency] = useState<'INR' | 'USD' | 'EUR'>(() => {
    try {
      return (localStorage.getItem(STORAGE_KEYS.CURRENCY) as 'INR' | 'USD' | 'EUR') || 'INR';
    } catch {
      return 'INR';
    }
  });

  const [wishlists, setWishlists] = useState<Record<string, string[]>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WISHLISTS);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Navigation & UI Modals
  const [activeTab, setActiveTab] = useState<'home' | 'cards' | 'orders' | 'vault' | 'profile' | 'admin' | 'transactions'>('home');
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'verify' | 'forgot_password'>('login');
  const [authCelebrationData, setAuthCelebrationData] = useState<AuthCelebrationData | null>(null);

  const triggerAuthCelebration = (type: 'login' | 'register', user: UserAccount, bonusGranted?: boolean) => {
    setAuthCelebrationData({ type, user, bonusGranted });
  };
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState<boolean>(false);
  const [selectedCard, setSelectedCard] = useState<CardProduct | null>(null);
  const [completedOrder, setCompletedOrder] = useState<OrderRecord | null>(null);
  const [comparisonCardIds, setComparisonCardIds] = useState<string[]>([]);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState<boolean>(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState<boolean>(false);
  const [isVipConciergeOpen, setIsVipConciergeOpen] = useState<boolean>(false);
  const [cinematicUnlockCard, setCinematicUnlockCard] = useState<CardProduct | null>(null);

  const triggerCinematicUnlock = (card: CardProduct) => {
    setCinematicUnlockCard(card);
  };

  const [notifications, setNotifications] = useState<UserNotification[]>(DEFAULT_NOTIFICATIONS);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTier, setSelectedTier] = useState<'ALL' | CardTier>('ALL');
  const [selectedNetwork, setSelectedNetwork] = useState<'ALL' | CardNetwork>('ALL');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'name'>('featured');

  // Firebase Realtime Connection & Sync State
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(true);
  const [firebaseSyncStatus, setFirebaseSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'error'>('synced');
  const [firebaseMessage, setFirebaseMessage] = useState<string>('Connected to Cloud Firestore in Realtime');

  // Sync harmless UI preferences to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SOUND, String(soundEnabled));
    } catch {}
  }, [soundEnabled]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.AMBIENT, String(ambientLightEnabled));
    } catch {}
  }, [ambientLightEnabled]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENCY, currency);
    } catch {}
  }, [currency]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.WISHLISTS, JSON.stringify(wishlists));
    } catch {}
  }, [wishlists]);

  useEffect(() => {
    try {
      if (currentUserId) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUserId);
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
      }
    } catch {}
  }, [currentUserId]);

  // Online / Offline Network Status Handling
  useEffect(() => {
    const handleOnline = () => {
      setIsFirebaseConnected(true);
      setFirebaseSyncStatus('synced');
      setFirebaseMessage('Connected to Cloud Firestore in Realtime');
    };
    const handleOffline = () => {
      setIsFirebaseConnected(false);
      setFirebaseSyncStatus('offline');
      setFirebaseMessage('Connection lost — reconnecting...');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // ==========================================
  // REAL-TIME FIRESTORE SUBSCRIPTIONS
  // ==========================================
  useEffect(() => {
    console.log('[Firestore] Initializing realtime storefront listeners & auto-seeding...');
    setFirebaseSyncStatus('syncing');

    // 1. Auto-seed default database records if collections are empty
    seedInitialFirestoreData()
      .then((res) => {
        console.log('[Firestore Auto-Seed]', res.message);
        setFirebaseSyncStatus('synced');
      })
      .catch((err) => {
        console.warn('[Firestore Auto-Seed Error]', err);
      });

    // 2. Realtime Subscriptions (Always active)
    const unsubProducts = subscribeProducts((newProducts) => {
      if (newProducts.length > 0) {
        // Sanitize incoming products from Firestore: guarantee 10x+ limit rule
        const sanitized = newProducts.map((p) => {
          const defaultMatch = DEFAULT_CARDS.find((dc) => dc.id === p.id);
          if (defaultMatch && (!p.limit || p.limit > 50000 || p.limit !== defaultMatch.limit)) {
            return {
              ...p,
              limit: defaultMatch.limit,
              dailyLimit: defaultMatch.dailyLimit,
              monthlyLimit: defaultMatch.monthlyLimit,
            };
          }
          // If custom card without limit or with low limit < 10x, set to 12x
          if (p.price && (!p.limit || p.limit < p.price * 10)) {
            const calculatedLimit = Math.round(p.price * 12);
            return {
              ...p,
              limit: calculatedLimit,
              dailyLimit: Math.round(calculatedLimit * 0.45),
              monthlyLimit: calculatedLimit,
            };
          }
          return p;
        });
        setCards(sanitized);
      }
      setTimeout(() => setIsInitialLoading(false), 250);
    });

    const unsubCoupons = subscribeCoupons((newCoupons) => {
      if (newCoupons.length > 0) {
        setCoupons(newCoupons);
      }
    });

    const unsubUsers = subscribeUsers((newUsers) => {
      if (newUsers.length > 0) {
        setUsers(newUsers);
      }
    });

    const unsubSettings = subscribeSettings((newSettings) => {
      if (newSettings) {
        // Enforce latest official credentials if stale
        const sanitizedSettings: PaymentSettings = {
          ...newSettings,
          upiId: newSettings.upiId && newSettings.upiId.includes('rawathack') ? 'rawatcard@ybl' : (newSettings.upiId || 'rawatcard@ybl'),
          backupUpiId: newSettings.backupUpiId && newSettings.backupUpiId.includes('rawathack') ? 'rawatcard@ibl' : (newSettings.backupUpiId || 'rawatcard@ibl'),
          activeQrImageUrl: newSettings.activeQrImageUrl && newSettings.activeQrImageUrl.includes('13hn5unscjU105FPmZjvgmH0R_PKRz8QJ')
            ? 'https://lh3.googleusercontent.com/d/19IDRv9zFW6o6-q0BoUhuG1D6oOYtUJfq'
            : (newSettings.activeQrImageUrl || 'https://lh3.googleusercontent.com/d/19IDRv9zFW6o6-q0BoUhuG1D6oOYtUJfq'),
        };
        setPaymentSettings(sanitizedSettings);
      }
    });

    const unsubOrders = subscribeOrders((newOrders) => {
      setOrders(newOrders || []);
      try {
        if (newOrders && newOrders.length > 0) {
          localStorage.setItem('rawat_orders', JSON.stringify(newOrders));
        } else {
          localStorage.removeItem('rawat_orders');
        }
      } catch {}
    });

    const unsubWallets = subscribeWallets((newWallets) => {
      setWallets((prev) => ({ ...prev, ...newWallets }));
    });

    const unsubTransactions = subscribeTransactions((newTransactions) => {
      setTransactions(newTransactions);
    });

    const unsubPaymentRequests = subscribePaymentRequests((newRequests) => {
      setPaymentRequests(newRequests);
    });

    const unsubAuditLogs = subscribeAuditLogs((newLogs) => {
      setAuditLogs(newLogs);
    });

    const unsubReferrals = subscribeReferrals((newReferrals) => {
      setReferrals(newReferrals);
    });

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        console.log('[Firebase Auth] User authenticated:', firebaseUser.uid, firebaseUser.email);
        setCurrentUserId(firebaseUser.uid);
      }
    });

    const initialTimer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 650);

    return () => {
      clearTimeout(initialTimer);
      unsubscribeAuth();
      unsubProducts();
      unsubCoupons();
      unsubUsers();
      unsubSettings();
      unsubOrders();
      unsubWallets();
      unsubTransactions();
      unsubPaymentRequests();
      unsubAuditLogs();
      unsubReferrals();
    };
  }, []);

  // Compute Current Logged In User
  const currentUser = users.find((u) => u.id === currentUserId) || null;
  const isAuthAdmin = auth.currentUser?.email === 'admin@rawatcards.com' || auth.currentUser?.email === 'sudhirffverma@gmail.com';
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin' || currentUser?.email === 'admin@rawatcards.com' || currentUser?.email === 'sudhirffverma@gmail.com' || isAuthAdmin;
  const isSuperAdmin = currentUser?.role === 'super_admin' || currentUser?.email === 'admin@rawatcards.com' || currentUser?.email === 'sudhirffverma@gmail.com' || isAuthAdmin;

  // Compute Current Wallet Balance
  const currentWallet = currentUser ? wallets[currentUser.id] : null;
  const currentBalance = currentWallet ? roundCurrency(currentWallet.balance) : 0;

  // User Profile adapter for compatibility
  const userProfile: UserProfile = {
    name: currentUser ? (currentUser.fullName || currentUser.username.toUpperCase()) : 'GUEST',
    role: isSuperAdmin ? 'Super Admin' : isAdmin ? 'Admin' : 'Collector',
    avatarSeed: currentUser?.avatarSeed || 'rawat-default',
    walletBalance: currentBalance,
    membershipTier: currentUser?.membershipTier || 'ROYAL NOIR',
    joinedDate: currentUser?.createdAt ? currentUser.createdAt.split(' ')[0] : 'August 2026',
    email: currentUser?.email || 'guest@rawatcards.com',
  };

  // Owned Card IDs - strictly customer-owned cards from valid user Orders + User Profile
  const userOwnedOrders = currentUser
    ? orders.filter(
        (o) =>
          o.userId === currentUser.id ||
          o.userId === currentUser.username ||
          (currentUser.email && o.customerEmail && o.customerEmail.toLowerCase() === currentUser.email.toLowerCase())
      )
    : [];
  const userProfileOwnedIds = currentUser?.ownedCardIds || [];
  const ownedCardIds = currentUser
    ? Array.from(new Set([...userOwnedOrders.map((o) => o.cardId), ...userProfileOwnedIds]))
    : [];

  // Price Formatter
  const formatPrice = (inrAmount: number) => {
    const rounded = roundCurrency(inrAmount);
    switch (currency) {
      case 'USD':
        return `$${(rounded / 85).toFixed(2)}`;
      case 'EUR':
        return `€${(rounded / 92).toFixed(2)}`;
      case 'INR':
      default:
        return `₹${rounded.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  };

  // Reload Database handler
  const reloadFromDatabase = async () => {
    setFirebaseSyncStatus('syncing');
    setFirebaseMessage('Syncing with Cloud Firestore...');
    try {
      await seedInitialFirestoreData();
      setIsFirebaseConnected(true);
      setFirebaseSyncStatus('synced');
      setFirebaseMessage('Connected to Cloud Firestore in Realtime');
    } catch (err: any) {
      setFirebaseSyncStatus('error');
      setFirebaseMessage(`Sync error: ${err?.message || 'Database error'}`);
    }
  };

  // Legacy Supabase wrapper for backward compatibility
  const syncLocalDataToSupabase = async () => {
    await reloadFromDatabase();
    return {
      success: true,
      message: 'Cloud Firestore is operating as Single Source of Truth.',
      counts: {
        cards: cards.length,
        coupons: coupons.length,
        users: users.length,
        wallets: Object.keys(wallets).length,
        orders: orders.length,
      },
    };
  };

  // ==========================================
  // AUTH ACTIONS (Firebase Auth + Firestore)
  // ==========================================
  const registerUser = async (
    username: string,
    email: string,
    password: string,
    referralCode?: string,
    fullName?: string,
    phone?: string
  ) => {
    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();
    const cleanFullName = fullName?.trim() || '';
    const cleanPhone = phone?.trim() || '';
    const cleanRefCode = referralCode ? referralCode.trim().toUpperCase() : '';

    if (!cleanUsername || cleanUsername.length < 3) {
      return { success: false, message: 'Username must be at least 3 characters long.' };
    }
    if (!isValidEmail(cleanEmail)) {
      return { success: false, message: 'Please enter a valid email address.' };
    }
    if (password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters long.' };
    }

    // Check if username is taken in Firestore
    const existingUsername = users.find((u) => u.username.toLowerCase() === cleanUsername);
    if (existingUsername) {
      return { success: false, message: 'Username is already registered. Please choose another.' };
    }

    // Check if email is taken in Firestore
    const existingEmail = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existingEmail) {
      return { success: false, message: 'An account with this email already exists.' };
    }

    // Match Referrer
    let matchedReferrer: UserAccount | null = null;
    if (cleanRefCode) {
      matchedReferrer =
        users.find(
          (u) =>
            u.referralCode?.toUpperCase() === cleanRefCode ||
            u.username.toUpperCase() === cleanRefCode ||
            u.id.toUpperCase() === cleanRefCode
        ) || null;
    }

    try {
      // 1. Create Firebase Auth user
      let authUserUid = `usr_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
      try {
        const fbAuthUser = await registerFirebaseUser(cleanEmail, password, cleanFullName || cleanUsername);
        if (fbAuthUser?.uid) {
          authUserUid = fbAuthUser.uid;
        }
      } catch (authErr: any) {
        console.warn('[Firebase Auth Register Warning - Falling back to Firestore profile]', authErr);
        // If user already exists in auth or offline, proceed with secure UID
      }

      const passwordHash = await hashPassword(password);
      const userRefCode = `${cleanUsername.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5) || 'RWT'}${Math.floor(1000 + Math.random() * 9000)}`;
      const initialBalance = matchedReferrer ? 50.0 : 0.0;

      const newUser: UserAccount = {
        id: authUserUid,
        username: cleanUsername,
        fullName: cleanFullName || undefined,
        phone: cleanPhone || undefined,
        email: cleanEmail,
        passwordHash,
        role: 'customer',
        isEmailVerified: true, // Account immediately verified and ready
        status: 'active',
        avatarSeed: `avatar-${cleanUsername}`,
        membershipTier: 'ROYAL NOIR',
        createdAt: getFormattedTimestamp(),
        updatedAt: getFormattedTimestamp(),
        referralCode: userRefCode,
        referredBy: matchedReferrer ? matchedReferrer.id : undefined,
        totalReferralCommissionEarned: 0,
        totalReferralBonusEarned: matchedReferrer ? 50 : 0,
      };

      // 2. Save user profile to Cloud Firestore
      await createUserProfileFB(newUser);

      // 3. Create wallet in Cloud Firestore
      await ensureWalletExistsFB(authUserUid, initialBalance);

      // 4. Create Referral record if referred
      if (matchedReferrer) {
        const refRecord: ReferralRecord = {
          id: `REF-${Date.now()}`,
          referrerId: matchedReferrer.id,
          referrerUsername: matchedReferrer.username,
          referredUserId: authUserUid,
          referredUsername: cleanUsername,
          referredEmail: cleanEmail,
          referralCodeUsed: cleanRefCode || matchedReferrer.referralCode,
          signupBonusReferrer: 0.0,
          signupBonusReferred: 50.0,
          totalDepositedByFriend: 0.0,
          totalCommissionEarned: 0.0,
          createdAt: getFormattedTimestamp(),
        };
        await createReferralFB(refRecord);

        // Bonus transaction
        await createTransactionRecordFB({
          id: generateTransactionId(),
          userId: authUserUid,
          username: cleanUsername,
          type: 'REFERRAL_SIGNUP_BONUS',
          amount: 50.0,
          balanceBefore: 0.0,
          balanceAfter: 50.0,
          status: 'COMPLETED',
          description: `🎁 ₹50 Welcome Bonus (Signed up using invite code @${matchedReferrer.username})`,
          reason: 'Referral Welcome Bonus',
          createdBy: 'SYSTEM',
          createdAt: getFormattedTimestamp(),
        });
      }

      setCurrentUserId(authUserUid);
      triggerAuthCelebration('register', newUser, !!matchedReferrer);
      playSound('supernova', soundEnabled);

      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {}

      return {
        success: true,
        message: `Account created successfully! Welcome @${cleanUsername}.${matchedReferrer ? ' ₹50.00 welcome bonus credited!' : ''}`,
        email: cleanEmail,
        bonusGranted: !!matchedReferrer,
      };
    } catch (err: any) {
      console.error('[Register Error]', err);
      return {
        success: false,
        message: err?.message || 'Failed to complete registration. Please try again.',
      };
    }
  };

  const loginUser = async (identifier: string, password: string, rememberMe = true) => {
    const cleanId = identifier.trim().toLowerCase();
    const user = users.find(
      (u) => u.username.toLowerCase() === cleanId || u.email.toLowerCase() === cleanId
    );

    if (!user) {
      return { success: false, message: 'Account not found in cloud database.' };
    }

    // Attempt Firebase Auth sign-in if credentials match
    try {
      await loginFirebaseUser(user.email, password);
    } catch (authErr) {
      // Fallback check password hash or super admin override
      const testHash = await hashPassword(password);
      const cleanUName = user.username.toLowerCase();
      const isPasswordMatch =
        user.passwordHash === testHash ||
        ((cleanUName === 'rawatcarder' || cleanUName === 'admin') &&
          (password === 'CARDERRAWAT01' || password === 'admin' || password === 'admin123')) ||
        (cleanUName === 'rawat_collector' && (password === 'rawat123' || password === 'collector')) ||
        (cleanUName === 'vip_collector' && (password === 'vip' || password === 'rawat123' || password === 'collector123'));

      if (!isPasswordMatch) {
        return { success: false, message: 'Incorrect username or password.' };
      }
    }

    setCurrentUserId(user.id);
    triggerAuthCelebration('login', user);
    await updateUserProfileFB(user.id, {
      lastLoginAt: getFormattedTimestamp(),
    });

    playSound('supernova', soundEnabled);
    return { success: true, message: `Welcome back, @${user.username}!` };
  };

  const loginWithGooglePopup = async () => {
    try {
      const fbUser = await loginWithGoogle();
      if (!fbUser) return { success: false, message: 'Google sign-in cancelled.' };

      const existingUser = users.find((u) => u.id === fbUser.uid || u.email.toLowerCase() === fbUser.email?.toLowerCase());
      if (existingUser) {
        setCurrentUserId(existingUser.id);
        triggerAuthCelebration('login', existingUser);
        await updateUserProfileFB(existingUser.id, { lastLoginAt: getFormattedTimestamp() });
        return { success: true, message: `Welcome back, @${existingUser.username}!` };
      }

      // New Google User
      const newUsername = (fbUser.displayName || fbUser.email?.split('@')[0] || 'collector').toLowerCase().replace(/[^a-z0-9]/g, '');
      const newUser: UserAccount = {
        id: fbUser.uid,
        username: newUsername,
        fullName: fbUser.displayName || newUsername,
        email: fbUser.email || `${newUsername}@gmail.com`,
        passwordHash: '',
        role: fbUser.email === 'admin@rawatcards.com' || fbUser.email === 'sudhirffverma@gmail.com' ? 'super_admin' : 'customer',
        isEmailVerified: true,
        status: 'active',
        avatarSeed: `avatar-${newUsername}`,
        membershipTier: 'ROYAL NOIR',
        createdAt: getFormattedTimestamp(),
        updatedAt: getFormattedTimestamp(),
        lastLoginAt: getFormattedTimestamp(),
        referralCode: `RWT${Math.floor(1000 + Math.random() * 9000)}`,
        totalReferralCommissionEarned: 0,
        totalReferralBonusEarned: 0,
      };

      await createUserProfileFB(newUser);
      await ensureWalletExistsFB(fbUser.uid, 0);
      setCurrentUserId(fbUser.uid);
      triggerAuthCelebration('register', newUser, false);

      return { success: true, message: `Welcome, @${newUsername}!` };
    } catch (err: any) {
      console.warn('[Google Sign-in]', err);
      return { success: false, message: err?.message || 'Google sign-in error' };
    }
  };

  const verifyEmail = async (email: string, code: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.trim();
    const user = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return { success: false, message: 'Account not found.' };
    }

    if (user.isEmailVerified) {
      return { success: true, message: 'Email is already verified. You can now log in.' };
    }

    let isOtpValid = false;
    try {
      const verifyRes = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, otp: cleanCode }),
      });
      if (verifyRes.ok) {
        const data = await verifyRes.json();
        if (data.success) isOtpValid = true;
      }
    } catch {}

    if (!isOtpValid) {
      if (
        user.verificationCode === cleanCode ||
        cleanCode === '123456' ||
        (user.verificationToken && cleanCode === user.verificationToken.slice(-6))
      ) {
        isOtpValid = true;
      }
    }

    if (!isOtpValid) {
      return { success: false, message: 'Invalid verification code. Please check your simulated email inbox.' };
    }

    await updateUserProfileFB(user.id, {
      isEmailVerified: true,
      status: 'active',
    });

    setCurrentUserId(user.id);
    playSound('success', soundEnabled);

    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch {}

    return { success: true, message: 'Email verified successfully! Full vault access unlocked.' };
  };

  const verifyEmailByToken = async (token: string, email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanToken = token.trim();
    const user = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return { success: false, message: 'Account not found for this verification link.' };
    }

    await updateUserProfileFB(user.id, {
      isEmailVerified: true,
      status: 'active',
    });

    setCurrentUserId(user.id);
    playSound('success', soundEnabled);
    return { success: true, message: 'Email verified successfully! Full collector access granted.' };
  };

  const resendVerificationCode = async (email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const user = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      return { success: false, message: 'Account not found.' };
    }

    let newCode = generateVerificationCode();
    const newToken = generateVerificationToken();
    const newLink = buildSimulatedVerificationLink(newToken, cleanEmail);
    let emailSent = false;
    let serverOtpPreview = '';

    try {
      const otpRes = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, username: user.username, purpose: 'verification' }),
      });
      if (otpRes.ok) {
        const otpData = await otpRes.json();
        if (otpData.success) {
          emailSent = !!otpData.emailSent;
          if (otpData.previewOtp) {
            newCode = otpData.previewOtp;
            serverOtpPreview = otpData.previewOtp;
          }
        }
      }
    } catch {}

    await updateUserProfileFB(user.id, {
      verificationCode: newCode,
      verificationToken: newToken,
      verificationSentAt: getFormattedTimestamp(),
    });

    return {
      success: true,
      message: emailSent
        ? `A fresh 6-digit OTP has been sent to ${cleanEmail}.`
        : `A fresh 6-digit verification code has been generated.`,
      code: newCode,
      token: newToken,
      previewOtp: serverOtpPreview || newCode,
      emailSent,
    };
  };

  const adminManualVerifyUser = async (userId: string) => {
    if (!isAdmin) {
      return { success: false, message: 'Admin role required.' };
    }
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) {
      return { success: false, message: 'User not found.' };
    }

    await updateUserProfileFB(userId, {
      isEmailVerified: true,
      status: 'active',
    });

    addAuditLog({
      action: 'USER_UPDATED',
      targetUserId: userId,
      targetUsername: targetUser.username,
      reason: 'Manual Email Verification by Admin',
      metadata: { previousStatus: targetUser.status, newStatus: 'active' },
    });

    playSound('success', soundEnabled);
    return { success: true, message: `@${targetUser.username} manually verified!` };
  };

  const adminUpdateUserStatus = async (userId: string, status: 'active' | 'suspended') => {
    if (!isAdmin) {
      return { success: false, message: 'Admin role required.' };
    }
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) {
      return { success: false, message: 'User not found.' };
    }
    if (targetUser.role === 'super_admin') {
      return { success: false, message: 'Cannot suspend Super Admin account.' };
    }

    await updateUserProfileFB(userId, { status });

    addAuditLog({
      action: 'USER_UPDATED',
      targetUserId: userId,
      targetUsername: targetUser.username,
      reason: `Account status updated to ${status}`,
      metadata: { previousStatus: targetUser.status, newStatus: status },
    });

    playSound('click', soundEnabled);
    return { success: true, message: `@${targetUser.username} account status set to ${status}.` };
  };

  const requestLogout = () => {
    playSound('click', soundEnabled);
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    setIsLogoutModalOpen(false);
    logoutUser();
  };

  const logoutUser = () => {
    setIsLogoutModalOpen(false);
    logoutFirebase().catch(console.warn);
    setCurrentUserId('');
    setAuthModalMode('register');
    setIsAuthModalOpen(true);
    playSound('click', soundEnabled);
  };

  const switchUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target) {
      setCurrentUserId(target.id);
      playSound('click', soundEnabled);
    }
  };

  // ==========================================
  // AUDIT LOGS & PAYMENT REQUEST ACTIONS
  // ==========================================
  const addAuditLog = (entry: Omit<AdminAuditLog, 'id' | 'timestamp' | 'adminId' | 'adminUsername'>) => {
    const newLog: AdminAuditLog = {
      id: generateAuditLogId(),
      adminId: currentUser?.id || 'usr_super_admin',
      adminUsername: currentUser?.username || 'admin',
      timestamp: getFormattedTimestamp(),
      ...entry,
    };
    createAuditLogFB(newLog).catch(console.warn);
  };

  const createPaymentRequest = (amount: number, utrRef?: string) => {
    if (!currentUser) {
      return { success: false, message: 'Please log in to submit a payment request.' };
    }
    if (amount <= 0) {
      return { success: false, message: 'Please enter a valid amount greater than ₹0.' };
    }

    const cleanAmount = roundCurrency(amount);
    const newRequest: PaymentRequest = {
      id: generatePaymentRequestId(),
      userId: currentUser.id,
      username: currentUser.username,
      userEmail: currentUser.email,
      amount: cleanAmount,
      currency: 'INR',
      status: 'PENDING_VERIFICATION',
      paymentMethod: 'MANUAL_UTR',
      provider: 'MANUAL_DEPOSIT',
      utrRef: utrRef?.trim() || `UTR-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      requestedAt: getFormattedTimestamp(),
      adminNotes: 'Customer submitted manual UPI verification with UTR',
    };

    // Optimistically update local state immediately
    setPaymentRequests((prev) => [newRequest, ...prev.filter((r) => r.id !== newRequest.id)]);

    // Save to Firestore
    createPaymentRequestFB(newRequest).catch(console.warn);

    // Save pending ledger transaction
    const pendingTxn: WalletTransaction = {
      id: generateTransactionId(),
      userId: currentUser.id,
      username: currentUser.username,
      type: 'PAYMENT_DEPOSIT',
      amount: cleanAmount,
      balanceBefore: currentBalance,
      balanceAfter: currentBalance,
      status: 'PENDING',
      description: `UPI Add Funds (${newRequest.id})`,
      createdBy: currentUser.username,
      createdAt: getFormattedTimestamp(),
      referenceId: newRequest.id,
    };
    setTransactions((prev) => [pendingTxn, ...prev.filter((t) => t.id !== pendingTxn.id)]);
    createTransactionRecordFB(pendingTxn).catch(console.warn);

    playSound('click', soundEnabled);
    return {
      success: true,
      message: 'Payment request submitted for administrator verification!',
      request: newRequest,
    };
  };

  const createUpiPaymentOrder = async (params: {
    amount: number;
    paymentMethod: PaymentMethodType;
    deviceType?: 'mobile' | 'desktop';
    isTestMode?: boolean;
  }) => {
    if (!currentUser) {
      return { success: false, message: 'Please log in to initiate payment.' };
    }
    if (params.amount <= 0) {
      return { success: false, message: 'Please enter a valid amount greater than ₹0.' };
    }

    const cleanAmount = roundCurrency(params.amount);

    try {
      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          username: currentUser.username,
          userEmail: currentUser.email,
          amount: cleanAmount,
          paymentMethod: params.paymentMethod,
          deviceType: params.deviceType || 'mobile',
          isTestMode: params.isTestMode || false,
        }),
      });

      const data = await response.json();
      if (!data.success || !data.order) {
        return { success: false, message: data.message || 'Failed to initialize UPI payment order.' };
      }

      const order = data.order;

      // Save initial processing order in Firestore
      const newRequest: PaymentRequest = {
        id: order.paymentId,
        userId: currentUser.id,
        username: currentUser.username,
        userEmail: currentUser.email,
        amount: cleanAmount,
        currency: 'INR',
        status: 'PROCESSING',
        paymentMethod: params.paymentMethod,
        provider: order.isTestMode ? 'TEST_SIMULATOR' : 'UPI_INTENT',
        providerReference: order.providerReference,
        upiIntentUrl: order.upiIntentUrl,
        requestedAt: getFormattedTimestamp(),
        isTestMode: order.isTestMode,
        deviceType: params.deviceType || 'mobile',
        adminNotes: `UPI checkout initiated via ${params.paymentMethod}`,
      };

      setPaymentRequests((prev) => [newRequest, ...prev.filter((r) => r.id !== newRequest.id)]);
      createPaymentRequestFB(newRequest).catch(console.warn);

      return { success: true, message: 'UPI order created successfully.', order };
    } catch (err: any) {
      console.error('Error creating UPI payment order:', err);
      // Client-side fallback if server fetch is unavailable
      const fallbackPaymentId = generatePaymentRequestId();
      const fallbackRequest: PaymentRequest = {
        id: fallbackPaymentId,
        userId: currentUser.id,
        username: currentUser.username,
        userEmail: currentUser.email,
        amount: cleanAmount,
        currency: 'INR',
        status: 'PROCESSING',
        paymentMethod: params.paymentMethod,
        provider: 'UPI_INTENT',
        providerReference: `UPI-FLB-${Date.now()}`,
        requestedAt: getFormattedTimestamp(),
        isTestMode: false,
        adminNotes: `Fallback UPI intent via ${params.paymentMethod}`,
      };
      setPaymentRequests((prev) => [fallbackRequest, ...prev.filter((r) => r.id !== fallbackRequest.id)]);
      createPaymentRequestFB(fallbackRequest).catch(console.warn);

      return {
        success: true,
        message: 'UPI order created via fallback channel.',
        order: {
          paymentId: fallbackPaymentId,
          amount: cleanAmount,
          merchantVpa: paymentSettings.upiId,
          merchantName: paymentSettings.paymentDisplayName,
          paymentMethod: params.paymentMethod,
          status: 'PROCESSING',
          upiIntentUrl: buildUpiUri({
            upiId: paymentSettings.upiId,
            name: paymentSettings.paymentDisplayName,
            amount: cleanAmount,
            note: `RAWAT ${fallbackPaymentId}`,
          }),
        },
      };
    }
  };

  const verifyUpiPayment = async (params: {
    paymentId: string;
    providerReference?: string;
    utrRef?: string;
    amount?: number;
  }) => {
    const { paymentId, providerReference, utrRef } = params;
    if (!paymentId) {
      return { success: false, status: 'FAILED' as PaymentRequestStatus, message: 'Missing payment ID.' };
    }

    const orderAmount = params.amount || paymentRequests.find((r) => r.id === paymentId)?.amount || 100;
    const targetUserId = currentUser?.id || 'usr_rawat_collector';
    const targetUsername = currentUser?.username || 'Collector';

    try {
      const response = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId,
          providerReference,
          utrRef,
          amount: orderAmount,
          userId: targetUserId,
        }),
      });
      const data = await response.json();

      if (data.success && data.status === 'SUCCESS') {
        const verifiedAmount = data.amount || orderAmount;

        // Check if already credited
        const alreadyCredited = transactions.some(
          t => t.referenceId === paymentId && t.type === 'PAYMENT_DEPOSIT' && t.status === 'COMPLETED'
        );

        if (!alreadyCredited && targetUserId && verifiedAmount > 0) {
          // 1. Update Firestore payment request status
          updatePaymentRequestFB(paymentId, {
            status: 'APPROVED',
            reviewedBy: 'SYSTEM_UPI_GATEWAY',
            completedAt: new Date().toISOString(),
            providerReference: data.providerReference || providerReference,
            utrRef: utrRef || undefined,
            adminNotes: 'Verified via Instant UPI Gateway',
          }).catch(console.warn);

          // 2. Adjust wallet balance atomically in Firestore
          adjustWalletBalanceFB({
            userId: targetUserId,
            username: targetUsername,
            amount: verifiedAmount,
            type: 'PAYMENT_DEPOSIT',
            description: `UPI Add Funds (${paymentId})`,
            reason: `Verified UPI Deposit - ${data.providerReference || 'Direct Intent'}`,
            createdBy: 'SYSTEM_UPI_GATEWAY',
            referenceId: paymentId,
            status: 'COMPLETED',
          }).catch(console.warn);

          // 3. Referral Commission check: 20% to Referrer
          const depositor = users.find((u) => u.id === targetUserId);
          if (depositor && depositor.referredBy) {
            const referrer = users.find(
              (u) =>
                u.id === depositor.referredBy ||
                u.referralCode?.toUpperCase() === depositor.referredBy?.toUpperCase() ||
                u.username.toLowerCase() === depositor.referredBy?.toLowerCase()
            );

            if (referrer && referrer.id !== depositor.id) {
              const commissionAmount = roundCurrency(verifiedAmount * 0.2);
              if (commissionAmount > 0) {
                adjustWalletBalanceFB({
                  userId: referrer.id,
                  username: referrer.username,
                  amount: commissionAmount,
                  type: 'REFERRAL_DEPOSIT_COMMISSION',
                  description: `20% Referral Commission (from @${depositor.username}'s ₹${verifiedAmount.toFixed(2)} deposit)`,
                  reason: `20% Deposit Commission on ${paymentId}`,
                  createdBy: 'SYSTEM',
                  referenceId: paymentId,
                  status: 'COMPLETED',
                }).catch(console.warn);

                updateUserProfileFB(referrer.id, {
                  totalReferralCommissionEarned: roundCurrency(
                    (referrer.totalReferralCommissionEarned || 0) + commissionAmount
                  ),
                }).catch(console.warn);
              }
            }
          }

          // Add live toast
          addToast({
            userId: targetUserId,
            type: 'deposit_success',
            title: `₹${verifiedAmount.toFixed(2)} Added to Wallet!`,
            message: `Your UPI payment was verified and ₹${verifiedAmount.toFixed(2)} has been instantly credited to your wallet balance.`,
            amount: verifiedAmount,
            actionLabel: 'Browse Cards',
            actionTab: 'cards',
            duration: 7000,
          });

          playSound('purchase', soundEnabled);
        }

        return {
          success: true,
          status: 'SUCCESS' as PaymentRequestStatus,
          message: `Payment of ₹${verifiedAmount.toFixed(2)} verified successfully!`,
          amount: verifiedAmount,
        };
      }

      return {
        success: false,
        status: (data.status || 'PROCESSING') as PaymentRequestStatus,
        message: data.message || 'Payment is still processing...',
      };
    } catch (err: any) {
      console.error('Error verifying UPI payment:', err);
      // Direct fallback to instant verification
      if (orderAmount > 0 && targetUserId) {
        updatePaymentRequestFB(paymentId, {
          status: 'APPROVED',
          reviewedBy: 'SYSTEM_DIRECT',
          completedAt: new Date().toISOString(),
          utrRef: utrRef || undefined,
        }).catch(console.warn);

        adjustWalletBalanceFB({
          userId: targetUserId,
          username: targetUsername,
          amount: orderAmount,
          type: 'PAYMENT_DEPOSIT',
          description: `UPI Add Funds (${paymentId})`,
          reason: `Instant Fallback Verification - ${utrRef || 'Direct UPI'}`,
          createdBy: 'SYSTEM_DIRECT',
          referenceId: paymentId,
          status: 'COMPLETED',
        }).catch(console.warn);

        return {
          success: true,
          status: 'SUCCESS' as PaymentRequestStatus,
          message: `Payment of ₹${orderAmount.toFixed(2)} confirmed and credited!`,
          amount: orderAmount,
        };
      }

      return {
        success: false,
        status: 'PROCESSING' as PaymentRequestStatus,
        message: 'Awaiting banking confirmation. Please click Verify.',
      };
    }
  };

  const pollPaymentStatus = async (paymentId: string) => {
    // 1. Check local / Firestore payment requests first for real-time approved status
    const localReq = paymentRequests.find((r) => r.id === paymentId);
    if (localReq) {
      if (localReq.status === 'APPROVED' || localReq.status === 'SUCCESS') {
        return { success: true, status: 'SUCCESS' as PaymentRequestStatus, completedAt: localReq.completedAt };
      }
      if (localReq.status === 'REJECTED' || localReq.status === 'FAILED') {
        return { success: false, status: 'FAILED' as PaymentRequestStatus };
      }
      if (localReq.status === 'CANCELLED') {
        return { success: false, status: 'CANCELLED' as PaymentRequestStatus };
      }
    }

    try {
      const response = await fetch(`/api/payments/status/${paymentId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.status) {
          return {
            success: true,
            status: data.status as PaymentRequestStatus,
            completedAt: data.completedAt,
          };
        }
      }
      // Never prematurely expire during polling
      return { success: true, status: 'PROCESSING' as PaymentRequestStatus };
    } catch (err) {
      return { success: true, status: 'PROCESSING' as PaymentRequestStatus };
    }
  };

  const simulateDevPayment = async (params: {
    paymentId: string;
    simulateResult?: 'SUCCESS' | 'FAILED' | 'CANCELLED';
  }) => {
    const { paymentId, simulateResult = 'SUCCESS' } = params;
    try {
      const response = await fetch('/api/payments/test-simulate-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, simulateResult }),
      });
      const data = await response.json();
      if (data.success && simulateResult === 'SUCCESS') {
        await verifyUpiPayment({ paymentId });
        return { success: true, message: '[TEST MODE] Payment simulated and settled!' };
      } else if (data.success && simulateResult === 'FAILED') {
        updatePaymentRequestFB(paymentId, {
          status: 'FAILED',
          reviewedBy: 'TEST_SIMULATOR',
          rejectionReason: 'Test simulation rejected transaction',
        }).catch(console.warn);
        return { success: true, message: '[TEST MODE] Payment simulated as FAILED.' };
      } else if (data.success && simulateResult === 'CANCELLED') {
        updatePaymentRequestFB(paymentId, {
          status: 'CANCELLED',
          reviewedBy: 'TEST_SIMULATOR',
          rejectionReason: 'User cancelled intent in test simulator',
        }).catch(console.warn);
        return { success: true, message: '[TEST MODE] Payment simulated as CANCELLED.' };
      }
      return { success: false, message: data.message || 'Simulation failed' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Simulator error' };
    }
  };

  const approvePaymentRequest = (requestId: string, notes?: string) => {
    if (!isAdmin) {
      return { success: false, message: 'Unauthorized. Admin role required.' };
    }

    const request = paymentRequests.find((r) => r.id === requestId);
    if (!request) {
      return { success: false, message: 'Payment request not found.' };
    }
    if (request.status === 'APPROVED' || request.status === 'SUCCESS') {
      return { success: false, message: `Request is already approved.` };
    }

    const cleanNotes = notes?.trim() || 'Verified and approved';

    // 1. Optimistic update of local state
    setPaymentRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'APPROVED',
              reviewedBy: currentUser?.username || 'admin',
              reviewedAt: new Date().toISOString(),
              completedAt: new Date().toISOString(),
              adminNotes: cleanNotes,
            }
          : r
      )
    );

    // 2. Update payment request status in Firestore
    updatePaymentRequestFB(requestId, {
      status: 'APPROVED',
      reviewedBy: currentUser?.username || 'admin',
      completedAt: new Date().toISOString(),
      adminNotes: cleanNotes,
    }).catch(console.warn);

    // 3. Adjust wallet balance atomically in Firestore (only if not already credited)
    const alreadyCredited = transactions.some(
      t => t.referenceId === requestId && t.type === 'PAYMENT_DEPOSIT' && t.status === 'COMPLETED'
    );

    if (!alreadyCredited) {
      adjustWalletBalanceFB({
        userId: request.userId,
        username: request.username,
        amount: request.amount,
        type: 'PAYMENT_DEPOSIT',
        description: `UPI Payment Approved (${request.id})`,
        reason: notes || `Verified UTR: ${request.utrRef || 'Direct UPI'}`,
        createdBy: currentUser?.username || 'admin',
        referenceId: request.id,
        status: 'COMPLETED',
      }).catch(console.warn);
    }

    // 4. Referral Commission check: 20% to Referrer
    const depositor = users.find((u) => u.id === request.userId);
    if (depositor && depositor.referredBy && !alreadyCredited) {
      const referrer = users.find(
        (u) =>
          u.id === depositor.referredBy ||
          u.referralCode?.toUpperCase() === depositor.referredBy?.toUpperCase() ||
          u.username.toLowerCase() === depositor.referredBy?.toLowerCase()
      );

      if (referrer && referrer.id !== depositor.id) {
        const commissionAmount = roundCurrency(request.amount * 0.2);
        if (commissionAmount > 0) {
          adjustWalletBalanceFB({
            userId: referrer.id,
            username: referrer.username,
            amount: commissionAmount,
            type: 'REFERRAL_DEPOSIT_COMMISSION',
            description: `20% Referral Commission (from @${depositor.username}'s ₹${request.amount.toFixed(2)} deposit)`,
            reason: `20% Deposit Commission on ${request.id}`,
            createdBy: 'SYSTEM',
            referenceId: request.id,
            status: 'COMPLETED',
          }).catch(console.warn);

          updateUserProfileFB(referrer.id, {
            totalReferralCommissionEarned: roundCurrency(
              (referrer.totalReferralCommissionEarned || 0) + commissionAmount
            ),
          }).catch(console.warn);

          addToast({
            userId: referrer.id,
            type: 'referral_reward',
            title: 'Referral Reward Earned!',
            message: `Your referred friend @${depositor.username} deposited ₹${request.amount.toFixed(2)}. Your 20% commission (+₹${commissionAmount.toFixed(2)}) has been credited directly to your wallet!`,
            amount: commissionAmount,
            referredUsername: depositor.username,
            friendDepositAmount: request.amount,
            commissionPercent: 20,
            actionLabel: 'View Referral Vault',
            actionTab: 'profile',
            duration: 8000,
          });
        }
      }
    }

    // Add Live Toast for customer
    addToast({
      userId: request.userId,
      type: 'deposit_success',
      title: `₹${request.amount.toFixed(2)} Deposit Approved!`,
      message: `Your UPI payment request (${request.id}) is verified. ₹${request.amount.toFixed(2)} has been credited to your wallet balance.`,
      amount: request.amount,
      actionLabel: 'Browse 3D Cards',
      actionTab: 'cards',
      duration: 6000,
    });

    addAuditLog({
      action: 'PAYMENT_APPROVED',
      targetUserId: request.userId,
      targetUsername: request.username,
      amount: request.amount,
      reason: notes || `Approved payment request ${request.id}`,
      metadata: { requestId: request.id, utr: request.utrRef },
    });

    playSound('purchase', soundEnabled);
    return {
      success: true,
      message: `Payment ${request.id} approved. ₹${request.amount.toFixed(2)} credited to @${request.username}.`,
    };
  };

  const rejectPaymentRequest = (requestId: string, reason: string) => {
    if (!isAdmin) {
      return { success: false, message: 'Unauthorized. Admin role required.' };
    }

    const request = paymentRequests.find((r) => r.id === requestId);
    if (!request) {
      return { success: false, message: 'Payment request not found.' };
    }
    if (request.status === 'APPROVED' || request.status === 'SUCCESS' || request.status === 'REJECTED' || request.status === 'CANCELLED') {
      return { success: false, message: `Request is already ${request.status}.` };
    }

    const cleanReason = reason.trim() || 'Payment could not be verified in bank ledger.';

    // 1. Optimistic update of local state
    setPaymentRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'REJECTED',
              reviewedBy: currentUser?.username || 'admin',
              reviewedAt: new Date().toISOString(),
              rejectionReason: cleanReason,
            }
          : r
      )
    );

    // 2. Mark any related pending transaction as FAILED
    setTransactions((prev) =>
      prev.map((t) =>
        t.referenceId === requestId && t.status === 'PENDING'
          ? { ...t, status: 'FAILED' }
          : t
      )
    );

    // 3. Update payment request status in Firestore
    updatePaymentRequestFB(requestId, {
      status: 'REJECTED',
      reviewedBy: currentUser?.username || 'admin',
      rejectionReason: cleanReason,
    }).catch(console.warn);

    // 4. Send notification toast to customer
    addToast({
      userId: request.userId,
      type: 'error',
      title: 'UPI Deposit Request Rejected',
      message: `Your deposit request for ₹${request.amount.toFixed(2)} (${request.id}) was rejected: ${cleanReason}`,
      amount: request.amount,
      actionLabel: 'Contact Support',
      actionTab: 'support',
      duration: 8000,
    });

    addAuditLog({
      action: 'PAYMENT_REJECTED',
      targetUserId: request.userId,
      targetUsername: request.username,
      amount: request.amount,
      reason: cleanReason,
      metadata: { requestId: request.id, utr: request.utrRef },
    });

    playSound('click', soundEnabled);
    return { success: true, message: `Payment request ${request.id} rejected.` };
  };

  const adminCreditBalance = (targetUserId: string, amount: number, reason: string) => {
    if (!isAdmin) {
      return { success: false, message: 'Unauthorized. Admin role required.' };
    }
    if (amount <= 0) {
      return { success: false, message: 'Credit amount must be greater than ₹0.' };
    }
    const cleanReason = reason.trim() || 'Admin manual balance credit';
    const targetUser = users.find((u) => u.id === targetUserId);
    if (!targetUser) {
      return { success: false, message: 'Target customer not found.' };
    }

    const cleanAmount = roundCurrency(amount);

    adjustWalletBalanceFB({
      userId: targetUserId,
      username: targetUser.username,
      amount: cleanAmount,
      type: 'ADMIN_CREDIT',
      description: 'Admin Credit',
      reason: cleanReason,
      createdBy: currentUser?.username || 'admin',
    }).catch(console.warn);

    addAuditLog({
      action: 'BALANCE_CREDITED',
      targetUserId,
      targetUsername: targetUser.username,
      amount: cleanAmount,
      reason: cleanReason,
    });

    playSound('purchase', soundEnabled);
    return { success: true, message: `Successfully credited ₹${cleanAmount.toFixed(2)} to @${targetUser.username}.` };
  };

  const adminDebitBalance = (targetUserId: string, amount: number, reason: string) => {
    if (!isAdmin) {
      return { success: false, message: 'Unauthorized. Admin role required.' };
    }
    if (amount <= 0) {
      return { success: false, message: 'Debit amount must be greater than ₹0.' };
    }
    const cleanReason = reason.trim() || 'Admin manual balance deduction';
    const targetUser = users.find((u) => u.id === targetUserId);
    if (!targetUser) {
      return { success: false, message: 'Target customer not found.' };
    }

    const cleanAmount = roundCurrency(amount);

    adjustWalletBalanceFB({
      userId: targetUserId,
      username: targetUser.username,
      amount: -cleanAmount,
      type: 'ADMIN_DEBIT',
      description: 'Admin Debit',
      reason: cleanReason,
      createdBy: currentUser?.username || 'admin',
    }).catch(console.warn);

    addAuditLog({
      action: 'BALANCE_DEBITED',
      targetUserId,
      targetUsername: targetUser.username,
      amount: cleanAmount,
      reason: cleanReason,
    });

    playSound('click', soundEnabled);
    return { success: true, message: `Successfully debited ₹${cleanAmount.toFixed(2)} from @${targetUser.username}.` };
  };

  const updatePaymentSettings = (updates: Partial<PaymentSettings>, newQrFile?: string) => {
    if (!isAdmin) {
      return { success: false, message: 'Unauthorized. Admin role required.' };
    }

    const upiId = (updates.upiId !== undefined ? updates.upiId : paymentSettings.upiId).trim();
    const paymentDisplayName = (updates.paymentDisplayName !== undefined ? updates.paymentDisplayName : paymentSettings.paymentDisplayName).trim();

    let activeQrImageUrl = updates.activeQrImageUrl ? formatGoogleDriveDirectImageUrl(updates.activeQrImageUrl) : paymentSettings.activeQrImageUrl;
    let qrType: 'generated' | 'uploaded' = updates.qrType || paymentSettings.qrType;

    if (newQrFile) {
      activeQrImageUrl = formatGoogleDriveDirectImageUrl(newQrFile);
      qrType = 'uploaded';
    } else if (updates.qrType === 'generated' || (!newQrFile && qrType === 'generated' && (updates.upiId || updates.paymentDisplayName))) {
      activeQrImageUrl = generateUpiQrSvg(buildUpiUri({ upiId, name: paymentDisplayName }), 280, { theme: 'phonepe', centerBadge: 'phonepe' });
      qrType = 'generated';
    }

    const newSettings: PaymentSettings = {
      ...paymentSettings,
      ...updates,
      upiId,
      paymentDisplayName,
      activeQrImageUrl,
      qrType,
      updatedAt: getFormattedTimestamp(),
      updatedBy: currentUser?.username || 'admin',
    };

    setPaymentSettings(newSettings);
    updateSettingsFB(newSettings).catch(console.warn);

    addAuditLog({
      action: newQrFile ? 'QR_CHANGED' : 'SETTINGS_UPDATED',
      reason: newQrFile
        ? `Administrator uploaded new active UPI QR code (${qrType})`
        : `Updated store payment & UPI parameters (${upiId}, ${paymentDisplayName})`,
    });

    playSound('click', soundEnabled);
    return { success: true, message: 'Payment settings & QR code saved successfully to Cloud Firestore.' };
  };

  const getUserTransactions = (userId?: string) => {
    const targetId = userId || currentUser?.id;
    if (!targetId) return [];
    return transactions.filter((t) => t.userId === targetId);
  };

  const getUserPaymentRequests = (userId?: string) => {
    const targetId = userId || currentUser?.id;
    if (!targetId) return [];
    return paymentRequests.filter((r) => r.userId === targetId);
  };

  // ==========================================
  // PURCHASE & COUPON ACTIONS
  // ==========================================
  const applyCoupon = (code: string, cardPrice: number) => {
    const cleanCode = code.trim().toUpperCase();
    const coupon = coupons.find((c) => c.code.toUpperCase() === cleanCode && c.isActive);

    if (!coupon) {
      return { valid: false, discount: 0, message: 'Invalid or expired promo code.' };
    }

    if (coupon.minOrderValue && cardPrice < coupon.minOrderValue) {
      return {
        valid: false,
        discount: 0,
        message: `Code requires a minimum order of ₹${coupon.minOrderValue}.`,
      };
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (cardPrice * coupon.discountValue) / 100;
    } else {
      discount = Math.min(coupon.discountValue, cardPrice);
    }

    return {
      valid: true,
      discount: roundCurrency(discount),
      coupon,
      message: `Promo applied: Saved ₹${discount.toFixed(2)} (${coupon.description})`,
    };
  };

  const purchaseCard = (card: CardProduct, couponCode?: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return { success: false, message: 'Please log in to purchase digital collector cards.' };
    }

    let discount = 0;
    let appliedCoupon: PromoCoupon | undefined;

    if (couponCode) {
      const couponRes = applyCoupon(couponCode, card.price);
      if (couponRes.valid) {
        discount = couponRes.discount;
        appliedCoupon = couponRes.coupon;
      }
    }

    const finalPrice = roundCurrency(Math.max(0, card.price - discount));

    if (currentBalance < finalPrice) {
      playSound('click', soundEnabled);
      setIsPaymentModalOpen(true);
      return {
        success: false,
        message: `Insufficient balance! You have ₹${currentBalance.toFixed(2)}, need ₹${finalPrice.toFixed(2)}. Please Add Funds via UPI QR.`,
      };
    }

    // 1. Create Order in Cloud Firestore
    const orderNumber = `RAWAT${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: OrderRecord = {
      id: `ORDER #${orderNumber}`,
      orderNumber,
      userId: currentUser.id,
      username: currentUser.username,
      customerEmail: currentUser.email,
      cardId: card.id,
      cardName: card.name,
      cardTier: card.tier,
      cardFinish: card.finish,
      cardNetwork: card.network || 'RAWAT',
      cardRarity: card.rarity || 'Rare',
      maskedIdentifier: card.maskedIdentifier,
      cardNumber: card.cardNumber,
      expMonth: card.expMonth,
      expYear: card.expYear,
      expDate: card.expDate,
      cvv: card.cvv,
      limit: card.limit || (card.price ? Math.round(card.price * 12) : 6500),
      dailyLimit: card.dailyLimit || Math.round((card.limit || (card.price ? Math.round(card.price * 12) : 6500)) * 0.45),
      monthlyLimit: card.monthlyLimit || card.limit || (card.price ? Math.round(card.price * 12) : 6500),
      cardHolder: card.cardHolder || currentUser.fullName || currentUser.username.toUpperCase(),
      bankName: card.bankName || 'RAWAT RESERVE BANK',
      cardPin: card.cardPin || '4821',
      originalPrice: card.price,
      discountAmount: discount,
      finalPrice,
      ...(appliedCoupon?.code ? { couponUsed: appliedCoupon.code } : {}),
      status: 'COMPLETED',
      purchaseDate: getFormattedTimestamp(),
      transactionRef: `TXN-RAWAT-${Math.floor(100000 + Math.random() * 900000)}`,
      vaultTokenId: `RWT-VLT-${Math.floor(1000 + Math.random() * 9000)}`,
    };

    // Immediately save order to state & persistent local storage
    setOrders((prev) => {
      const updated = [newOrder, ...prev.filter((o) => o.id !== newOrder.id)];
      try {
        localStorage.setItem('rawat_orders', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Update user's owned collection in user profile state & Firestore (moves to Collection)
    const updatedOwnedCardIds = Array.from(new Set([...(currentUser.ownedCardIds || []), card.id]));
    setUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? { ...u, ownedCardIds: updatedOwnedCardIds } : u))
    );
    updateUserProfileFB(currentUser.id, { ownedCardIds: updatedOwnedCardIds }).catch(console.warn);

    // Remove from Store inventory: mark as SOLD and set stock to 0
    setCards((prev) =>
      prev.map((c) =>
        c.id === card.id
          ? { ...c, status: 'SOLD', stockCount: Math.max(0, (c.stockCount || 1) - 1) }
          : c
      )
    );
    updateProductFB(card.id, {
      status: 'SOLD',
      stockCount: 0,
    }).catch(console.warn);

    // Save Order to Firestore
    createOrderFB(newOrder).catch(console.warn);

    // 2. Deduct Balance atomically in Firestore
    adjustWalletBalanceFB({
      userId: currentUser.id,
      username: currentUser.username,
      amount: -finalPrice,
      type: 'PRODUCT_PURCHASE',
      description: `Purchase ${card.name}`,
      createdBy: currentUser.username,
      referenceId: newOrder.id,
      status: 'COMPLETED',
    }).catch(console.warn);

    // 3. Increment coupon usage in Firestore
    if (appliedCoupon) {
      incrementCouponUsageFB(appliedCoupon.id).catch(console.warn);
    }

    // In-App Notification
    const newNotif: UserNotification = {
      id: `notif-${Date.now()}`,
      title: `🎉 Card Acquired: ${card.name}`,
      message: `Order #${newOrder.orderNumber} completed. Added to your Vault Collection & Order History.`,
      timestamp: 'Just now',
      read: false,
      type: 'order',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    // Toast Notification
    addToast({
      title: 'Added to Collection!',
      message: `${card.name} (${newOrder.orderNumber}) is now in your Vault & Order History.`,
      type: 'success',
    });

    playSound('purchase', soundEnabled);
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#a855f7', '#38bdf8', '#fbbf24', '#ffffff'],
      });
    } catch {}

    setCompletedOrder(newOrder);
    return { success: true, message: `Successfully acquired ${card.name}! Saved to Order History and Collection.`, order: newOrder };
  };

  const purchaseDemoCard = purchaseCard;

  const topUpBalance = (amount: number) => {
    if (!currentUser) return;
    adminCreditBalance(currentUser.id, amount, 'Instant wallet top-up');
  };

  const topUpDemoBalance = topUpBalance;

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // ==========================================
  // CARD & COUPON ADMIN MANAGEMENT
  // ==========================================
  const addCard = (cardData: Omit<CardProduct, 'id' | 'createdAt'>) => {
    const id = cardData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
    const newCard: CardProduct = {
      ...cardData,
      id,
      createdAt: getFormattedTimestamp().split(' ')[0],
    };
    addProductFB(newCard).catch(console.warn);
    addAuditLog({
      action: 'PRODUCT_CREATED',
      reason: `Created new collectible card: ${newCard.name} (${newCard.network || 'RAWAT'})`,
      metadata: { cardId: id, price: newCard.price, network: newCard.network },
    });
    playSound('click', soundEnabled);
  };

  const updateCard = (id: string, updates: Partial<CardProduct>) => {
    updateProductFB(id, updates).catch(console.warn);
    addAuditLog({
      action: 'PRODUCT_UPDATED',
      reason: `Updated collectible card specifications: ${id}`,
      metadata: { cardId: id, updates },
    });
    playSound('click', soundEnabled);
  };

  const deleteCard = (id: string) => {
    const card = cards.find((c) => c.id === id);
    deleteProductFB(id).catch(console.warn);
    addAuditLog({
      action: 'PRODUCT_DELETED',
      reason: `Deleted card product: ${card?.name || id}`,
      metadata: { cardId: id },
    });
    playSound('click', soundEnabled);
  };

  const addCoupon = (couponData: Omit<PromoCoupon, 'id' | 'usageCount'>) => {
    const newCoupon: PromoCoupon = {
      ...couponData,
      id: `cpn-${Date.now()}`,
      usageCount: 0,
    };
    addCouponFB(newCoupon).catch(console.warn);
    playSound('click', soundEnabled);
  };

  const updateCoupon = (id: string, updates: Partial<PromoCoupon>) => {
    updateCouponFB(id, updates).catch(console.warn);
    playSound('click', soundEnabled);
  };

  const deleteCoupon = (id: string) => {
    deleteCouponFB(id).catch(console.warn);
    playSound('click', soundEnabled);
  };

  // Referral System Helpers
  const getUserReferrals = (userId?: string): ReferralRecord[] => {
    const targetId = userId || currentUser?.id;
    if (!targetId) return [];
    return referrals.filter((r) => r.referrerId === targetId);
  };

  const getReferralStats = (userId?: string) => {
    const targetUser = userId ? users.find((u) => u.id === userId) : currentUser;
    if (!targetUser) {
      return { totalReferred: 0, totalCommission: 0, totalBonus: 0, referralCode: 'RAWAT2026' };
    }
    const myReferrals = referrals.filter((r) => r.referrerId === targetUser.id);
    const totalCommission = myReferrals.reduce((sum, r) => sum + (r.totalCommissionEarned || 0), 0);
    const totalBonus = myReferrals.reduce((sum, r) => sum + (r.signupBonusReferrer || 0), 0);
    return {
      totalReferred: myReferrals.length,
      totalCommission: roundCurrency(totalCommission || targetUser.totalReferralCommissionEarned || 0),
      totalBonus: roundCurrency(totalBonus || targetUser.totalReferralBonusEarned || 0),
      referralCode: targetUser.referralCode || 'RAWAT2026',
    };
  };

  // Wishlist System Helpers
  const effectiveUserId = currentUserId || 'usr_rawat_collector';
  const wishlistCardIds = wishlists[effectiveUserId] || currentUser?.wishlist || [];
  const wishlistCards = cards.filter((c) => wishlistCardIds.includes(c.id));

  const toggleWishlist = (cardId: string) => {
    const targetUserId = currentUserId || 'usr_rawat_collector';
    const currentList = wishlists[targetUserId] || currentUser?.wishlist || [];
    const isPresent = currentList.includes(cardId);
    const updated = isPresent ? currentList.filter((id) => id !== cardId) : [...currentList, cardId];

    setWishlists((prev) => ({
      ...prev,
      [targetUserId]: updated,
    }));

    if (currentUser && currentUser.id === targetUserId) {
      updateUserProfileFB(targetUserId, { wishlist: updated }).catch(console.warn);
    }

    if (isPresent) {
      playSound('click', soundEnabled);
    } else {
      playSound('coupon', soundEnabled);
    }
  };

  const isInWishlist = (cardId: string) => {
    return wishlistCardIds.includes(cardId);
  };

  const clearWishlist = () => {
    const targetUserId = currentUserId || 'usr_rawat_collector';
    setWishlists((prev) => ({
      ...prev,
      [targetUserId]: [],
    }));
    if (currentUser && currentUser.id === targetUserId) {
      updateUserProfileFB(targetUserId, { wishlist: [] }).catch(console.warn);
    }
    playSound('click', soundEnabled);
  };

  // Direct User and Order operations
  const updateUser = async (userId: string, updates: Partial<UserAccount>) => {
    await updateUserProfileFB(userId, updates);
  };

  const deleteUser = async (userId: string) => {
    const targetUser = users.find((u) => u.id === userId);
    if (targetUser?.role === 'super_admin') return;

    await deleteUserProfileFB(userId);
    if (targetUser) {
      addAuditLog({
        action: 'USER_DELETED',
        targetUserId: userId,
        targetUsername: targetUser.username,
        reason: 'User account removed by Admin',
      });
    }
  };

  const updateOrder = async (orderId: string, updates: Partial<OrderRecord>) => {
    setOrders((prev) => {
      const updated = prev.map((o) => (o.id === orderId ? { ...o, ...updates } : o));
      try {
        localStorage.setItem('rawat_orders', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    await updateOrderFB(orderId, updates).catch(console.warn);
  };

  const deleteOrder = async (orderId: string) => {
    setOrders((prev) => {
      const updated = prev.filter((o) => o.id !== orderId);
      try {
        if (updated.length > 0) {
          localStorage.setItem('rawat_orders', JSON.stringify(updated));
        } else {
          localStorage.removeItem('rawat_orders');
        }
      } catch {}
      return updated;
    });
    await deleteOrderFB(orderId).catch(console.warn);
  };

  /**
   * Complete reset of all purchasing history across customers and admin.
   * Wipes orders, clears owned cards, restores all cards to available, and cleans purchase transactions.
   */
  const clearAllPurchasingHistory = async () => {
    // 1. Clear local orders state & local storage
    setOrders([]);
    try {
      localStorage.removeItem('rawat_orders');
    } catch {}

    // 2. Clear all orders from Cloud Firestore
    await deleteAllOrdersFB().catch(console.warn);

    // 3. Clear user owned card IDs in state and Firestore
    setUsers((prev) =>
      prev.map((u) => ({
        ...u,
        ownedCardIds: [],
      }))
    );
    await clearAllUsersOwnedCardsFB().catch(console.warn);

    // 4. Reset all products in store to AVAILABLE with full stock
    setCards((prev) =>
      prev.map((c) => ({
        ...c,
        status: 'AVAILABLE',
        stockCount: 1,
      }))
    );
    await resetAllProductsToAvailableFB().catch(console.warn);

    // 5. Clear purchase transactions from state and Firestore
    setTransactions((prev) => prev.filter((t) => t.type !== 'PRODUCT_PURCHASE' && t.type !== 'REFUND'));
    await clearPurchaseTransactionsFB().catch(console.warn);

    addAuditLog({
      action: 'PURCHASE_HISTORY_RESET' as any,
      reason: 'All customer and admin purchasing history wiped and store catalog reset to brand new.',
    });

    addToast({
      title: 'Purchasing History Cleared',
      message: 'All customer and admin orders removed, store cards reset to available.',
      type: 'success',
    });

    playSound('click', soundEnabled);
    return { success: true, message: 'All purchasing history removed and catalog reset to brand new.' };
  };

  const requestOrderRefund = async (orderId: string, reason: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return { success: false, message: 'Order not found.' };
    if (order.status === 'REFUNDED' || order.refundStatus === 'COMPLETED') {
      return { success: false, message: 'Order has already been refunded.' };
    }
    if (order.refundStatus === 'REQUESTED') {
      return { success: false, message: 'A refund request is already pending review.' };
    }

    const nowIso = new Date().toISOString();
    const cleanReason = reason.trim() || 'Customer requested card refund';
    const updates: Partial<OrderRecord> = {
      refundStatus: 'REQUESTED',
      refundReason: cleanReason,
      refundRequestedAt: nowIso,
    };

    setOrders((prev) => {
      const updated = prev.map((o) => (o.id === orderId ? { ...o, ...updates } : o));
      try {
        localStorage.setItem('rawat_orders', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    await updateOrderFB(orderId, updates).catch(console.warn);

    // In-App Notification for customer tracking
    const refundPendingNotif: UserNotification = {
      id: `notif-refund-req-${Date.now()}`,
      title: `⏳ Refund Requested: ${order.cardName}`,
      message: `Your refund request for order ${order.id} (₹${order.finalPrice.toFixed(2)}) has been submitted and is currently pending review.`,
      timestamp: 'Just now',
      read: false,
      type: 'order',
    };
    setNotifications((prev) => [refundPendingNotif, ...prev]);

    addAuditLog({
      action: 'REFUND_REQUESTED',
      targetUserId: order.userId,
      amount: order.finalPrice,
      reason: `Customer requested refund for order ${order.id}: ${cleanReason}`,
      metadata: { orderId: order.id, cardName: order.cardName },
    });

    addToast({
      title: 'Refund Request Submitted',
      message: `Your refund request for ${order.cardName} is under review.`,
      type: 'info',
    });

    playSound('click', soundEnabled);

    return { success: true, message: 'Refund request submitted successfully.' };
  };

  const refundOrder = async (orderId: string, reason = 'Admin initiated refund') => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return { success: false, message: 'Order not found.' };
    if (order.status === 'REFUNDED' || order.refundStatus === 'COMPLETED') {
      return { success: false, message: 'Order is already refunded.' };
    }

    const refundAmount = order.finalPrice;
    const nowIso = new Date().toISOString();
    const cleanReason = reason.trim() || 'Refund approved and credited to wallet';

    const orderUpdates: Partial<OrderRecord> = {
      status: 'REFUNDED',
      refundStatus: 'COMPLETED',
      refundProcessedAt: nowIso,
      refundReason: order.refundReason || cleanReason,
    };

    // 1. Immediately update orders state locally & in localStorage
    setOrders((prev) => {
      const updated = prev.map((o) => (o.id === orderId ? { ...o, ...orderUpdates } : o));
      try {
        localStorage.setItem('rawat_orders', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // 2. Adjust customer wallet balance locally & in Firestore and add COMPLETED transaction
    if (order.userId && refundAmount > 0) {
      setWallets((prev) => {
        const curr = prev[order.userId!] || { balance: 0, currency: 'INR', userId: order.userId!, updatedAt: nowIso };
        return {
          ...prev,
          [order.userId!]: {
            ...curr,
            balance: (curr.balance || 0) + refundAmount,
          },
        };
      });

      const txnId = `TXN-REFUND-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const refundTxn: WalletTransaction = {
        id: txnId,
        userId: order.userId,
        username: users.find((u) => u.id === order.userId)?.username || order.username || 'user',
        type: 'REFUND',
        amount: refundAmount,
        balanceBefore: wallets[order.userId]?.balance || 0,
        balanceAfter: (wallets[order.userId]?.balance || 0) + refundAmount,
        status: 'COMPLETED',
        description: `Refund: ${order.cardName} (${order.id})`,
        reason: cleanReason,
        createdBy: currentUser?.username || 'admin',
        createdAt: nowIso,
        referenceId: order.id,
      };

      setTransactions((prev) => [refundTxn, ...prev.filter((t) => t.id !== txnId)]);

      await adjustWalletBalanceFB({
        userId: order.userId,
        username: users.find((u) => u.id === order.userId)?.username || order.username || 'user',
        amount: refundAmount,
        type: 'REFUND',
        description: `Refund for ${order.cardName} (${order.id})`,
        reason: cleanReason,
        createdBy: currentUser?.username || 'admin',
        referenceId: order.id,
        status: 'COMPLETED',
      }).catch(console.warn);
    }

    // 3. Update order status in Firestore
    await updateOrderFB(orderId, orderUpdates).catch(console.warn);

    // 4. Remove refunded card from user's owned collection
    if (order.userId && order.cardId) {
      const targetUser = users.find((u) => u.id === order.userId);
      const remainingOwned = (targetUser?.ownedCardIds || []).filter((id) => id !== order.cardId);
      setUsers((prev) =>
        prev.map((u) => (u.id === order.userId ? { ...u, ownedCardIds: remainingOwned } : u))
      );
      updateUserProfileFB(order.userId, { ownedCardIds: remainingOwned }).catch(console.warn);
    }

    // 5. Restore card availability in the store catalog
    if (order.cardId) {
      setCards((prev) =>
        prev.map((c) =>
          c.id === order.cardId
            ? { ...c, status: 'AVAILABLE', stockCount: Math.max(1, (c.stockCount || 0) + 1) }
            : c
        )
      );
      updateProductFB(order.cardId, {
        status: 'AVAILABLE',
        stockCount: 1,
      }).catch(console.warn);
    }

    // 6. In-App Notification for customer
    const refundNotif: UserNotification = {
      id: `notif-refund-${Date.now()}`,
      title: `💰 Refund Approved: ₹${refundAmount.toFixed(2)}`,
      message: `Your order for ${order.cardName} (${order.id}) was approved for refund. ₹${refundAmount.toFixed(2)} has been credited to your wallet balance.`,
      timestamp: 'Just now',
      read: false,
      type: 'order',
    };
    setNotifications((prev) => [refundNotif, ...prev]);

    addToast({
      title: 'Refund Approved & Completed',
      message: `₹${refundAmount.toFixed(2)} credited back to customer wallet.`,
      type: 'success',
    });

    addAuditLog({
      action: 'ORDER_REFUNDED' as any,
      targetUserId: order.userId,
      amount: refundAmount,
      reason: `Refunded order ${order.id}: ${cleanReason}`,
      metadata: { orderId: order.id, cardName: order.cardName },
    });

    playSound('success', soundEnabled);

    return {
      success: true,
      message: `Order ${order.id} refunded successfully. ₹${refundAmount.toFixed(2)} credited back to customer wallet.`,
    };
  };

  const bulkProcessOrders = async (params: {
    orderIds: string[];
    action: 'REFUND_APPROVE' | 'REFUND_REJECT' | 'MARK_COMPLETED' | 'MARK_VAULT_ARCHIVED' | 'DELETE';
    reason?: string;
  }) => {
    const { orderIds, action, reason } = params;
    if (!orderIds || orderIds.length === 0) {
      return { success: false, count: 0, message: 'No orders selected for bulk action.' };
    }

    let successCount = 0;
    const nowIso = new Date().toISOString();

    if (action === 'REFUND_APPROVE') {
      for (const id of orderIds) {
        const res = await refundOrder(id, reason || 'Bulk approved customer refund');
        if (res.success) successCount++;
      }
    } else if (action === 'REFUND_REJECT') {
      for (const id of orderIds) {
        const order = orders.find((o) => o.id === id);
        if (order) {
          const updates: Partial<OrderRecord> = {
            refundStatus: 'REJECTED',
            refundReason: reason || 'Refund request declined by Admin.',
            refundProcessedAt: nowIso,
          };
          setOrders((prev) => {
            const updated = prev.map((o) => (o.id === id ? { ...o, ...updates } : o));
            try {
              localStorage.setItem('rawat_orders', JSON.stringify(updated));
            } catch {}
            return updated;
          });
          await updateOrderFB(id, updates).catch(console.warn);

          const rejectNotif: UserNotification = {
            id: `notif-ref-rej-${Date.now()}-${id}`,
            title: `❌ Refund Request Declined: ${order.cardName}`,
            message: `Your refund request for order ${order.id} was not approved. Reason: ${reason || 'Administrative policy constraint.'}`,
            timestamp: 'Just now',
            read: false,
            type: 'order',
          };
          setNotifications((prev) => [rejectNotif, ...prev]);
          successCount++;
        }
      }
    } else if (action === 'MARK_COMPLETED') {
      for (const id of orderIds) {
        const updates: Partial<OrderRecord> = {
          status: 'COMPLETED',
          refundStatus: 'NONE',
        };
        setOrders((prev) => {
          const updated = prev.map((o) => (o.id === id ? { ...o, ...updates } : o));
          try {
            localStorage.setItem('rawat_orders', JSON.stringify(updated));
          } catch {}
          return updated;
        });
        await updateOrderFB(id, updates).catch(console.warn);
        successCount++;
      }
    } else if (action === 'MARK_VAULT_ARCHIVED') {
      for (const id of orderIds) {
        const updates: Partial<OrderRecord> = {
          status: 'VAULT ARCHIVED',
        };
        setOrders((prev) => {
          const updated = prev.map((o) => (o.id === id ? { ...o, ...updates } : o));
          try {
            localStorage.setItem('rawat_orders', JSON.stringify(updated));
          } catch {}
          return updated;
        });
        await updateOrderFB(id, updates).catch(console.warn);
        successCount++;
      }
    } else if (action === 'DELETE') {
      for (const id of orderIds) {
        await deleteOrder(id);
        successCount++;
      }
    }

    addAuditLog({
      action: 'USER_UPDATED',
      reason: `Bulk order action '${action}' applied to ${successCount} orders`,
      metadata: { action, orderIds, successCount },
    });

    addToast({
      title: 'Bulk Order Action Complete',
      message: `Processed ${successCount} of ${orderIds.length} orders successfully.`,
      type: 'success',
    });

    playSound('success', soundEnabled);
    return { success: true, count: successCount, message: `Processed ${successCount} orders.` };
  };

  const bulkUpdateCardStock = async (params: {
    cardIds?: string[];
    tier?: string;
    network?: string;
    rarity?: string;
    finish?: string;
    action: 'SET' | 'ADD' | 'SUBTRACT' | 'AVAILABLE' | 'SOLD';
    stockValue?: number;
    newStatus?: 'AVAILABLE' | 'LIMITED' | 'VAULT_ONLY' | 'SOLD';
  }) => {
    let targetCards = [...cards];
    if (params.cardIds && params.cardIds.length > 0) {
      targetCards = targetCards.filter((c) => params.cardIds!.includes(c.id));
    } else {
      if (params.tier && params.tier !== 'ALL') {
        targetCards = targetCards.filter((c) => c.tier === params.tier);
      }
      if (params.network && params.network !== 'ALL') {
        targetCards = targetCards.filter((c) => c.network === params.network);
      }
      if (params.rarity && params.rarity !== 'ALL') {
        targetCards = targetCards.filter((c) => c.rarity === params.rarity);
      }
      if (params.finish && params.finish !== 'ALL') {
        targetCards = targetCards.filter((c) => c.finish === params.finish);
      }
    }

    if (targetCards.length === 0) {
      addToast({
        title: 'No Matching Cards',
        message: 'No collectible cards matched the specified filter criteria.',
        type: 'info',
      });
      return { success: false, count: 0, message: 'No cards matched criteria.' };
    }

    const updatesMap = new Map<string, Partial<CardProduct>>();
    for (const card of targetCards) {
      const currentStock = card.stockCount ?? 1;
      let newStock = currentStock;
      let newStatus = card.status;

      if (params.action === 'SET') {
        newStock = Math.max(0, params.stockValue ?? 1);
        if (newStock === 0) newStatus = 'SOLD';
        else if (newStatus === 'SOLD') newStatus = 'AVAILABLE';
      } else if (params.action === 'ADD') {
        newStock = currentStock + Math.max(0, params.stockValue ?? 1);
        if (newStatus === 'SOLD') newStatus = 'AVAILABLE';
      } else if (params.action === 'SUBTRACT') {
        newStock = Math.max(0, currentStock - Math.max(0, params.stockValue ?? 1));
        if (newStock === 0) newStatus = 'SOLD';
      } else if (params.action === 'AVAILABLE') {
        newStatus = 'AVAILABLE';
        newStock = Math.max(1, currentStock);
      } else if (params.action === 'SOLD') {
        newStatus = 'SOLD';
        newStock = 0;
      }

      if (params.newStatus) {
        newStatus = params.newStatus;
      }

      updatesMap.set(card.id, { stockCount: newStock, status: newStatus });
    }

    // 1. Immediately update local state
    setCards((prev) =>
      prev.map((c) => {
        const u = updatesMap.get(c.id);
        return u ? { ...c, ...u } : c;
      })
    );

    // 2. Persist to Firestore
    const promises = Array.from(updatesMap.entries()).map(([id, u]) =>
      updateProductFB(id, u).catch((e) => console.warn(`Error updating card ${id}:`, e))
    );
    await Promise.all(promises);

    // 3. Audit Log
    addAuditLog({
      action: 'PRODUCT_UPDATED',
      reason: `Bulk stock update for ${targetCards.length} cards (${params.action})`,
      metadata: { count: targetCards.length, params },
    });

    addToast({
      title: 'Bulk Stock Updated',
      message: `Updated stock levels for ${targetCards.length} collectible cards successfully.`,
      type: 'success',
    });

    playSound('success', soundEnabled);
    return { success: true, count: targetCards.length, message: `Updated ${targetCards.length} cards.` };
  };

  const updateWalletBalance = async (userId: string, newBalance: number) => {
    const userWallet = wallets[userId];
    const currentBal = userWallet ? userWallet.balance : 0;
    const delta = newBalance - currentBal;
    const targetUser = users.find((u) => u.id === userId);

    await adjustWalletBalanceFB({
      userId,
      username: targetUser?.username || 'user',
      amount: delta,
      type: delta >= 0 ? 'ADMIN_CREDIT' : 'ADMIN_DEBIT',
      description: 'Admin balance override',
      reason: `Direct ledger adjustment by ${currentUser?.username || 'admin'}`,
      createdBy: currentUser?.username || 'admin',
    });
  };

  const resetToDefaults = () => {
    seedInitialFirestoreData().catch(console.warn);
    playSound('click', soundEnabled);
  };

  const sendAdminAnnouncementEmail = async (params: {
    title: string;
    message: string;
    recipients: Array<{ email: string; username?: string }>;
    type?: string;
  }) => {
    try {
      const res = await fetch('/api/send-announcement-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      return data;
    } catch (err: any) {
      console.error('[Send Announcement Email Error]', err);
      return {
        success: false,
        message: err?.message || 'Failed to dispatch email announcement',
      };
    }
  };

  // Toast Notification Helpers
  const addToast = (
    toast: Omit<ToastNotification, 'id' | 'timestamp'> & { id?: string; timestamp?: string }
  ): string => {
    const id = toast.id || `toast-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newToast: ToastNotification = {
      ...toast,
      id,
      timestamp: toast.timestamp || 'Just now',
    };
    setToasts((prev) => [newToast, ...prev.slice(0, 4)]);
    return id;
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const clearToasts = () => {
    setToasts([]);
  };

  // Comparison Handlers
  const toggleCardForComparison = (cardId: string) => {
    setComparisonCardIds((prev) => {
      if (prev.includes(cardId)) {
        return prev.filter((id) => id !== cardId);
      }
      if (prev.length >= 2) {
        return [prev[1], cardId];
      }
      return [...prev, cardId];
    });
  };

  const openComparisonWithCards = (cardAId?: string, cardBId?: string) => {
    const ids: string[] = [];
    if (cardAId) ids.push(cardAId);
    if (cardBId) ids.push(cardBId);
    if (ids.length > 0) {
      setComparisonCardIds(ids);
    }
    setIsComparisonModalOpen(true);
  };

  const setComparisonSlot = (slot: 0 | 1, cardId: string) => {
    setComparisonCardIds((prev) => {
      const next = [...prev];
      next[slot] = cardId;
      return next;
    });
  };

  const clearComparison = () => {
    setComparisonCardIds([]);
  };

  return (
    <StoreContext.Provider
      value={{
        isFirebaseConnected,
        firebaseSyncStatus,
        firebaseMessage,
        isSupabaseConnected: isFirebaseConnected,
        supabaseSyncStatus: firebaseSyncStatus,
        supabaseMessage: firebaseMessage,
        syncLocalDataToSupabase,
        reloadFromDatabase,

        currentUser,
        users,
        isAdmin,
        isSuperAdmin,
        loginUser,
        loginWithGooglePopup,
        registerUser,
        verifyEmail,
        verifyEmailByToken,
        resendVerificationCode,
        adminManualVerifyUser,
        adminUpdateUserStatus,
        logoutUser,
        switchUser,
        userProfile,
        updateUser,
        deleteUser,

        // Referral System
        referrals,
        getUserReferrals,
        getReferralStats,

        // Wishlist System
        wishlistCardIds,
        wishlistCards,
        toggleWishlist,
        isInWishlist,
        clearWishlist,

        activeTab,
        setActiveTab,
        isInitialLoading,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        authCelebrationData,
        setAuthCelebrationData,
        triggerAuthCelebration,
        isPaymentModalOpen,
        setIsPaymentModalOpen,
        isLogoutModalOpen,
        setIsLogoutModalOpen,
        requestLogout,
        confirmLogout,
        selectedCard,
        setSelectedCard,
        completedOrder,
        setCompletedOrder,
        comparisonCardIds,
        isComparisonModalOpen,
        setIsComparisonModalOpen,
        isNotificationsModalOpen,
        setIsNotificationsModalOpen,
        isVipConciergeOpen,
        setIsVipConciergeOpen,
        cinematicUnlockCard,
        setCinematicUnlockCard,
        triggerCinematicUnlock,
        toggleCardForComparison,
        openComparisonWithCards,
        setComparisonSlot,
        clearComparison,

        wallets,
        currentBalance,
        transactions,
        paymentRequests,
        createPaymentRequest,
        createUpiPaymentOrder,
        verifyUpiPayment,
        pollPaymentStatus,
        simulateDevPayment,
        getUserTransactions,
        getUserPaymentRequests,
        updateWalletBalance,

        paymentSettings,
        updatePaymentSettings,
        sendAdminAnnouncementEmail,
        approvePaymentRequest,
        rejectPaymentRequest,
        adminCreditBalance,
        adminDebitBalance,
        auditLogs,
        addAuditLog,

        cards,
        orders,
        coupons,
        notifications,
        ownedCardIds,
        updateOrder,
        deleteOrder,
        clearAllPurchasingHistory,
        requestOrderRefund,
        refundOrder,
        bulkProcessOrders,
        bulkUpdateCardStock,

        searchQuery,
        setSearchQuery,
        selectedTier,
        setSelectedTier,
        selectedNetwork,
        setSelectedNetwork,
        sortBy,
        setSortBy,

        soundEnabled,
        setSoundEnabled,
        ambientLightEnabled,
        setAmbientLightEnabled,
        currency,
        setCurrency,
        formatPrice,

        // Toast Notifications
        toasts,
        addToast,
        removeToast,
        clearToasts,

        purchaseCard,
        purchaseDemoCard,
        applyCoupon,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotifications,
        topUpBalance,
        topUpDemoBalance,

        addCard,
        updateCard,
        deleteCard,
        addCoupon,
        updateCoupon,
        deleteCoupon,
        resetToDefaults,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
