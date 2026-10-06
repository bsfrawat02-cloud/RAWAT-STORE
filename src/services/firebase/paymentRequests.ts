import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  Unsubscribe,
} from 'firebase/firestore';
import { db, auth } from './config';
import { handleFirestoreError, OperationType, sanitizeFirestoreData } from './error';
import { PaymentRequest, PaymentRequestStatus } from '../../types';

const COLLECTION_NAME = 'paymentRequests';

/**
 * Real-time listener for payment deposit requests
 */
export function subscribePaymentRequests(
  onSuccess: (requests: PaymentRequest[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const reqRef = collection(db, COLLECTION_NAME);

  return onSnapshot(
    reqRef,
    (snapshot) => {
      const list: PaymentRequest[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...(docSnap.data() as Omit<PaymentRequest, 'id'>) });
      });
      // Sort in memory
      list.sort((a, b) => new Date(b.requestedAt || 0).getTime() - new Date(a.requestedAt || 0).getTime());
      onSuccess(list);
    },
    (error) => {
      console.warn('[Firestore] Error in paymentRequests realtime subscription:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Create a new payment request in Firestore
 */
export async function createPaymentRequest(req: PaymentRequest): Promise<PaymentRequest> {
  const docRef = doc(db, COLLECTION_NAME, req.id);
  const payload = sanitizeFirestoreData<PaymentRequest>({
    ...req,
    requestedAt: req.requestedAt || new Date().toISOString(),
  });

  try {
    await setDoc(docRef, payload);
    return payload;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${COLLECTION_NAME}/${req.id}`);
    return payload;
  }
}

/**
 * Update payment request status & metadata
 */
export async function updatePaymentRequest(
  id: string,
  updates: Partial<PaymentRequest>
): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  try {
    const payload = sanitizeFirestoreData({
      ...updates,
      reviewedAt: updates.reviewedAt || (updates.status === 'APPROVED' || updates.status === 'SUCCESS' || updates.status === 'REJECTED' ? new Date().toISOString() : undefined),
    });
    await setDoc(docRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
  }
}

/**
 * Get single payment request
 */
export async function getPaymentRequest(id: string): Promise<PaymentRequest | null> {
  const docRef = doc(db, COLLECTION_NAME, id);
  try {
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...(snap.data() as Omit<PaymentRequest, 'id'>) };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${COLLECTION_NAME}/${id}`);
    return null;
  }
}
