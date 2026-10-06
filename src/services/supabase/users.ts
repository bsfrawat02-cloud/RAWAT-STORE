import { supabase, isSupabaseConfigured, isTableMissingError } from './client';
import { UserAccount } from '../../types';

export const mapDBToUser = (item: any): UserAccount => ({
  id: item.id,
  username: item.username,
  fullName: item.full_name || undefined,
  phone: item.phone || undefined,
  email: item.email,
  passwordHash: item.password_hash,
  role: item.role,
  isEmailVerified: Boolean(item.is_email_verified),
  verificationCode: item.verification_code || undefined,
  verificationToken: item.verification_token || undefined,
  verificationSentAt: item.verification_sent_at || undefined,
  status: item.status || 'active',
  avatarSeed: item.avatar_seed || 'avatar-rawat',
  membershipTier: item.membership_tier || 'ROYAL NOIR',
  referralCode: item.referral_code,
  referredBy: item.referred_by || undefined,
  totalReferralCommissionEarned: Number(item.total_referral_commission_earned) || 0,
  totalReferralBonusEarned: Number(item.total_referral_bonus_earned) || 0,
  wishlist: Array.isArray(item.wishlist) ? item.wishlist : [],
  createdAt: item.created_at || new Date().toISOString(),
  updatedAt: item.updated_at || new Date().toISOString(),
  lastLoginAt: item.last_login_at || undefined,
});

export const mapUserToDB = (user: UserAccount) => ({
  id: user.id,
  username: user.username,
  full_name: user.fullName || null,
  phone: user.phone || null,
  email: user.email,
  password_hash: user.passwordHash,
  role: user.role,
  is_email_verified: user.isEmailVerified ?? true,
  verification_code: user.verificationCode || null,
  verification_token: user.verificationToken || null,
  verification_sent_at: user.verificationSentAt || null,
  status: user.status,
  avatar_seed: user.avatarSeed || 'avatar-rawat',
  membership_tier: user.membershipTier || 'ROYAL NOIR',
  referral_code: user.referralCode,
  referred_by: user.referredBy || null,
  total_referral_commission_earned: user.totalReferralCommissionEarned || 0,
  total_referral_bonus_earned: user.totalReferralBonusEarned || 0,
  wishlist: user.wishlist || [],
  created_at: user.createdAt || new Date().toISOString(),
  updated_at: user.updatedAt || new Date().toISOString(),
  last_login_at: user.lastLoginAt || null,
});

/**
 * Fetch all users from Supabase
 */
export async function fetchUsersFromDB(): Promise<UserAccount[] | null> {
  if (!supabase || !isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('[Supabase] Failed to fetch users:', error.message);
      return null;
    }
    return (data || []).map(mapDBToUser);
  } catch (err) {
    console.warn('[Supabase] Exception fetching users:', err);
    return null;
  }
}

/**
 * Insert a new user into Supabase
 */
export async function insertUserToDB(user: UserAccount): Promise<{ success: boolean; error?: string }> {
  if (!supabase || !isSupabaseConfigured) {
    return { success: true };
  }

  try {
    const dbPayload = mapUserToDB(user);
    const { error } = await supabase.from('users').insert(dbPayload);

    if (error) {
      if (isTableMissingError(error)) {
        console.warn('[Supabase] users table does not exist in database yet. Using local data.');
      } else {
        console.error('[Supabase] Error inserting user:', error);
      }
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('[Supabase] Exception inserting user:', err);
    return { success: false, error: err?.message || 'Database error' };
  }
}

/**
 * Update an existing user in Supabase
 */
export async function updateUserInDB(
  id: string,
  updates: Partial<UserAccount>
): Promise<{ success: boolean; error?: string }> {
  if (!supabase || !isSupabaseConfigured) {
    return { success: true };
  }

  try {
    const payload: any = { updated_at: new Date().toISOString() };
    if (updates.username !== undefined) payload.username = updates.username;
    if (updates.fullName !== undefined) payload.full_name = updates.fullName;
    if (updates.phone !== undefined) payload.phone = updates.phone;
    if (updates.email !== undefined) payload.email = updates.email;
    if (updates.passwordHash !== undefined) payload.password_hash = updates.passwordHash;
    if (updates.role !== undefined) payload.role = updates.role;
    if (updates.isEmailVerified !== undefined) payload.is_email_verified = updates.isEmailVerified;
    if (updates.verificationCode !== undefined) payload.verification_code = updates.verificationCode;
    if (updates.verificationToken !== undefined) payload.verification_token = updates.verificationToken;
    if (updates.verificationSentAt !== undefined) payload.verification_sent_at = updates.verificationSentAt;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.avatarSeed !== undefined) payload.avatar_seed = updates.avatarSeed;
    if (updates.membershipTier !== undefined) payload.membership_tier = updates.membershipTier;
    if (updates.referralCode !== undefined) payload.referral_code = updates.referralCode;
    if (updates.referredBy !== undefined) payload.referred_by = updates.referredBy;
    if (updates.totalReferralCommissionEarned !== undefined) payload.total_referral_commission_earned = updates.totalReferralCommissionEarned;
    if (updates.totalReferralBonusEarned !== undefined) payload.total_referral_bonus_earned = updates.totalReferralBonusEarned;
    if (updates.wishlist !== undefined) payload.wishlist = updates.wishlist;
    if (updates.lastLoginAt !== undefined) payload.last_login_at = updates.lastLoginAt;

    const { error } = await supabase
      .from('users')
      .update(payload)
      .eq('id', id);

    if (error) {
      console.error('[Supabase] Error updating user:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('[Supabase] Exception updating user:', err);
    return { success: false, error: err?.message || 'Database error' };
  }
}

/**
 * Delete a user from Supabase
 */
export async function deleteUserFromDB(id: string): Promise<{ success: boolean; error?: string }> {
  if (!supabase || !isSupabaseConfigured) {
    return { success: true };
  }

  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[Supabase] Error deleting user:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('[Supabase] Exception deleting user:', err);
    return { success: false, error: err?.message || 'Database error' };
  }
}
