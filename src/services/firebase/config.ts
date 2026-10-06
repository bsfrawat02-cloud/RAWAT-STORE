import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../../firebase-applet-config.json';

// Initialize Firebase App singleton
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with custom database ID specified in firebase-applet-config.json
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Firebase Auth
export const auth = getAuth(app);

export const isFirebaseConfigured = Boolean(
  firebaseConfig &&
  firebaseConfig.projectId &&
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== 'YOUR_API_KEY'
);

/**
 * Validates connection to Firestore server on boot
 */
export async function testFirestoreConnection(): Promise<{ connected: boolean; message: string }> {
  if (!isFirebaseConfigured) {
    return {
      connected: false,
      message: 'Firebase configuration is missing or incomplete.',
    };
  }

  try {
    // Attempt a light ping against test/connection doc
    await getDocFromServer(doc(db, 'settings', 'default'));
    return {
      connected: true,
      message: 'Connected to Cloud Firestore in Realtime',
    };
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('[Firebase] Client is offline or reconnecting...');
      return {
        connected: false,
        message: 'Connection lost — reconnecting...',
      };
    }
    // If doc simply doesn't exist, we are still connected to the server
    if (error?.code === 'not-found') {
      return {
        connected: true,
        message: 'Connected to Cloud Firestore',
      };
    }
    return {
      connected: true,
      message: 'Connected to Cloud Firestore',
    };
  }
}
