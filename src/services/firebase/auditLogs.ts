import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  Unsubscribe,
} from 'firebase/firestore';
import { db, auth } from './config';
import { handleFirestoreError, OperationType, sanitizeFirestoreData } from './error';
import { AdminAuditLog } from '../../types';

const COLLECTION_NAME = 'auditLogs';

export function subscribeAuditLogs(
  onSuccess: (logs: AdminAuditLog[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const logsRef = collection(db, COLLECTION_NAME);
  const q = query(logsRef, orderBy('timestamp', 'desc'), limit(100));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: AdminAuditLog[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...(docSnap.data() as Omit<AdminAuditLog, 'id'>) });
      });
      onSuccess(list);
    },
    (error) => {
      console.warn('[Firestore] Error in auditLogs subscription:', error);
      if (onError) onError(error);
    }
  );
}

export async function createAuditLog(log: AdminAuditLog): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, log.id);
  try {
    const payload = sanitizeFirestoreData({
      ...log,
      timestamp: log.timestamp || new Date().toISOString(),
    });
    await setDoc(docRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${COLLECTION_NAME}/${log.id}`);
  }
}
