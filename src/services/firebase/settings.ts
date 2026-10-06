import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './config';
import { handleFirestoreError, OperationType, sanitizeFirestoreData } from './error';
import { PaymentSettings } from '../../types';

const COLLECTION_NAME = 'settings';
const DEFAULT_DOC_ID = 'default';

export const DEFAULT_STORE_SETTINGS: PaymentSettings = {
  upiId: 'rawatcard@ybl',
  backupUpiId: 'rawatcard@ibl',
  paymentDisplayName: 'RAWAT CARD STORE',
  paymentInstructions:
    'Scan the QR code or copy the UPI ID directly in PhonePe, Google Pay, Paytm, or BHIM. Enter the exact Deposit Amount and submit your 12-digit UTR Reference Number.',
  instructionSteps: [
    'Open PhonePe, GooglePay, Paytm, or BHIM UPI app',
    'Scan the QR code above or pay directly to verified UPI: rawatcard@ybl',
    'Enter the exact deposit amount and complete payment safely',
    'Copy the 12-digit UTR/Reference ID from your payment receipt',
    'Submit the UTR number below for instant verification',
  ],
  securityNotice:
    'Payments are verified in real time. Please double-check your 12-digit UTR / Reference ID before submitting.',
  activeQrImageUrl:
    'https://lh3.googleusercontent.com/d/19IDRv9zFW6o6-q0BoUhuG1D6oOYtUJfq',
  qrType: 'uploaded',
  minDepositAmount: 50,
  maxDepositAmount: 50000,
  quickPresetAmounts: [100, 250, 500, 1000, 2000, 5000],
  requireUtr: true,
  isPaymentActive: true,
  maintenanceMessage: '',
  updatedAt: new Date().toISOString(),
  updatedBy: 'PARAMVEER RAWAT (Super Admin)',
  isActive: true,
};

/**
 * Real-time listener for store & payment settings
 */
export function subscribeSettings(
  onSuccess: (settings: PaymentSettings) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const docRef = doc(db, COLLECTION_NAME, DEFAULT_DOC_ID);
  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as PaymentSettings;
        onSuccess({
          ...DEFAULT_STORE_SETTINGS,
          ...data,
        });
      } else {
        onSuccess(DEFAULT_STORE_SETTINGS);
      }
    },
    (error) => {
      console.warn('[Firestore] Error in settings realtime subscription:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, `${COLLECTION_NAME}/${DEFAULT_DOC_ID}`);
    }
  );
}

/**
 * Fetch settings once
 */
export async function getSettings(): Promise<PaymentSettings> {
  const docRef = doc(db, COLLECTION_NAME, DEFAULT_DOC_ID);
  try {
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { ...DEFAULT_STORE_SETTINGS, ...(snap.data() as PaymentSettings) };
    }
    return DEFAULT_STORE_SETTINGS;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${COLLECTION_NAME}/${DEFAULT_DOC_ID}`);
  }
}

/**
 * Update global store settings in Firestore
 */
export async function updateSettings(settings: Partial<PaymentSettings>): Promise<PaymentSettings> {
  const docRef = doc(db, COLLECTION_NAME, DEFAULT_DOC_ID);
  const payload = sanitizeFirestoreData<PaymentSettings>({
    ...DEFAULT_STORE_SETTINGS,
    ...settings,
    updatedAt: new Date().toISOString(),
  });

  try {
    await setDoc(docRef, payload, { merge: true });
    return payload;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTION_NAME}/${DEFAULT_DOC_ID}`);
  }
}
