export type CardTier = 'BLACK' | 'GOLD' | 'PLATINUM' | 'ELITE' | 'SPECIAL';

export type CardRarity = 'Common' | 'Rare' | 'Epic' | 'Mythic' | 'Legendary';

export type CardFinish = 'obsidian' | 'gold' | 'platinum' | 'emerald' | 'amethyst' | 'carbon' | 'iridescent' | 'rose_gold';

export type HolographicOverlayType =
  | 'prism_rainbow'
  | 'quantum_laser'
  | 'cosmic_starlight'
  | 'hyper_gold_foil'
  | 'obsidian_circuit'
  | 'iridescent_liquid'
  | 'amethyst_flare'
  | 'emerald_aurora'
  | 'glitch_hologram'
  | 'none';

export type CardNetwork = 'VISA' | 'MASTERCARD' | 'RAWAT';

export type UserRole = 'customer' | 'admin' | 'super_admin';

export type AccountStatus = 'active' | 'suspended' | 'pending_verification';

export interface UserAccount {
  id: string; // e.g. "usr_1024"
  username: string; // e.g. "rawat_collector"
  fullName?: string; // e.g. "Rawat"
  phone?: string; // e.g. "+91 9876543210"
  email: string;
  passwordHash: string;
  role: UserRole;
  isEmailVerified: boolean;
  verificationCode?: string; // 6 digit code e.g. "482914"
  verificationToken?: string; // unique token for simulated link e.g. "rwt_tok_8f9214ab"
  verificationSentAt?: string;
  status: AccountStatus;
  avatarSeed: string;
  membershipTier: string; // e.g. "ROYAL BLACK", "GOLD VIP", "NOIR ELITE"
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  referralCode: string; // unique code e.g. "RAWAT-8392"
  referredBy?: string; // userId of referrer
  totalReferralCommissionEarned?: number; // lifetime 20% deposit commission in ₹
  totalReferralBonusEarned?: number; // signup bonuses earned in ₹
  wishlist?: string[]; // array of bookmarked card IDs
  ownedCardIds?: string[]; // array of owned card IDs in collection
}

export interface WishlistRecord {
  userId: string;
  cardIds: string[];
  updatedAt: string;
}

export interface ReferralRecord {
  id: string; // e.g. "REF-83921"
  referrerId: string;
  referrerUsername: string;
  referredUserId: string;
  referredUsername: string;
  referredEmail: string;
  referralCodeUsed: string;
  signupBonusReferrer: number; // e.g. 50 (₹50)
  signupBonusReferred: number; // e.g. 50 (₹50)
  totalDepositedByFriend: number; // sum of friend's deposits
  totalCommissionEarned: number; // 20% of all friend's deposits
  createdAt: string;
  lastDepositAt?: string;
}

export interface Wallet {
  userId: string;
  balance: number; // in INR (₹), decimal safe
  currency: 'INR' | 'USD' | 'EUR';
  updatedAt: string;
}

export type TransactionType =
  | 'ADMIN_CREDIT'
  | 'ADMIN_DEBIT'
  | 'PAYMENT_DEPOSIT'
  | 'PRODUCT_PURCHASE'
  | 'REFUND'
  | 'REFERRAL_SIGNUP_BONUS'
  | 'REFERRAL_DEPOSIT_COMMISSION';

export type TransactionStatus = 'COMPLETED' | 'PENDING' | 'REJECTED' | 'FAILED';

export interface WalletTransaction {
  id: string; // e.g. "TXN-RAWAT-83921"
  userId: string;
  username: string;
  type: TransactionType;
  amount: number; // positive or negative
  balanceBefore: number;
  balanceAfter: number;
  status: TransactionStatus;
  description: string;
  reason?: string;
  createdBy: string; // admin username, 'SYSTEM', or username
  createdAt: string;
  referenceId?: string; // e.g. "PAY-849201" or "ORDER-RAWAT1024"
}

export type PaymentRequestStatus =
  | 'PROCESSING'
  | 'PENDING_VERIFICATION'
  | 'APPROVED'
  | 'SUCCESS'
  | 'FAILED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'REJECTED';

export type PaymentMethodType =
  | 'GOOGLE_PAY'
  | 'PHONEPE'
  | 'PAYTM'
  | 'OTHER_UPI'
  | 'QR_SCAN'
  | 'MANUAL_UTR';

export interface PaymentRequest {
  id: string; // e.g. "PAY-849201"
  userId: string;
  username: string;
  userEmail: string;
  amount: number; // in INR ₹
  currency?: 'INR';
  status: PaymentRequestStatus;
  paymentMethod?: PaymentMethodType;
  provider?: 'UPI_INTENT' | 'UPI_GATEWAY' | 'MANUAL_DEPOSIT' | 'TEST_SIMULATOR';
  providerReference?: string;
  upiIntentUrl?: string;
  utrRef?: string; // e.g. "UTR-98214981"
  requestedAt: string;
  reviewedAt?: string;
  completedAt?: string;
  reviewedBy?: string; // admin username or 'SYSTEM_WEBHOOK'
  rejectionReason?: string;
  adminNotes?: string;
  isTestMode?: boolean;
  deviceType?: 'mobile' | 'desktop';
  idempotencyKey?: string;
}

