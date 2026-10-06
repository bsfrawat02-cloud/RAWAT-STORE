import { supabase, isSupabaseConfigured, isTableMissingError } from './client';
import { CardProduct } from '../../types';

export const mapDBToProduct = (item: any): CardProduct => ({
  id: item.id,
  name: item.name,
  tagline: item.tagline || '',
  tier: item.tier,
  finish: item.finish,
  network: item.network || 'RAWAT',
  rarity: item.rarity || 'Rare',
  price: Number(item.price) || 0,
  limit: item.limit_val ? Number(item.limit_val) : undefined,
  dailyLimit: item.daily_limit ? Number(item.daily_limit) : undefined,
  monthlyLimit: item.monthly_limit ? Number(item.monthly_limit) : undefined,
  status: item.status || 'AVAILABLE',
  cardNumber: item.card_number || undefined,
  maskedIdentifier: item.masked_identifier || '•••• •••• •••• 4821',
  expMonth: item.exp_month || undefined,
  expYear: item.exp_year || undefined,
  expDate: item.exp_date || '08/31',
  cvv: item.cvv || '821',
  cardHolder: item.card_holder || undefined,
  bankName: item.bank_name || undefined,
  cardPin: item.card_pin || undefined,
  edition: item.edition || 'Genesis Edition',
  description: item.description || '',
  perks: Array.isArray(item.perks) ? item.perks : [],
  stockCount: Number(item.stock_count) ?? 10,
  featured: Boolean(item.featured),
  accentColor: item.accent_color || '#a855f7',
  gradientClass: item.gradient_class || 'from-zinc-950 via-zinc-900 to-black',
  borderGlowClass: item.border_glow_class || 'group-hover:border-purple-500/50',
  createdAt: item.created_at || new Date().toISOString(),
});

export const mapProductToDB = (card: CardProduct | Omit<CardProduct, 'id' | 'createdAt'>, id?: string, createdAt?: string) => ({
  id: id || ('id' in card ? card.id : `CARD-${Date.now()}-${Math.floor(Math.random() * 1000)}`),
  name: card.name,
  tagline: card.tagline || null,
  tier: card.tier,
  finish: card.finish,
  network: card.network || 'RAWAT',
  rarity: card.rarity || 'Rare',
  price: card.price,
  limit_val: card.limit || null,
  daily_limit: card.dailyLimit || null,
  monthly_limit: card.monthlyLimit || null,
  status: card.status,
  card_number: card.cardNumber || null,
  masked_identifier: card.maskedIdentifier || '•••• •••• •••• 4821',
  exp_month: card.expMonth || null,
  exp_year: card.expYear || null,
  exp_date: card.expDate,
  cvv: card.cvv,
  card_holder: card.cardHolder || null,
  bank_name: card.bankName || null,
  card_pin: card.cardPin || null,
  edition: card.edition,
  description: card.description,
  perks: card.perks || [],
  stock_count: card.stockCount ?? 10,
  featured: card.featured ?? false,
  accent_color: card.accentColor || '#a855f7',
  gradient_class: card.gradientClass || 'from-zinc-950 via-zinc-900 to-black',
  border_glow_class: card.borderGlowClass || 'group-hover:border-purple-500/50',
  created_at: createdAt || ('createdAt' in card ? card.createdAt : new Date().toISOString()),
});

/**
 * Fetch all products from Supabase database
 */
export async function fetchProductsFromDB(): Promise<CardProduct[] | null> {
  if (!supabase || !isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Supabase] Failed to fetch products:', error.message);
      return null;
    }
    return (data || []).map(mapDBToProduct);
  } catch (err) {
    console.warn('[Supabase] Exception fetching products:', err);
    return null;
  }
}

/**
 * Add a new product into Supabase
 */
