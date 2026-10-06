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
  orderBy,
  Unsubscribe,
} from 'firebase/firestore';
import { db, auth } from './config';
import { handleFirestoreError, OperationType, sanitizeFirestoreData } from './error';
import { CardProduct } from '../../types';

const COLLECTION_NAME = 'products';

/**
 * Real-time listener for all card products
 */
export function subscribeProducts(
  onSuccess: (products: CardProduct[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const productsRef = collection(db, COLLECTION_NAME);
  return onSnapshot(
    productsRef,
    (snapshot) => {
      const products: CardProduct[] = [];
      snapshot.forEach((docSnap) => {
        products.push({ id: docSnap.id, ...(docSnap.data() as Omit<CardProduct, 'id'>) });
      });
      onSuccess(products);
    },
    (error) => {
      console.warn('[Firestore] Error in products realtime subscription:', error);
      if (onError) onError(error);
      try {
        handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
      } catch {}
    }
  );
}

/**
 * Fetch all products once
 */
export async function getProducts(): Promise<CardProduct[]> {
  const productsRef = collection(db, COLLECTION_NAME);
  try {
    const snapshot = await getDocs(productsRef);
    const products: CardProduct[] = [];
    snapshot.forEach((docSnap) => {
      products.push({ id: docSnap.id, ...(docSnap.data() as Omit<CardProduct, 'id'>) });
    });
    return products;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
  }
}

/**
 * Add a new card product to Firestore
 */
export async function addProduct(product: CardProduct): Promise<CardProduct> {
  const finalId = product.id || `CARD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const docRef = doc(db, COLLECTION_NAME, finalId);
  const payload = sanitizeFirestoreData<CardProduct>({
    ...product,
    id: finalId,
    createdAt: product.createdAt || new Date().toISOString(),
  });

  if (!auth.currentUser) {
    console.warn(`[Firestore] Skipping remote product add for ${finalId} because user is not authenticated.`);
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
 * Update an existing card product in Firestore
 */
export async function updateProduct(
  id: string,
  updates: Partial<CardProduct>
): Promise<void> {
  if (!auth.currentUser) {
    return;
  }
  const docRef = doc(db, COLLECTION_NAME, id);
  try {
    const payload = sanitizeFirestoreData(updates);
    await updateDoc(docRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
  }
}

/**
 * Delete a card product from Firestore
 */
export async function deleteProduct(id: string): Promise<void> {
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
 * Reset all products to AVAILABLE status with full stock count
 */
export async function resetAllProductsToAvailable(): Promise<void> {
  try {
    const productsSnap = await getDocs(collection(db, COLLECTION_NAME));
    for (const d of productsSnap.docs) {
      const data = d.data();
      if (data.status === 'SOLD' || (data.stockCount !== undefined && data.stockCount <= 0)) {
        await updateDoc(doc(db, COLLECTION_NAME, d.id), {
          status: 'AVAILABLE',
          stockCount: 1,
        });
      }
    }
  } catch (error) {
    console.warn('[Firestore] Error resetting products to available:', error);
  }
}

