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
  runTransaction,
  Unsubscribe,
} from 'firebase/firestore';
import { db, auth } from './config';
import { handleFirestoreError, OperationType, sanitizeFirestoreData } from './error';
import { Wallet, WalletTransaction, TransactionType, TransactionStatus } from '../../types';

const WALLETS_COLLECTION = 'wallets';
const TRANSACTIONS_COLLECTION = 'transactions';

/**
 * Real-time listener for all wallets
 */
export function subscribeWallets(
  onSuccess: (walletsMap: Record<string, Wallet>) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const walletsRef = collection(db, WALLETS_COLLECTION);

  return onSnapshot(
    walletsRef,
    (snapshot) => {
      const walletsMap: Record<string, Wallet> = {};
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        walletsMap[docSnap.id] = {
          userId: docSnap.id,
          balance: Number(data.balance ?? 0),
          currency: data.currency || 'INR',
          updatedAt: data.updatedAt || new Date().toISOString(),
        };
      });
      onSuccess(walletsMap);
    },
    (error) => {
      console.warn('[Firestore] Error in wallets realtime subscription:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Fetch wallet for a specific user
 */
export async function getWallet(userId: string): Promise<Wallet | null> {
  const docRef = doc(db, WALLETS_COLLECTION, userId);
  try {
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      userId: snap.id,
      balance: Number(data.balance ?? 0),
      currency: data.currency || 'INR',
      updatedAt: data.updatedAt || new Date().toISOString(),
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${WALLETS_COLLECTION}/${userId}`);
  }
}

/**
 * Ensure user wallet exists
 */
export async function ensureWalletExists(
  userId: string,
  initialBalance: number = 0
): Promise<Wallet> {
  const docRef = doc(db, WALLETS_COLLECTION, userId);
  try {
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        userId: snap.id,
        balance: Number(data.balance ?? 0),
        currency: data.currency || 'INR',
        updatedAt: data.updatedAt || new Date().toISOString(),
      };
    }

    const newWallet: Wallet = {
      userId,
      balance: Math.max(0, initialBalance),
      currency: 'INR',
      updatedAt: new Date().toISOString(),
    };
    await setDoc(docRef, newWallet);
    return newWallet;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${WALLETS_COLLECTION}/${userId}`);
  }
}

/**
 * Real-time listener for all transactions
 */
export function subscribeTransactions(
  onSuccess: (transactions: WalletTransaction[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const txnsRef = collection(db, TRANSACTIONS_COLLECTION);

  return onSnapshot(
    txnsRef,
    (snapshot) => {
      const list: WalletTransaction[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...(docSnap.data() as Omit<WalletTransaction, 'id'>) });
      });
      list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      onSuccess(list);
    },
    (error) => {
      console.warn('[Firestore] Error in transactions realtime subscription:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Create a standalone transaction record in the ledger
 */
export async function createTransactionRecord(txn: WalletTransaction): Promise<void> {
  const docRef = doc(db, TRANSACTIONS_COLLECTION, txn.id);
  try {
    const payload = sanitizeFirestoreData({
      ...txn,
      createdAt: txn.createdAt || new Date().toISOString(),
    });
    await setDoc(docRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${TRANSACTIONS_COLLECTION}/${txn.id}`);
  }
}

/**
 * Execute an atomic balance adjustment and append transaction in Firestore
 */
export async function adjustWalletBalance(params: {
  userId: string;
  username: string;
  amount: number; // positive for credit, negative for debit
  type: TransactionType;
  description: string;
  reason?: string;
  createdBy: string;
  referenceId?: string;
  status?: TransactionStatus;
}): Promise<{ success: boolean; newBalance: number; transaction: WalletTransaction }> {
  const { userId, username, amount, type, description, reason, createdBy, referenceId, status = 'COMPLETED' } = params;
  const txnId = `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const nowIso = new Date().toISOString();

  const rawTxn: WalletTransaction = {
    id: txnId,
    userId,
    username,
    type,
    amount,
    balanceBefore: 0,
    balanceAfter: Math.max(0, amount),
    status,
    description,
    reason: reason || '',
    createdBy,
    createdAt: nowIso,
    referenceId: referenceId || '',
  };

  const walletDocRef = doc(db, WALLETS_COLLECTION, userId);
  const txnDocRef = doc(db, TRANSACTIONS_COLLECTION, txnId);

  try {
    const result = await runTransaction(db, async (transaction) => {
      const walletSnap = await transaction.get(walletDocRef);
      let currentBalance = 0;
      if (walletSnap.exists()) {
        currentBalance = Number(walletSnap.data().balance ?? 0);
      }

      const balanceBefore = currentBalance;
      const balanceAfter = Math.max(0, Math.round((currentBalance + amount) * 100) / 100);

      const walletPayload = sanitizeFirestoreData({
        userId,
        balance: balanceAfter,
        currency: 'INR',
        updatedAt: nowIso,
      });

      transaction.set(walletDocRef, walletPayload, { merge: true });

      rawTxn.balanceBefore = balanceBefore;
      rawTxn.balanceAfter = balanceAfter;

      const txnPayload = sanitizeFirestoreData(rawTxn);

      transaction.set(txnDocRef, txnPayload);

      return {
        newBalance: balanceAfter,
        transaction: rawTxn,
      };
    });

    return {
      success: true,
      newBalance: result.newBalance,
      transaction: result.transaction,
    };
  } catch (error) {
    console.error('[Firestore] Error adjusting wallet balance in transaction:', error);
    handleFirestoreError(error, OperationType.WRITE, `${WALLETS_COLLECTION}/${userId}`);
    return {
      success: false,
      newBalance: 0,
      transaction: rawTxn,
    };
  }
}

/**
 * Delete a specific transaction
 */
export async function deleteTransaction(txnId: string): Promise<void> {
  const docRef = doc(db, TRANSACTIONS_COLLECTION, txnId);
  try {
    const { deleteDoc } = await import('firebase/firestore');
    await deleteDoc(docRef);
  } catch (error) {
    console.warn('[Firestore] Error deleting transaction:', error);
  }
}

/**
 * Clear all purchase-related transactions from Firestore
 */
export async function clearPurchaseTransactions(): Promise<void> {
  try {
    const { deleteDoc } = await import('firebase/firestore');
    const txnsSnap = await getDocs(collection(db, TRANSACTIONS_COLLECTION));
    for (const d of txnsSnap.docs) {
      const data = d.data();
      if (data.type === 'PRODUCT_PURCHASE' || data.type === 'REFUND') {
        await deleteDoc(doc(db, TRANSACTIONS_COLLECTION, d.id));
      }
    }
  } catch (error) {
    console.warn('[Firestore] Error clearing purchase transactions:', error);
  }
}

