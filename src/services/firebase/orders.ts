import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  Unsubscribe,
} from 'firebase/firestore';
import { db, auth } from './config';
import { handleFirestoreError, OperationType, sanitizeFirestoreData } from './error';
import { OrderRecord } from '../../types';

const COLLECTION_NAME = 'orders';

/**
 * Real-time listener for orders with fallback and client-side timestamp sorting
 */
export function subscribeOrders(
  onSuccess: (orders: OrderRecord[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const ordersRef = collection(db, COLLECTION_NAME);
  
  return onSnapshot(
    ordersRef,
    (snapshot) => {
      const orderList: OrderRecord[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Omit<OrderRecord, 'id'>;
        orderList.push({ id: docSnap.id, ...data });
      });

      // Sort newest first by purchaseDate or id
      orderList.sort((a, b) => {
        const dateA = new Date(a.purchaseDate || 0).getTime();
        const dateB = new Date(b.purchaseDate || 0).getTime();
        if (dateA && dateB && dateA !== dateB) return dateB - dateA;
        return b.id.localeCompare(a.id);
      });

      onSuccess(orderList);
    },
    (error) => {
      console.warn('[Firestore] Error in orders realtime subscription:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Create a new card order in Firestore
 */
export async function createOrder(order: OrderRecord): Promise<OrderRecord> {
  const docRef = doc(db, COLLECTION_NAME, order.id);
  const nowIso = new Date().toISOString();
  const payload = sanitizeFirestoreData<OrderRecord>({
    ...order,
    purchaseDate: order.purchaseDate || nowIso,
    status: order.status || 'COMPLETED',
  });

  try {
    await setDoc(docRef, payload);
    return payload;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${COLLECTION_NAME}/${order.id}`);
    throw error;
  }
}

/**
 * Update order status
 */
export async function updateOrderStatus(orderId: string, status: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, orderId);
  try {
    await updateDoc(docRef, { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${orderId}`);
    throw error;
  }
}

/**
 * Update order with arbitrary partial fields
 */
export async function updateOrder(orderId: string, updates: Partial<OrderRecord>): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, orderId);
  try {
    const payload = sanitizeFirestoreData(updates);
    await updateDoc(docRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${orderId}`);
    throw error;
  }
}

/**
 * Delete a specific order from Firestore
 */
export async function deleteOrder(orderId: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, orderId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${orderId}`);
    throw error;
  }
}

/**
 * Delete all orders from Firestore (wipe purchasing history completely)
 */
export async function deleteAllOrders(): Promise<{ deletedCount: number }> {
  try {
    const ordersSnap = await getDocs(collection(db, COLLECTION_NAME));
    let count = 0;
    for (const d of ordersSnap.docs) {
      await deleteDoc(doc(db, COLLECTION_NAME, d.id));
      count++;
    }
    return { deletedCount: count };
  } catch (error) {
    console.warn('[Firestore] Error deleting all orders:', error);
    return { deletedCount: 0 };
  }
}