export interface PaymentSettings {
  upiId: string; // e.g. "rawatstore@upi"
  backupUpiId?: string; // optional secondary UPI ID
  paymentDisplayName: string; // e.g. "RAWAT CARD STORE"
  paymentInstructions: string; // summary instructions
  instructionSteps?: string[]; // multi-step customer instructions
  securityNotice?: string; // SLA / security note
  activeQrImageUrl: string; // dynamic QR code image URL or data URI
  qrType: 'generated' | 'uploaded';
  minDepositAmount?: number; // minimum deposit in ₹
  maxDepositAmount?: number; // maximum deposit in ₹
  quickPresetAmounts?: number[]; // preset amounts e.g. [100, 250, 500, 1000, 2000, 5000]
  requireUtr?: boolean; // whether customer must provide UTR
  isPaymentActive?: boolean; // toggle payment gateway on/off
  enableUpiIntent?: boolean; // toggle mobile UPI intent deep linking
  enableTestMode?: boolean; // toggle development sandbox mode
  maintenanceMessage?: string; // message if payment is paused
  updatedAt: string;
  updatedBy: string;
  isActive: boolean;
}

export interface AdminAuditLog {
  id: string; // e.g. "LOG-98124"
  action:
    | 'QR_CHANGED'
    | 'PAYMENT_APPROVED'
    | 'PAYMENT_REJECTED'
    | 'BALANCE_CREDITED'
    | 'BALANCE_DEBITED'
    | 'PRODUCT_CREATED'
    | 'PRODUCT_UPDATED'
    | 'PRODUCT_DELETED'
    | 'USER_STATUS_UPDATED'
    | 'USER_UPDATED'
    | 'USER_DELETED'
    | 'ROLE_CHANGED'
    | 'SETTINGS_UPDATED'
    | 'ORDER_REFUNDED'
    | 'REFUND_REQUESTED';
  adminId: string;
  adminUsername: string;
  targetUserId?: string;
  targetUsername?: string;
  amount?: number;
  timestamp: string;
  reason: string;
  metadata?: Record<string, any>;
}

export interface CardProduct {
  id: string;
  name: string;
  tagline: string;
  tier: CardTier;
  finish: CardFinish;
  network?: CardNetwork;
  rarity?: CardRarity;
  holographicOverlay?: HolographicOverlayType;
  price: number; // in INR (₹)
  originalPrice?: number; // Strike-through base price if on flash discount
  isFlashDeal?: boolean; // Flash Deal Active
  flashDiscountPercent?: number; // e.g. 50 (%)
  flashEndsAt?: string; // ISO Countdown timestamp
  flashDealLabel?: string; // e.g. "50% OFF - LIMITED DROP"
  limit?: number; // Overall Spending/Credit limit in INR, e.g. 150000
  dailyLimit?: number; // Daily Transaction/Withdrawal limit in INR, e.g. 50000
  monthlyLimit?: number; // Monthly Transaction limit in INR, e.g. 150000
  status: 'AVAILABLE' | 'LIMITED' | 'VAULT_ONLY' | 'SOLD';
  cardNumber?: string; // Full unmasked card number e.g. "4532 8912 3456 4821"
  maskedIdentifier: string; // e.g. "•••• •••• •••• 4821"
  expMonth?: string; // e.g. "08"
  expYear?: string; // e.g. "2031" or "31"
  expDate: string; // e.g. "08/31"
  cvv: string; // e.g. "821"
  cardHolder?: string; // e.g. "RAWAT VIP HOLDER"
  bankName?: string; // e.g. "RAWAT RESERVE BANK"
  cardPin?: string; // e.g. "4821"
  licenseKey?: string; // Secret Vault License Key e.g. "RWT-VAULT-8912-7492-X9"
  giftCode?: string; // Instant Redeemable Code e.g. "GIFT-RAWAT-88192"
  edition: string; // e.g. "Genesis Edition #01"
  description: string;
  perks: string[];
  stockCount: number;
  featured?: boolean;
  accentColor: string; // hex for glow / ambient
  gradientClass: string;
  borderGlowClass: string;
  createdAt: string;
}

