import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  increment,
  Unsubscribe,
} from 'firebase/firestore';
import { db, auth } from './config';
import { handleFirestoreError, OperationType, sanitizeFirestoreData } from './error';
import { PromoCoupon } from '../../types';

const COLLECTION_NAME = 'coupons';

/**
 * Real-time listener for coupons
 */
export function subscribeCoupons(
  onSuccess: (coupons: PromoCoupon[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const couponsRef = collection(db, COLLECTION_NAME);
  return onSnapshot(
    couponsRef,
    (snapshot) => {
      const list: PromoCoupon[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...(docSnap.data() as Omit<PromoCoupon, 'id'>) });
      });
      onSuccess(list);
    },
    (error) => {
      console.warn('[Firestore] Error in coupons realtime subscription:', error);
      if (onError) onError(error);
      try {
        handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
      } catch {}
    }
  );
}

/**
 * Add a new coupon
 */
export async function addCoupon(coupon: PromoCoupon): Promise<PromoCoupon> {
  const finalId = coupon.id || `CPN-${Date.now()}`;
  const docRef = doc(db, COLLECTION_NAME, finalId);
  const payload = sanitizeFirestoreData<PromoCoupon>({
    ...coupon,
    id: finalId,
    code: coupon.code.toUpperCase().trim(),
    usageCount: coupon.usageCount || 0,
  });

  if (!auth.currentUser) {
    return payload;
  }

  try {
    await setDoc(docRef, payload);
    return payload;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${COLLECTION_NAME}/${finalId}`);
  }
}

/**
 * Update a coupon
 */
export async function updateCoupon(id: string, updates: Partial<PromoCoupon>): Promise<void> {
  if (!auth.currentUser) {
    return;
  }
  const docRef = doc(db, COLLECTION_NAME, id);
  const rawPayload: Partial<PromoCoupon> = { ...updates };
  if (rawPayload.code) rawPayload.code = rawPayload.code.toUpperCase().trim();
  const payload = sanitizeFirestoreData(rawPayload);

  try {
    await updateDoc(docRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
  }
}

/**
 * Delete a coupon
 */
export async function deleteCoupon(id: string): Promise<void> {
  if (!auth.currentUser) {
    return;
  }
  const docRef = doc(db, COLLECTION_NAME, id);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
  }
}

/**
 * Increment coupon usage atomically
 */
export async function incrementCouponUsage(id: string): Promise<void> {
  if (!auth.currentUser) {
    return;
  }
  const docRef = doc(db, COLLECTION_NAME, id);
  try {
    await updateDoc(docRef, {
      usageCount: increment(1),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
  }
}
