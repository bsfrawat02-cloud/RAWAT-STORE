import { collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from './config';
import { DEFAULT_CARDS } from '../../data/defaultCards';
import { DEFAULT_COUPONS } from '../../data/defaultCoupons';
import { DEFAULT_STORE_SETTINGS } from './settings';
import { DEFAULT_USERS, DEFAULT_WALLETS } from '../../data/defaultAuth';
import { handleFirestoreError, OperationType } from './error';

/**
 * Checks Firestore and seeds initial products, settings, coupons, and super admin if empty.
 */
export async function seedInitialFirestoreData(): Promise<{
  seeded: boolean;
  message: string;
}> {
  try {
    // 1. Check products collection
    const productsSnap = await getDocs(collection(db, 'products'));
    let didSeed = false;

    if (productsSnap.empty) {
      console.log('[Firestore Auto-Seed] Seeding initial cards to Firestore...');
      for (const card of DEFAULT_CARDS) {
        await setDoc(doc(db, 'products', card.id), card);
      }
      didSeed = true;
    } else {
      // Ensure existing seeded products have the new 10x+ limits
      for (const card of DEFAULT_CARDS) {
        const existingDoc = productsSnap.docs.find((d) => d.id === card.id);
        if (existingDoc) {
          const data = existingDoc.data();
          // If limit is still the old legacy inflated limit (> 50,000 for standard cards) or not matching
          if (!data.limit || data.limit > 50000 || data.limit !== card.limit) {
            await setDoc(
              doc(db, 'products', card.id),
              {
                ...data,
                limit: card.limit,
                dailyLimit: card.dailyLimit,
                monthlyLimit: card.monthlyLimit,
              },
              { merge: true }
            );
            didSeed = true;
          }
        }
      }
    }

    // 2. Check settings document
    const settingsDoc = await getDoc(doc(db, 'settings', 'default'));
    if (!settingsDoc.exists()) {
      console.log('[Firestore Auto-Seed] Seeding initial payment settings to Firestore...');
      await setDoc(doc(db, 'settings', 'default'), DEFAULT_STORE_SETTINGS);
      didSeed = true;
    } else {
      const data = settingsDoc.data();
      // If document has old placeholder/previous UPI or old QR, update to latest official credentials
      if (
        !data?.upiId ||
        data.upiId === 'rawatenterprise@okaxis' ||
        data.upiId === 'rawatpay@upi' ||
        data.upiId === 'rawathack@ybl' ||
        data.upiId !== 'rawatcard@ybl' ||
        data.activeQrImageUrl === 'https://lh3.googleusercontent.com/d/13hn5unscjU105FPmZjvgmH0R_PKRz8QJ'
      ) {
        console.log('[Firestore Auto-Seed] Updating payment settings with official UPI & QR...');
        await setDoc(doc(db, 'settings', 'default'), {
          ...DEFAULT_STORE_SETTINGS,
          ...data,
          upiId: 'rawatcard@ybl',
          backupUpiId: 'rawatcard@ibl',
          activeQrImageUrl: 'https://lh3.googleusercontent.com/d/19IDRv9zFW6o6-q0BoUhuG1D6oOYtUJfq',
          qrType: 'uploaded',
          updatedAt: new Date().toISOString(),
        });
        didSeed = true;
      }
    }

    // 3. Check coupons collection
    const couponsSnap = await getDocs(collection(db, 'coupons'));
    if (couponsSnap.empty) {
      console.log('[Firestore Auto-Seed] Seeding initial promo coupons to Firestore...');
      for (const coupon of DEFAULT_COUPONS) {
        await setDoc(doc(db, 'coupons', coupon.id), coupon);
      }
      didSeed = true;
    }

    // 4. Ensure Super Admin account exists in Firestore if authenticated
    if (auth.currentUser) {
      const adminDoc = await getDoc(doc(db, 'users', 'usr_super_admin'));
      if (!adminDoc.exists()) {
        console.log('[Firestore Auto-Seed] Seeding Super Admin account to Firestore...');
        const superAdmin = DEFAULT_USERS[0];
        await setDoc(doc(db, 'users', superAdmin.id), superAdmin);
        await setDoc(doc(db, 'wallets', superAdmin.id), {
          userId: superAdmin.id,
          balance: DEFAULT_WALLETS[superAdmin.id]?.balance || 50000,
          currency: 'INR',
          updatedAt: new Date().toISOString(),
        });
        didSeed = true;
      }
    }

    return {
      seeded: didSeed,
      message: didSeed
        ? 'Successfully seeded initial cards, settings, and coupons to Firestore.'
        : 'Firestore database is populated and up to date.',
    };
  } catch (error) {
    console.warn('[Firestore Auto-Seed Warning]', error);
    return {
      seeded: false,
      message: error instanceof Error ? error.message : String(error),
    };
  }
}
