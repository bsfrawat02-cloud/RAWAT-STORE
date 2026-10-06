import { supabase, isSupabaseConfigured, isTableMissingError } from './client';
import {
  Wallet,
  WalletTransaction,
  PaymentRequest,
  AdminAuditLog,
  ReferralRecord,
} from '../../types';

// ============================================================================
// 1. Wallets
// ============================================================================
export async function fetchWalletsFromDB(): Promise<Record<string, Wallet> | null> {
  if (!supabase || !isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase.from('wallets').select('*');
    if (error) {
      console.warn('[Supabase] Failed to fetch wallets:', error.message);
      return null;
    }
    const result: Record<string, Wallet> = {};
    (data || []).forEach((row: any) => {
      result[row.user_id] = {
        userId: row.user_id,
        balance: Number(row.balance) || 0,
        currency: row.currency || 'INR',
        updatedAt: row.updated_at || new Date().toISOString(),
      };
    });
    return result;
  } catch (err) {
    console.warn('[Supabase] Exception fetching wallets:', err);
    return null;
  }
}

export async function upsertWalletInDB(
  userId: string,
  balance: number,
  currency: 'INR' | 'USD' | 'EUR' = 'INR'
): Promise<{ success: boolean; error?: string }> {
  if (!supabase || !isSupabaseConfigured) {
    return { success: true };
  }

  try {
    const { error } = await supabase.from('wallets').upsert({
      user_id: userId,
      balance: Math.max(0, balance),
      currency,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      if (isTableMissingError(error)) {
        console.warn('[Supabase] wallets table does not exist in database yet. Using local data.');
      } else {
        console.error('[Supabase] Error upserting wallet:', error);
      }
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('[Supabase] Exception upserting wallet:', err);
    return { success: false, error: err?.message || 'Database error' };
  }
}

// ============================================================================
// 2. Transactions
// ============================================================================
export const mapDBToTransaction = (item: any): WalletTransaction => ({
  id: item.id,
  userId: item.user_id,
  username: item.username,
  type: item.type,
  amount: Number(item.amount) || 0,
  balanceBefore: Number(item.balance_before) || 0,
  balanceAfter: Number(item.balance_after) || 0,
  status: item.status || 'COMPLETED',
  description: item.description || '',
  reason: item.reason || undefined,
  createdBy: item.created_by || 'SYSTEM',
  createdAt: item.created_at || new Date().toISOString(),
  referenceId: item.reference_id || undefined,
});

export async function fetchTransactionsFromDB(): Promise<WalletTransaction[] | null> {
  if (!supabase || !isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Supabase] Failed to fetch transactions:', error.message);
      return null;
    }
    return (data || []).map(mapDBToTransaction);
  } catch (err) {
    console.warn('[Supabase] Exception fetching transactions:', err);
    return null;
  }
}

