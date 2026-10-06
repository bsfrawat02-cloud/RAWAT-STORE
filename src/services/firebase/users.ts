import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db, auth } from './config';
import { handleFirestoreError, OperationType, sanitizeFirestoreData } from './error';
import { UserAccount } from '../../types';

const COLLECTION_NAME = 'users';

export function subscribeUsers(
  onSuccess: (users: UserAccount[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const usersRef = collection(db, COLLECTION_NAME);

  return onSnapshot(
    usersRef,
    (snapshot) => {
      const users: UserAccount[] = [];
      snapshot.forEach((docSnap) => {
        users.push({ id: docSnap.id, ...(docSnap.data() as Omit<UserAccount, 'id'>) });
      });
      onSuccess(users);
    },
    (error) => {
      console.warn('[Firestore] Error in users realtime subscription:', error);
      if (onError) onError(error);
    }
  );
}

export async function getUserById(userId: string): Promise<UserAccount | null> {
  const docRef = doc(db, COLLECTION_NAME, userId);
  try {
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...(snap.data() as Omit<UserAccount, 'id'>) };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${COLLECTION_NAME}/${userId}`);
  }
}

export async function getUserByEmail(email: string): Promise<UserAccount | null> {
  const usersRef = collection(db, COLLECTION_NAME);
  const q = query(usersRef, where('email', '==', email.toLowerCase().trim()));
  try {
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const docSnap = snapshot.docs[0];
    return { id: docSnap.id, ...(docSnap.data() as Omit<UserAccount, 'id'>) };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
  }
}

export async function getUserByUsername(username: string): Promise<UserAccount | null> {
  const usersRef = collection(db, COLLECTION_NAME);
  const q = query(usersRef, where('username', '==', username.toLowerCase().trim()));
  try {
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const docSnap = snapshot.docs[0];
    return { id: docSnap.id, ...(docSnap.data() as Omit<UserAccount, 'id'>) };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
  }
}

export async function getUserByReferralCode(referralCode: string): Promise<UserAccount | null> {
  const usersRef = collection(db, COLLECTION_NAME);
  const q = query(usersRef, where('referralCode', '==', referralCode.trim().toUpperCase()));
  try {
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const docSnap = snapshot.docs[0];
    return { id: docSnap.id, ...(docSnap.data() as Omit<UserAccount, 'id'>) };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
  }
}

export async function createUserProfile(user: UserAccount): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, user.id);
  const rawPayload = {
    username: user.username.toLowerCase().trim(),
    fullName: user.fullName || user.username,
    phone: user.phone || '',
    email: user.email.toLowerCase().trim(),
    passwordHash: user.passwordHash || '',
    role: user.role || 'customer',
    isEmailVerified: true,
    verificationCode: '',
    verificationToken: '',
    verificationSentAt: new Date().toISOString(),
    status: user.status || 'active',
    avatarSeed: user.avatarSeed || user.username,
    membershipTier: user.membershipTier || 'ROYAL BLACK',
    createdAt: user.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLoginAt: user.lastLoginAt || new Date().toISOString(),
    referralCode: user.referralCode || `RAWAT-${Math.floor(1000 + Math.random() * 9000)}`,
    referredBy: user.referredBy || null,
    totalReferralCommissionEarned: user.totalReferralCommissionEarned || 0,
    totalReferralBonusEarned: user.totalReferralBonusEarned || 0,
    wishlist: user.wishlist || [],
  };

  const payload = sanitizeFirestoreData(rawPayload);

  try {
    await setDoc(docRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${COLLECTION_NAME}/${user.id}`);
  }
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<UserAccount>
): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, userId);
  const rawPayload: Record<string, any> = {
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  if (rawPayload.email) rawPayload.email = rawPayload.email.toLowerCase().trim();
  if (rawPayload.username) rawPayload.username = rawPayload.username.toLowerCase().trim();

  const payload = sanitizeFirestoreData(rawPayload);

  try {
    await updateDoc(docRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${userId}`);
  }
}

export async function deleteUserProfile(userId: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, userId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${userId}`);
  }
}

/**
 * Clear ownedCardIds for all user accounts in Firestore
 */
export async function clearAllUsersOwnedCards(): Promise<void> {
  try {
    const usersSnap = await getDocs(collection(db, COLLECTION_NAME));
    for (const d of usersSnap.docs) {
      await updateDoc(doc(db, COLLECTION_NAME, d.id), {
        ownedCardIds: [],
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.warn('[Firestore] Error clearing owned cards for users:', error);
  }
}