export async function insertProductToDB(
  card: Omit<CardProduct, 'id' | 'createdAt'> & { id?: string; createdAt?: string }
): Promise<{ success: boolean; data?: CardProduct; error?: string }> {
  const finalId = card.id || `CARD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const finalCreatedAt = card.createdAt || new Date().toISOString();
  const dbPayload = mapProductToDB(card, finalId, finalCreatedAt);

  if (!supabase || !isSupabaseConfigured) {
    return { success: true, data: { ...card, id: finalId, createdAt: finalCreatedAt } as CardProduct };
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .insert(dbPayload)
      .select()
      .single();

    if (error) {
      if (isTableMissingError(error)) {
        console.warn('[Supabase] products table does not exist in database yet. Using local data.');
      } else {
        console.error('[Supabase] Error inserting product:', error);
      }
      return { success: false, error: error.message };
    }

    return { success: true, data: mapDBToProduct(data) };
  } catch (err: any) {
    console.error('[Supabase] Exception inserting product:', err);
    return { success: false, error: err?.message || 'Database error' };
  }
}

/**
 * Update an existing product in Supabase
 */
export async function updateProductInDB(
  id: string,
  updates: Partial<CardProduct>
): Promise<{ success: boolean; error?: string }> {
  if (!supabase || !isSupabaseConfigured) {
    return { success: true };
  }

  try {
    const payload: any = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.tagline !== undefined) payload.tagline = updates.tagline;
    if (updates.tier !== undefined) payload.tier = updates.tier;
    if (updates.finish !== undefined) payload.finish = updates.finish;
    if (updates.network !== undefined) payload.network = updates.network;
    if (updates.rarity !== undefined) payload.rarity = updates.rarity;
    if (updates.price !== undefined) payload.price = updates.price;
    if (updates.limit !== undefined) payload.limit_val = updates.limit;
    if (updates.dailyLimit !== undefined) payload.daily_limit = updates.dailyLimit;
    if (updates.monthlyLimit !== undefined) payload.monthly_limit = updates.monthlyLimit;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.cardNumber !== undefined) payload.card_number = updates.cardNumber;
    if (updates.maskedIdentifier !== undefined) payload.masked_identifier = updates.maskedIdentifier;
    if (updates.expMonth !== undefined) payload.exp_month = updates.expMonth;
    if (updates.expYear !== undefined) payload.exp_year = updates.expYear;
    if (updates.expDate !== undefined) payload.exp_date = updates.expDate;
    if (updates.cvv !== undefined) payload.cvv = updates.cvv;
    if (updates.cardHolder !== undefined) payload.card_holder = updates.cardHolder;
    if (updates.bankName !== undefined) payload.bank_name = updates.bankName;
    if (updates.cardPin !== undefined) payload.card_pin = updates.cardPin;
    if (updates.edition !== undefined) payload.edition = updates.edition;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.perks !== undefined) payload.perks = updates.perks;
    if (updates.stockCount !== undefined) payload.stock_count = updates.stockCount;
    if (updates.featured !== undefined) payload.featured = updates.featured;
    if (updates.accentColor !== undefined) payload.accent_color = updates.accentColor;
    if (updates.gradientClass !== undefined) payload.gradient_class = updates.gradientClass;
    if (updates.borderGlowClass !== undefined) payload.border_glow_class = updates.borderGlowClass;

    const { error } = await supabase
      .from('products')
      .update(payload)
      .eq('id', id);

    if (error) {
      console.error('[Supabase] Error updating product:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('[Supabase] Exception updating product:', err);
    return { success: false, error: err?.message || 'Database update error' };
  }
}

/**
 * Delete a product from Supabase
 */
export async function deleteProductFromDB(id: string): Promise<{ success: boolean; error?: string }> {
  if (!supabase || !isSupabaseConfigured) {
    return { success: true };
  }

  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[Supabase] Error deleting product:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('[Supabase] Exception deleting product:', err);
    return { success: false, error: err?.message || 'Database delete error' };
  }
}
