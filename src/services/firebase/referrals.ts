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
import { ReferralRecord } from '../../types';

const COLLECTION_NAME = 'referrals';

/**
 * Real-time listener for referrals
 */
export function subscribeReferrals(
  onSuccess: (referrals: ReferralRecord[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const refRef = collection(db, COLLECTION_NAME);

  return onSnapshot(
    refRef,
    (snapshot) => {
      const list: ReferralRecord[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...(docSnap.data() as Omit<ReferralRecord, 'id'>) });
      });
      list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      onSuccess(list);
    },
    (error) => {
      console.warn('[Firestore] Error in referrals realtime subscription:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Create a new referral link record
 */
export async function createReferralRecord(ref: ReferralRecord): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, ref.id);
  try {
    const payload = sanitizeFirestoreData({
      ...ref,
      createdAt: ref.createdAt || new Date().toISOString(),
    });
    await setDoc(docRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${COLLECTION_NAME}/${ref.id}`);
  }
}

/**
 * Update an existing referral record
 */
export async function updateReferralRecord(
  id: string,
  updates: Partial<ReferralRecord>
): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  try {
    const payload = sanitizeFirestoreData(updates);
    await updateDoc(docRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
  }
}