export interface OrderRecord {
  id: string; // e.g. "ORDER #RAWAT1024"
  orderNumber: string; // "RAWAT1024"
  userId?: string;
  username?: string;
  customerEmail?: string;
  cardId: string;
  cardName: string;
  cardTier: CardTier;
  cardFinish: CardFinish;
  cardNetwork?: CardNetwork;
  cardRarity?: CardRarity;
  cardNumber?: string; // Full unmasked 16-digit card number
  maskedIdentifier: string;
  expMonth?: string;
  expYear?: string;
  expDate?: string;
  cvv?: string;
  limit?: number;
  dailyLimit?: number;
  monthlyLimit?: number;
  bankName?: string;
  cardHolder?: string;
  cardPin?: string;
  licenseKey?: string; // Instant Decrypted License Key
  giftCode?: string; // Instant Redeem Code
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
  couponUsed?: string;
  status: 'COMPLETED' | 'VAULT ARCHIVED' | 'REFUNDED';
  refundStatus?: 'NONE' | 'REQUESTED' | 'APPROVED' | 'COMPLETED' | 'REJECTED';
  refundReason?: string;
  refundRequestedAt?: string;
  refundProcessedAt?: string;
  purchaseDate: string;
  transactionRef: string; // e.g. "TXN-RAWAT-948210"
  vaultTokenId: string; // e.g. "RWT-VLT-7719"
  createdAt?: string;
}

// Interactive Lucky Cashback Scratch Card
export interface ScratchCardRecord {
  id: string; // e.g. "SCRATCH-98124"
  userId: string;
  depositAmount: number;
  rewardAmount: number; // in ₹ e.g. 50
  rewardType: 'CASHBACK' | 'BONUS_COUPON';
  couponCode?: string;
  isScratched: boolean;
  scratchedAt?: string;
  createdAt: string;
}

// Alias for backwards compatibility if needed
export type DemoOrder = OrderRecord;

export interface PromoCoupon {
  id: string;
  code: string; // e.g. "RAWAT20"
  discountType: 'percentage' | 'flat';
  discountValue: number; // e.g. 20 (for 20%) or 100 (for ₹100)
  minOrderValue?: number;
  description: string;
  isActive: boolean;
  usageCount: number;
  expiresAt?: string;
}

export interface UserNotification {
  id: string;
  userId?: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'order' | 'coupon' | 'security' | 'system' | 'payment' | 'wallet';
}

export interface UserProfile {
  name: string;
  role: string;
  avatarSeed: string;
  walletBalance: number; // store credits in ₹
  membershipTier: string;
  joinedDate: string;
  email: string;
}

// VIP Tier System
export type VIPTier = 'STANDARD' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'OBSIDIAN';

export interface VIPConfig {
  tier: VIPTier;
  label: string;
  discountPercent: number;
  depositBonusPercent: number;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  glowClass: string;
  perks: string[];
}

// Support & Resolution Center
export interface SupportTicket {
  id: string; // e.g. "TCK-8921"
  userId: string;
  username: string;
  email: string;
  subject: string;
  category: 'PAYMENT' | 'ORDER' | 'CARD_ISSUE' | 'WALLET' | 'OTHER';
  message: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  createdAt: string;
  resolvedAt?: string;
  adminReply?: string;
  adminUsername?: string;
}

// Broadcast Notification & Banner Alert System
export interface StoreAnnouncement {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SALE' | 'ALERT' | 'UPDATE';
  isActive: boolean;
  createdAt: string;
  expiresAt?: string;
  targetTier?: 'ALL' | VIPTier;
}

// Dynamic Referral Program Configuration
export interface ReferralSettings {
  signupBonusReferrer: number; // e.g. 50 (₹50)
  signupBonusReferred: number; // e.g. 50 (₹50)
  commissionPercent: number; // e.g. 20 (20%)
  minDepositForCommission: number; // e.g. 100 (₹100)
  isActive: boolean;
  updatedAt: string;
}

// Automated Fraud Detection & Security Flagging
export interface FraudAlert {
  id: string;
  userId: string;
  username: string;
  type: 'RAPID_ORDERS' | 'FAILED_TRANSACTIONS' | 'UNUSUAL_DEPOSIT' | 'MULTIPLE_ACCOUNTS';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  timestamp: string;
  resolved: boolean;
  actionTaken?: string;
}

// Toast Alert System
export interface ToastNotification {
  id: string;
  userId?: string;
  type: 'referral_reward' | 'deposit_success' | 'order_success' | 'bonus' | 'info' | 'error' | 'success';
  title: string;
  message: string;
  amount?: number;
  referredUsername?: string;
  friendDepositAmount?: number;
  commissionPercent?: number;
  timestamp: string;
  duration?: number; // Duration in ms before auto dismiss
  actionLabel?: string;
  actionTab?: string;
}

// In-App Realtime Live Chat Message
export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  senderRole: 'customer' | 'admin' | 'bot';
  senderName: string;
  avatarSeed?: string;
  text: string;
  timestamp: string;
  isQuickFaq?: boolean;
  category?: 'PAYMENT' | 'DELIVERY' | 'VIP' | 'GENERAL' | 'DISCOUNT';
}

// In-App Realtime Live Chat Thread
export interface ChatThread {
  id: string;
  userId: string;
  username: string;
  userEmail?: string;
  lastMessage: string;
  lastMessageTimestamp: string;
  unreadAdminCount: number;
  unreadUserCount: number;
  status: 'OPEN' | 'RESOLVED';
  createdAt: string;
}

export interface AuthCelebrationData {
  type: 'login' | 'register';
  user: UserAccount;
  bonusGranted?: boolean;
}


