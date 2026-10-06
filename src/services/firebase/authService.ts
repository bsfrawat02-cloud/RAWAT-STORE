import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInAnonymously as firebaseSignInAnonymously,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
} from 'firebase/auth';
import { auth } from './config';

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export { auth, onAuthStateChanged };
export type { FirebaseUser };

/**
 * Sign in anonymously for guest visitors
 */
export async function signInAnonymouslyUser(): Promise<FirebaseUser | null> {
  try {
    const cred = await firebaseSignInAnonymously(auth);
    return cred.user;
  } catch (err) {
    console.warn('[Firebase Auth] Anonymous sign-in not available or failed:', err);
    return null;
  }
}

/**
 * Register with Firebase Email/Password
 */
export async function registerFirebaseUser(
  email: string,
  pass: string,
  displayName?: string
): Promise<FirebaseUser> {
  const cred = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), pass);
  if (displayName && cred.user) {
    try {
      await updateProfile(cred.user, { displayName });
    } catch (e) {
      console.warn('[Firebase Auth] Failed to set display name on auth user:', e);
    }
  }
  return cred.user;
}

/**
 * Login with Firebase Email/Password
 */
export async function loginFirebaseUser(email: string, pass: string): Promise<FirebaseUser> {
  const cred = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), pass);
  return cred.user;
}

/**
 * Login with Google Popup
 */
export async function loginWithGoogle(): Promise<FirebaseUser> {
  const cred = await signInWithPopup(auth, googleProvider);
  return cred.user;
}

/**
 * Logout from Firebase Auth
 */
export async function logoutFirebase(): Promise<void> {
  await firebaseSignOut(auth);
}

/**
 * Send password reset email
 */
export async function resetFirebasePassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim().toLowerCase());
}

