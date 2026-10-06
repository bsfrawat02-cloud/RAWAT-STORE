import {
  collection,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  Unsubscribe,
} from 'firebase/firestore';
import { db, auth } from './config';
import { handleFirestoreError, OperationType, sanitizeFirestoreData } from './error';
import { ChatMessage, ChatThread } from '../../types';

const CHATS_COLLECTION = 'chats';
const MESSAGES_SUBCOLLECTION = 'messages';

/**
 * Real-time listener for user chat messages
 */
export function subscribeChatMessages(
  userId: string,
  onSuccess: (messages: ChatMessage[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  if (!auth.currentUser || !userId) {
    return () => {};
  }

  const isSuperAdminEmail =
    auth.currentUser.email === 'admin@rawatcards.com' ||
    auth.currentUser.email === 'sudhirffverma@gmail.com';

  if (auth.currentUser.uid !== userId && !isSuperAdminEmail) {
    return () => {};
  }

  const messagesRef = collection(db, CHATS_COLLECTION, userId, MESSAGES_SUBCOLLECTION);
  const q = query(messagesRef, orderBy('timestamp', 'asc'), limit(100));

  return onSnapshot(
    q,
    (snapshot) => {
      const msgs: ChatMessage[] = [];
      snapshot.forEach((docSnap) => {
        msgs.push({ id: docSnap.id, ...(docSnap.data() as Omit<ChatMessage, 'id'>) });
      });
      onSuccess(msgs);
    },
    (error) => {
      console.warn('[Firestore] Error in chat messages realtime listener:', error);
      if (onError) onError(error);
      try {
        handleFirestoreError(error, OperationType.GET, `${CHATS_COLLECTION}/${userId}/${MESSAGES_SUBCOLLECTION}`);
      } catch {}
    }
  );
}

/**
 * Real-time listener for all admin chat threads
 */
export function subscribeAllChatThreads(
  onSuccess: (threads: ChatThread[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  if (!auth.currentUser) {
    return () => {};
  }

  const isSuperAdminEmail =
    auth.currentUser.email === 'admin@rawatcards.com' ||
    auth.currentUser.email === 'sudhirffverma@gmail.com';

  if (!isSuperAdminEmail) {
    return () => {};
  }

  const chatsRef = collection(db, CHATS_COLLECTION);
  const q = query(chatsRef, orderBy('lastMessageTimestamp', 'desc'), limit(50));

  return onSnapshot(
    q,
    (snapshot) => {
      const threads: ChatThread[] = [];
      snapshot.forEach((docSnap) => {
        threads.push({ id: docSnap.id, ...(docSnap.data() as Omit<ChatThread, 'id'>) });
      });
      onSuccess(threads);
    },
    (error) => {
      console.warn('[Firestore] Error in chat threads realtime listener:', error);
      if (onError) onError(error);
      try {
        handleFirestoreError(error, OperationType.GET, CHATS_COLLECTION);
      } catch {}
    }
  );
}

/**
 * Send a message in a chat thread
 */
export async function sendChatMessage(params: {
  userId: string;
  username: string;
  userEmail?: string;
  senderRole: 'customer' | 'admin' | 'bot';
  senderName: string;
  avatarSeed?: string;
  text: string;
  isQuickFaq?: boolean;
  category?: 'PAYMENT' | 'DELIVERY' | 'VIP' | 'GENERAL' | 'DISCOUNT';
}): Promise<ChatMessage> {
  const { userId, username, userEmail, senderRole, senderName, avatarSeed, text, isQuickFaq, category } = params;
  const msgId = `msg-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
  const now = new Date().toISOString();

  const msgPayload: ChatMessage = {
    id: msgId,
    userId,
    username,
    senderRole,
    senderName,
    avatarSeed: avatarSeed || 'rawat-bot',
    text,
    timestamp: now,
    isQuickFaq: isQuickFaq || false,
    category: category || 'GENERAL',
  };

  if (!auth.currentUser) {
    return msgPayload;
  }

  const threadDocRef = doc(db, CHATS_COLLECTION, userId);
  const msgDocRef = doc(db, CHATS_COLLECTION, userId, MESSAGES_SUBCOLLECTION, msgId);

  try {
    // 1. Write the message document
    await setDoc(msgDocRef, sanitizeFirestoreData(msgPayload));

    // 2. Upsert thread summary
    const threadData: Partial<ChatThread> = {
      id: userId,
      userId,
      username,
      userEmail: userEmail || `${username}@rawatcards.com`,
      lastMessage: text,
      lastMessageTimestamp: now,
      status: 'OPEN',
    };

    if (senderRole === 'customer') {
      threadData.unreadAdminCount = 1;
    } else {
      threadData.unreadUserCount = 1;
    }

    await setDoc(threadDocRef, sanitizeFirestoreData(threadData), { merge: true });

    return msgPayload;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${CHATS_COLLECTION}/${userId}/${MESSAGES_SUBCOLLECTION}/${msgId}`);
  }
}
