import { supabase, isSupabaseConfigured, isTableMissingError } from './client';
import { OrderRecord } from '../../types';

export const mapDBToOrder = (item: any): OrderRecord => ({
  id: item.id,
  orderNumber: item.order_number,
  userId: item.user_id || undefined,
  username: item.username || undefined,
  cardId: item.card_id,
  cardName: item.card_name,
  cardTier: item.card_tier,
  cardFinish: item.card_finish,
  cardNetwork: item.card_network || 'RAWAT',
  cardRarity: item.card_rarity || undefined,
  cardNumber: item.card_number || undefined,
  maskedIdentifier: item.masked_identifier || '•••• •••• •••• 4821',
  expMonth: item.exp_month || undefined,
  expYear: item.exp_year || undefined,
  expDate: item.exp_date || undefined,
  cvv: item.cvv || undefined,
  limit: item.limit_val ? Number(item.limit_val) : undefined,
  dailyLimit: item.daily_limit ? Number(item.daily_limit) : undefined,
  monthlyLimit: item.monthly_limit ? Number(item.monthly_limit) : undefined,
  bankName: item.bank_name || undefined,
  cardHolder: item.card_holder || undefined,
  cardPin: item.card_pin || undefined,
  originalPrice: Number(item.original_price) || 0,
  discountAmount: Number(item.discount_amount) || 0,
  finalPrice: Number(item.final_price) || 0,
  couponUsed: item.coupon_used || undefined,
  status: item.status || 'COMPLETED',
  purchaseDate: item.purchase_date || item.created_at || new Date().toISOString(),
  transactionRef: item.transaction_ref,
  vaultTokenId: item.vault_token_id,
  createdAt: item.created_at || new Date().toISOString(),
});

export const mapOrderToDB = (order: OrderRecord) => ({
  id: order.id,
  order_number: order.orderNumber,
  user_id: order.userId || null,
  username: order.username || null,
  card_id: order.cardId,
  card_name: order.cardName,
  card_tier: order.cardTier,
  card_finish: order.cardFinish,
  card_network: order.cardNetwork || 'RAWAT',
  card_rarity: order.cardRarity || null,
  card_number: order.cardNumber || null,
  masked_identifier: order.maskedIdentifier || '•••• •••• •••• 4821',
  exp_month: order.expMonth || null,
  exp_year: order.expYear || null,
  exp_date: order.expDate || null,
  cvv: order.cvv || null,
  limit_val: order.limit || null,
  daily_limit: order.dailyLimit || null,
  monthly_limit: order.monthlyLimit || null,
  bank_name: order.bankName || null,
  card_holder: order.cardHolder || null,
  card_pin: order.cardPin || null,
  original_price: order.originalPrice,
  discount_amount: order.discountAmount || 0,
  final_price: order.finalPrice,
  coupon_used: order.couponUsed || null,
  status: order.status,
  purchase_date: order.purchaseDate || new Date().toISOString(),
  transaction_ref: order.transactionRef,
  vault_token_id: order.vaultTokenId,
  created_at: order.createdAt || new Date().toISOString(),
});

/**
 * Fetch all orders from Supabase
 */
export async function fetchOrdersFromDB(): Promise<OrderRecord[] | null> {
  if (!supabase || !isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('purchase_date', { ascending: false });

    if (error) {
      console.warn('[Supabase] Failed to fetch orders:', error.message);
      return null;
    }
    return (data || []).map(mapDBToOrder);
  } catch (err) {
    console.warn('[Supabase] Exception fetching orders:', err);
    return null;
  }
}

/**
 * Insert a new order into Supabase
 */
export async function insertOrderToDB(order: OrderRecord): Promise<{ success: boolean; error?: string }> {
  if (!supabase || !isSupabaseConfigured) {
    return { success: true };
  }

  try {
    const dbPayload = mapOrderToDB(order);
    const { error } = await supabase
      .from('orders')
      .insert(dbPayload);

    if (error) {
      if (isTableMissingError(error)) {
        console.warn('[Supabase] orders table does not exist in database yet. Using local data.');
      } else {
        console.error('[Supabase] Error inserting order:', error);
      }
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('[Supabase] Exception inserting order:', err);
    return { success: false, error: err?.message || 'Database error' };
  }
}

/**
 * Update an existing order status or attributes in Supabase
 */
export async function updateOrderInDB(
  id: string,
  updates: Partial<OrderRecord>
): Promise<{ success: boolean; error?: string }> {
  if (!supabase || !isSupabaseConfigured) {
    return { success: true };
  }

  try {
    const payload: any = {};
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.discountAmount !== undefined) payload.discount_amount = updates.discountAmount;
    if (updates.finalPrice !== undefined) payload.final_price = updates.finalPrice;
    if (updates.cardName !== undefined) payload.card_name = updates.cardName;

    const { error } = await supabase
      .from('orders')
      .update(payload)
      .eq('id', id);

    if (error) {
      console.error('[Supabase] Error updating order:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('[Supabase] Exception updating order:', err);
    return { success: false, error: err?.message || 'Database error' };
  }
}

/**
 * Delete an order from Supabase
 */
export async function deleteOrderFromDB(id: string): Promise<{ success: boolean; error?: string }> {
  if (!supabase || !isSupabaseConfigured) {
    return { success: true };
  }

  try {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[Supabase] Error deleting order:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('[Supabase] Exception deleting order:', err);
    return { success: false, error: err?.message || 'Database error' };
  }
}
