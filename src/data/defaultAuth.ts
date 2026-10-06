import {
  UserAccount,
  Wallet,
  WalletTransaction,
  PaymentRequest,
  PaymentSettings,
  AdminAuditLog,
  ReferralRecord
} from '../types';
import { generateUpiQrSvg, buildUpiUri, DEFAULT_STORE_QR_IMAGE_URL } from '../utils/qr';
import { buildSimulatedVerificationLink } from '../utils/security';

export const DEFAULT_USERS: UserAccount[] = [
  {
    id: 'usr_super_admin',
    username: 'RAWATCARDER',
    email: 'admin@rawatcards.com',
    passwordHash: 'rawathash_admin_sec_2026',
    role: 'super_admin',
    isEmailVerified: true,
    status: 'active',
    avatarSeed: 'admin-avatar-rawat',
    membershipTier: 'FOUNDER & SUPER ADMIN',
    createdAt: '2026-08-01 00:00:00',
    updatedAt: '2026-08-16 10:00:00',
    lastLoginAt: '2026-08-16 11:00:00',
    referralCode: 'RAWATADMIN',
    totalReferralCommissionEarned: 0,
    totalReferralBonusEarned: 0
  }
];

export const DEFAULT_REFERRALS: ReferralRecord[] = [];

export const DEFAULT_WALLETS: Record<string, Wallet> = {
  usr_super_admin: {
    userId: 'usr_super_admin',
    balance: 50000.0,
    currency: 'INR',
    updatedAt: '2026-08-16 11:00:00'
  }
};

const initialUpiId = 'rawatcard@ybl';
const initialDisplayName = 'PARAMVEER RAWAT';

export const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  upiId: initialUpiId,
  backupUpiId: 'rawatcard@ibl',
  paymentDisplayName: initialDisplayName,
  paymentInstructions: 'Scan this official PhonePe / UPI QR code using Google Pay, PhonePe, Paytm, BHIM or Cred. Enter the exact amount, complete the transfer, and submit your UTR reference for instant verification.',
  instructionSteps: [
    'Open any UPI application on your mobile device (PhonePe, Google Pay, Paytm, BHIM, Cred).',
    'Scan the store QR code above or manually copy our verified UPI ID: rawatcard@ybl (Secondary: rawatcard@ibl).',
    'Enter the exact top-up amount and add your username in the payment notes.',
    'Complete the transaction and copy the 12-digit UPI Reference / UTR number.',
    'Click "I Have Paid" below to submit your payment verification request.'
  ],
  securityNotice: '🛡️ All top-up deposits are verified against store bank records. Typical ledger confirmation takes 5-15 minutes during active business hours.',
  activeQrImageUrl: DEFAULT_STORE_QR_IMAGE_URL,
  qrType: 'uploaded',
  minDepositAmount: 1000,
  maxDepositAmount: 50000,
  quickPresetAmounts: [1000, 1500, 2000, 3000, 5000, 10000],
  requireUtr: false,
  isPaymentActive: true,
  maintenanceMessage: 'UPI deposits are temporarily undergoing scheduled maintenance. Please check back shortly.',
  updatedAt: '2026-08-18 00:00:00',
  updatedBy: 'admin',
  isActive: true
};

export const DEFAULT_TRANSACTIONS: WalletTransaction[] = [];

export const DEFAULT_PAYMENT_REQUESTS: PaymentRequest[] = [];

export const DEFAULT_AUDIT_LOGS: AdminAuditLog[] = [
  {
    id: 'LOG-10291',
    action: 'SETTINGS_UPDATED',
    adminId: 'usr_super_admin',
    adminUsername: 'RAWATCARDER',
    timestamp: '2026-08-16 00:00:00',
    reason: 'Payment Gateway & Live UPI System Initialized',
    metadata: { upiId: initialUpiId, displayName: initialDisplayName }
  }
];