export async function insertTransactionToDB(
  txn: WalletTransaction
): Promise<{ success: boolean; error?: string }> {
  if (!supabase || !isSupabaseConfigured) {
    return { success: true };
  }

  try {
    const { error } = await supabase.from('transactions').insert({
      id: txn.id,
      user_id: txn.userId,
      username: txn.username,
      type: txn.type,
      amount: txn.amount,
      balance_before: txn.balanceBefore,
      balance_after: txn.balanceAfter,
      status: txn.status,
      description: txn.description,
      reason: txn.reason || null,
      created_by: txn.createdBy,
      created_at: txn.createdAt || new Date().toISOString(),
      reference_id: txn.referenceId || null,
    });

    if (error) {
      console.error('[Supabase] Error inserting transaction:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('[Supabase] Exception inserting transaction:', err);
    return { success: false, error: err?.message || 'Database error' };
  }
}

// ============================================================================
// 3. Payment Requests (Deposit Verifications)
// ============================================================================
export const mapDBToPaymentRequest = (item: any): PaymentRequest => ({
  id: item.id,
  userId: item.user_id,
  username: item.username,
  userEmail: item.user_email,
  amount: Number(item.amount) || 0,
  status: item.status || 'PENDING_VERIFICATION',
  utrRef: item.utr_ref || undefined,
  requestedAt: item.requested_at || new Date().toISOString(),
  reviewedAt: item.reviewed_at || undefined,
  reviewedBy: item.reviewed_by || undefined,
  rejectionReason: item.rejection_reason || undefined,
  adminNotes: item.admin_notes || undefined,
});

export async function fetchPaymentRequestsFromDB(): Promise<PaymentRequest[] | null> {
  if (!supabase || !isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('payment_requests')
      .select('*')
      .order('requested_at', { ascending: false });

    if (error) {
      console.warn('[Supabase] Failed to fetch payment requests:', error.message);
      return null;
    }
    return (data || []).map(mapDBToPaymentRequest);
  } catch (err) {
    console.warn('[Supabase] Exception fetching payment requests:', err);
    return null;
  }
}

export async function insertPaymentRequestToDB(
  req: PaymentRequest
): Promise<{ success: boolean; error?: string }> {
  if (!supabase || !isSupabaseConfigured) {
    return { success: true };
  }

  try {
    const { error } = await supabase.from('payment_requests').insert({
      id: req.id,
      user_id: req.userId,
      username: req.username,
      user_email: req.userEmail,
      amount: req.amount,
      status: req.status,
      utr_ref: req.utrRef || null,
      requested_at: req.requestedAt || new Date().toISOString(),
      reviewed_at: req.reviewedAt || null,
      reviewed_by: req.reviewedBy || null,
      rejection_reason: req.rejectionReason || null,
      admin_notes: req.adminNotes || null,
    });

    if (error) {
      console.error('[Supabase] Error inserting payment request:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('[Supabase] Exception inserting payment request:', err);
    return { success: false, error: err?.message || 'Database error' };
  }
}

export async function updatePaymentRequestInDB(
  id: string,
  updates: Partial<PaymentRequest>
): Promise<{ success: boolean; error?: string }> {
  if (!supabase || !isSupabaseConfigured) {
    return { success: true };
  }

  try {
    const payload: any = {};
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.reviewedAt !== undefined) payload.reviewed_at = updates.reviewedAt;
    if (updates.reviewedBy !== undefined) payload.reviewed_by = updates.reviewedBy;
    if (updates.rejectionReason !== undefined) payload.rejection_reason = updates.rejectionReason;
    if (updates.adminNotes !== undefined) payload.admin_notes = updates.adminNotes;
    if (updates.utrRef !== undefined) payload.utr_ref = updates.utrRef;

    const { error } = await supabase
      .from('payment_requests')
      .update(payload)
      .eq('id', id);

    if (error) {
      console.error('[Supabase] Error updating payment request:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('[Supabase] Exception updating payment request:', err);
    return { success: false, error: err?.message || 'Database error' };
  }
}

// ============================================================================
// 4. Admin Audit Logs
// ============================================================================
export const mapDBToAuditLog = (item: any): AdminAuditLog => ({
  id: item.id,
  action: item.action,
  adminId: item.admin_id,
  adminUsername: item.admin_username,
  targetUserId: item.target_user_id || undefined,
  targetUsername: item.target_username || undefined,
  amount: item.amount ? Number(item.amount) : undefined,
  timestamp: item.timestamp || new Date().toISOString(),
  reason: item.reason,
  metadata: item.metadata || {},
});

export async function fetchAuditLogsFromDB(): Promise<AdminAuditLog[] | null> {
  if (!supabase || !isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('admin_audit_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(200);

    if (error) {
      console.warn('[Supabase] Failed to fetch audit logs:', error.message);
      return null;
    }
    return (data || []).map(mapDBToAuditLog);
  } catch (err) {
    console.warn('[Supabase] Exception fetching audit logs:', err);
    return null;
  }
}

export async function insertAuditLogToDB(
  log: AdminAuditLog
): Promise<{ success: boolean; error?: string }> {
  if (!supabase || !isSupabaseConfigured) {
    return { success: true };
  }

  try {
    const { error } = await supabase.from('admin_audit_logs').insert({
      id: log.id,
      action: log.action,
      admin_id: log.adminId,
      admin_username: log.adminUsername,
      target_user_id: log.targetUserId || null,
      target_username: log.targetUsername || null,
      amount: log.amount || null,
      timestamp: log.timestamp || new Date().toISOString(),
      reason: log.reason,
      metadata: log.metadata || {},
    });

    if (error) {
      console.error('[Supabase] Error inserting audit log:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('[Supabase] Exception inserting audit log:', err);
    return { success: false, error: err?.message || 'Database error' };
  }
}

// ============================================================================
// 5. Referrals
// ============================================================================
export const mapDBToReferral = (item: any): ReferralRecord => ({
  id: item.id,
  referrerId: item.referrer_id,
  referrerUsername: item.referrer_username,
  referredUserId: item.referred_user_id,
  referredUsername: item.referred_username,
  referredEmail: item.referred_email,
  referralCodeUsed: item.referral_code_used,
  signupBonusReferrer: Number(item.signup_bonus_referrer) || 0,
  signupBonusReferred: Number(item.signup_bonus_referred) || 0,
  totalDepositedByFriend: Number(item.total_deposited_by_friend) || 0,
  totalCommissionEarned: Number(item.total_commission_earned) || 0,
  createdAt: item.created_at || new Date().toISOString(),
  lastDepositAt: item.last_deposit_at || undefined,
});

export async function fetchReferralsFromDB(): Promise<ReferralRecord[] | null> {
  if (!supabase || !isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('referrals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Supabase] Failed to fetch referrals:', error.message);
      return null;
    }
    return (data || []).map(mapDBToReferral);
  } catch (err) {
    console.warn('[Supabase] Exception fetching referrals:', err);
    return null;
  }
}

export async function insertReferralToDB(
  ref: ReferralRecord
): Promise<{ success: boolean; error?: string }> {
  if (!supabase || !isSupabaseConfigured) {
    return { success: true };
  }

  try {
    const { error } = await supabase.from('referrals').insert({
      id: ref.id,
      referrer_id: ref.referrerId,
      referrer_username: ref.referrerUsername,
      referred_user_id: ref.referredUserId,
      referred_username: ref.referredUsername,
      referred_email: ref.referredEmail,
      referral_code_used: ref.referralCodeUsed,
      signup_bonus_referrer: ref.signupBonusReferrer,
      signup_bonus_referred: ref.signupBonusReferred,
      total_deposited_by_friend: ref.totalDepositedByFriend || 0,
      total_commission_earned: ref.totalCommissionEarned || 0,
      created_at: ref.createdAt || new Date().toISOString(),
      last_deposit_at: ref.lastDepositAt || null,
    });

    if (error) {
      console.error('[Supabase] Error inserting referral:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('[Supabase] Exception inserting referral:', err);
    return { success: false, error: err?.message || 'Database error' };
  }
}

export async function updateReferralInDB(
  id: string,
  updates: Partial<ReferralRecord>
): Promise<{ success: boolean; error?: string }> {
  if (!supabase || !isSupabaseConfigured) {
    return { success: true };
  }

  try {
    const payload: any = {};
    if (updates.totalDepositedByFriend !== undefined) payload.total_deposited_by_friend = updates.totalDepositedByFriend;
    if (updates.totalCommissionEarned !== undefined) payload.total_commission_earned = updates.totalCommissionEarned;
    if (updates.lastDepositAt !== undefined) payload.last_deposit_at = updates.lastDepositAt;

    const { error } = await supabase
      .from('referrals')
      .update(payload)
      .eq('id', id);

    if (error) {
      console.error('[Supabase] Error updating referral:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('[Supabase] Exception updating referral:', err);
    return { success: false, error: err?.message || 'Database error' };
  }
}
