import { isSupabaseConfigured, checkSupabaseSchemaReady } from './client';
import { fetchProductsFromDB, insertProductToDB } from './products';
import { fetchCouponsFromDB, insertCouponToDB } from './coupons';
import { fetchPaymentSettingsFromDB, savePaymentSettingsToDB } from './settings';
import { fetchUsersFromDB, insertUserToDB } from './users';
import { fetchWalletsFromDB, upsertWalletInDB } from './wallets';
import { fetchOrdersFromDB, insertOrderToDB } from './orders';
import {
  CardProduct,
  PromoCoupon,
  PaymentSettings,
  UserAccount,
  Wallet,
  OrderRecord,
} from '../../types';

export interface MigrationSummary {
  success: boolean;
  message: string;
  cardsMigrated: number;
  couponsMigrated: number;
  usersMigrated: number;
  walletsMigrated: number;
  ordersMigrated: number;
  paymentSettingsMigrated: boolean;
}

/**
 * Perform a safe synchronization of initial seed or localStorage data to Supabase
 * Avoids duplicate records by checking existing DB entries first.
 */
export async function migrateLocalDataToSupabase(localData: {
  cards: CardProduct[];
  coupons: PromoCoupon[];
  paymentSettings: PaymentSettings;
  users: UserAccount[];
  wallets: Record<string, Wallet>;
  orders: OrderRecord[];
}): Promise<MigrationSummary> {
  if (!isSupabaseConfigured) {
    return {
      success: false,
      message: 'Supabase is not configured yet. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
      cardsMigrated: 0,
      couponsMigrated: 0,
      usersMigrated: 0,
      walletsMigrated: 0,
      ordersMigrated: 0,
      paymentSettingsMigrated: false,
    };
  }

  // Check if PostgreSQL tables exist first
  const schemaStatus = await checkSupabaseSchemaReady();
  if (schemaStatus.tablesMissing) {
    return {
      success: false,
      message: 'PostgreSQL tables (public.products, etc.) have not been created in Supabase yet. Please run supabase_schema.sql in your Supabase SQL Editor.',
      cardsMigrated: 0,
      couponsMigrated: 0,
      usersMigrated: 0,
      walletsMigrated: 0,
      ordersMigrated: 0,
      paymentSettingsMigrated: false,
    };
  }

  let cardsCount = 0;
  let couponsCount = 0;
  let usersCount = 0;
  let walletsCount = 0;
  let ordersCount = 0;
  let paymentSettingsDone = false;

  try {
    // 1. Migrate Products / Cards
    const existingCards = (await fetchProductsFromDB()) || [];
    const existingCardIds = new Set(existingCards.map((c) => c.id));

    for (const card of localData.cards) {
      if (!existingCardIds.has(card.id)) {
        const res = await insertProductToDB(card);
        if (res.success) {
          cardsCount++;
          existingCardIds.add(card.id);
        }
      }
    }

    // 2. Migrate Promo Coupons
    const existingCoupons = (await fetchCouponsFromDB()) || [];
    const existingCouponCodes = new Set(existingCoupons.map((c) => c.code.toUpperCase()));

    for (const coupon of localData.coupons) {
      if (!existingCouponCodes.has(coupon.code.toUpperCase())) {
        const res = await insertCouponToDB(coupon);
        if (res.success) {
          couponsCount++;
          existingCouponCodes.add(coupon.code.toUpperCase());
        }
      }
    }

    // 3. Migrate Payment Settings
    const existingSettings = await fetchPaymentSettingsFromDB();
    if (!existingSettings) {
      const res = await savePaymentSettingsToDB(localData.paymentSettings);
      if (res.success) {
        paymentSettingsDone = true;
      }
    } else {
      paymentSettingsDone = true;
    }

    // 4. Migrate Users
    const existingUsers = (await fetchUsersFromDB()) || [];
    const existingUserIds = new Set(existingUsers.map((u) => u.id));
    const existingEmails = new Set(existingUsers.map((u) => u.email.toLowerCase()));

    for (const user of localData.users) {
      if (!existingUserIds.has(user.id) && !existingEmails.has(user.email.toLowerCase())) {
        const res = await insertUserToDB(user);
        if (res.success) {
          usersCount++;
          existingUserIds.add(user.id);
        }
      }
    }

    // 5. Migrate Wallets
    const existingWallets = (await fetchWalletsFromDB()) || {};
    for (const [userId, wallet] of Object.entries(localData.wallets)) {
      if (!existingWallets[userId]) {
        const res = await upsertWalletInDB(userId, wallet.balance, wallet.currency);
        if (res.success) {
          walletsCount++;
        }
      }
    }

    // 6. Migrate Orders
    const existingOrders = (await fetchOrdersFromDB()) || [];
    const existingOrderIds = new Set(existingOrders.map((o) => o.id));

    for (const order of localData.orders) {
      if (!existingOrderIds.has(order.id)) {
        const res = await insertOrderToDB(order);
        if (res.success) {
          ordersCount++;
          existingOrderIds.add(order.id);
        }
      }
    }

    return {
      success: true,
      message: `Database sync complete: ${cardsCount} cards, ${couponsCount} coupons, ${usersCount} users, ${walletsCount} wallets, ${ordersCount} orders synced to Supabase.`,
      cardsMigrated: cardsCount,
      couponsMigrated: couponsCount,
      usersMigrated: usersCount,
      walletsMigrated: walletsCount,
      ordersMigrated: ordersCount,
      paymentSettingsMigrated: paymentSettingsDone,
    };
  } catch (err: any) {
    console.error('[Supabase Migration Error]', err);
    return {
      success: false,
      message: `Migration encountered an error: ${err?.message || 'Unknown error'}`,
      cardsMigrated: cardsCount,
      couponsMigrated: couponsCount,
      usersMigrated: usersCount,
      walletsMigrated: walletsCount,
      ordersMigrated: ordersCount,
      paymentSettingsMigrated: paymentSettingsDone,
    };
  }
}
