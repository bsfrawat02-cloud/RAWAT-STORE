import { supabase, isSupabaseConfigured, isTableMissingError } from './client';
import { PromoCoupon } from '../../types';

export const mapDBToCoupon = (item: any): PromoCoupon => ({
  id: item.id,
  code: item.code,
  discountType: item.discount_type,
  discountValue: Number(item.discount_value) || 0,
  minOrderValue: item.min_order_value ? Number(item.min_order_value) : 0,
  description: item.description || '',
  isActive: Boolean(item.is_active),
  usageCount: Number(item.usage_count) || 0,
  expiresAt: item.expires_at || undefined,
});

export const mapCouponToDB = (coupon: PromoCoupon | Omit<PromoCoupon, 'id' | 'usageCount'>, id?: string, usageCount?: number) => ({
  id: id || ('id' in coupon ? coupon.id : `COUPON-${Date.now()}`),
  code: coupon.code.toUpperCase().trim(),
  discount_type: coupon.discountType,
  discount_value: coupon.discountValue,
  min_order_value: coupon.minOrderValue || 0,
  description: coupon.description,
  is_active: coupon.isActive ?? true,
  usage_count: usageCount !== undefined ? usageCount : ('usageCount' in coupon ? coupon.usageCount : 0),
  expires_at: coupon.expiresAt || null,
});

/**
 * Fetch all promo coupons from Supabase
 */
export async function fetchCouponsFromDB(): Promise<PromoCoupon[] | null> {
  if (!supabase || !isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('code', { ascending: true });

    if (error) {
      console.warn('[Supabase] Failed to fetch coupons:', error.message);
      return null;
    }
    return (data || []).map(mapDBToCoupon);
  } catch (err) {
    console.warn('[Supabase] Exception fetching coupons:', err);
    return null;
  }
}

/**
 * Add a new coupon to Supabase
 */
export async function insertCouponToDB(
  coupon: Omit<PromoCoupon, 'id' | 'usageCount'> & { id?: string; usageCount?: number }
): Promise<{ success: boolean; data?: PromoCoupon; error?: string }> {
  const finalId = coupon.id || `CPN-${Date.now()}`;
  const finalUsage = coupon.usageCount || 0;
  const dbPayload = mapCouponToDB(coupon, finalId, finalUsage);

  if (!supabase || !isSupabaseConfigured) {
    return { success: true, data: { ...coupon, id: finalId, usageCount: finalUsage } as PromoCoupon };
  }

  try {
    const { data, error } = await supabase
      .from('coupons')
      .insert(dbPayload)
      .select()
      .single();

    if (error) {
      if (isTableMissingError(error)) {
        console.warn('[Supabase] coupons table does not exist in database yet. Using local data.');
      } else {
        console.error('[Supabase] Error inserting coupon:', error);
      }
      return { success: false, error: error.message };
    }

    return { success: true, data: mapDBToCoupon(data) };
  } catch (err: any) {
    console.error('[Supabase] Exception inserting coupon:', err);
    return { success: false, error: err?.message || 'Database error' };
  }
}

/**
 * Update an existing coupon in Supabase
 */
export async function updateCouponInDB(
  id: string,
  updates: Partial<PromoCoupon>
): Promise<{ success: boolean; error?: string }> {
  if (!supabase || !isSupabaseConfigured) {
    return { success: true };
  }

  try {
    const payload: any = {};
    if (updates.code !== undefined) payload.code = updates.code.toUpperCase().trim();
    if (updates.discountType !== undefined) payload.discount_type = updates.discountType;
    if (updates.discountValue !== undefined) payload.discount_value = updates.discountValue;
    if (updates.minOrderValue !== undefined) payload.min_order_value = updates.minOrderValue;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.isActive !== undefined) payload.is_active = updates.isActive;
    if (updates.usageCount !== undefined) payload.usage_count = updates.usageCount;
    if (updates.expiresAt !== undefined) payload.expires_at = updates.expiresAt || null;

    const { error } = await supabase
      .from('coupons')
      .update(payload)
      .eq('id', id);

    if (error) {
      console.error('[Supabase] Error updating coupon:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('[Supabase] Exception updating coupon:', err);
    return { success: false, error: err?.message || 'Database update error' };
  }
}

/**
 * Delete a coupon from Supabase
 */
export async function deleteCouponFromDB(id: string): Promise<{ success: boolean; error?: string }> {
  if (!supabase || !isSupabaseConfigured) {
    return { success: true };
  }

  try {
    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[Supabase] Error deleting coupon:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('[Supabase] Exception deleting coupon:', err);
    return { success: false, error: err?.message || 'Database delete error' };
  }
}
