import { supabase, isSupabaseConfigured } from './client';
import {
  PaymentSettings,
  StoreAnnouncement,
  SupportTicket,
  UserNotification,
} from '../../types';

// ============================================================================
// 1. Payment Settings
// ============================================================================
export const mapDBToPaymentSettings = (data: any): PaymentSettings => ({
  upiId: data.upi_id || 'rawatcard@ybl',
  backupUpiId: data.backup_upi_id || 'rawatcard@ibl',
  paymentDisplayName: data.payment_display_name || 'PARAMVEER RAWAT',
  paymentInstructions: data.payment_instructions || 'Scan PhonePe QR code or enter UPI ID rawatcard@ybl and submit UTR reference.',
  instructionSteps: Array.isArray(data.instruction_steps) ? data.instruction_steps : undefined,
  securityNotice: data.security_notice || undefined,
  activeQrImageUrl: data.active_qr_image_url,
  qrType: data.qr_type || 'generated',
  minDepositAmount: data.min_deposit_amount !== null ? Number(data.min_deposit_amount) : 50,
  maxDepositAmount: data.max_deposit_amount !== null ? Number(data.max_deposit_amount) : 50000,
  quickPresetAmounts: Array.isArray(data.quick_preset_amounts) ? data.quick_preset_amounts : [100, 250, 500, 1000, 2000, 5000],
  requireUtr: Boolean(data.require_utr),
  isPaymentActive: data.is_payment_active ?? true,
  maintenanceMessage: data.maintenance_message || undefined,
  updatedAt: data.updated_at || new Date().toISOString(),
  updatedBy: data.updated_by || 'PARAMVEER RAWAT',
  isActive: data.is_active ?? true,
});

export async function fetchPaymentSettingsFromDB(): Promise<PaymentSettings | null> {
  if (!supabase || !isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('payment_settings')
      .select('*')
      .eq('id', 'default')
      .single();

    if (error || !data) {
      return null;
    }
    return mapDBToPaymentSettings(data);
  } catch (err) {
    console.warn('[Supabase] Exception fetching payment settings:', err);
    return null;
  }
}

export async function savePaymentSettingsToDB(
  settings: PaymentSettings
): Promise<{ success: boolean; error?: string }> {
  if (!supabase || !isSupabaseConfigured) {
    return { success: true };
  }
  try {
    const { error } = await supabase.from('payment_settings').upsert({
      id: 'default',
      upi_id: settings.upiId,
      backup_upi_id: settings.backupUpiId || null,
      payment_display_name: settings.paymentDisplayName,
      payment_instructions: settings.paymentInstructions,
      instruction_steps: settings.instructionSteps || null,
      security_notice: settings.securityNotice || null,
      active_qr_image_url: settings.activeQrImageUrl,
      qr_type: settings.qrType,
      min_deposit_amount: settings.minDepositAmount ?? 50,
      max_deposit_amount: settings.maxDepositAmount ?? 50000,
      quick_preset_amounts: settings.quickPresetAmounts || [100, 250, 500, 1000, 2000, 5000],
      require_utr: settings.requireUtr ?? false,
      is_payment_active: settings.isPaymentActive ?? true,
      maintenance_message: settings.maintenanceMessage || null,
      updated_at: new Date().toISOString(),
      updated_by: settings.updatedBy || 'PARAMVEER RAWAT',
      is_active: settings.isActive ?? true,
    });

    if (error) {
      console.warn('[Supabase] Error saving payment settings:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.warn('[Supabase] Save error:', err);
    return { success: false, error: err?.message || 'Database error' };
  }
}

// ============================================================================
// 2. Announcements
// ============================================================================
export const mapDBToAnnouncement = (item: any): StoreAnnouncement => ({
  id: item.id,
  title: item.title,
  message: item.message,
  type: item.type || 'INFO',
  isActive: Boolean(item.is_active),
  createdAt: item.created_at || new Date().toISOString(),
  expiresAt: item.expires_at || undefined,
  targetTier: item.target_tier || 'ALL',
});

export async function fetchAnnouncementsFromDB(): Promise<StoreAnnouncement[] | null> {
  if (!supabase || !isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Supabase] Failed to fetch announcements:', error.message);
      return null;
    }
    return (data || []).map(mapDBToAnnouncement);
  } catch (err) {
    console.warn('[Supabase] Exception fetching announcements:', err);
    return null;
  }
}

export async function upsertAnnouncementInDB(
  announcement: StoreAnnouncement
): Promise<{ success: boolean; error?: string }> {
  if (!supabase || !isSupabaseConfigured) {
    return { success: true };
  }

  try {
    const { error } = await supabase.from('announcements').upsert({
      id: announcement.id,
      title: announcement.title,
      message: announcement.message,
      type: announcement.type,
      is_active: announcement.isActive,
      created_at: announcement.createdAt || new Date().toISOString(),
      expires_at: announcement.expiresAt || null,
      target_tier: announcement.targetTier || 'ALL',
    });

    if (error) {
      console.error('[Supabase] Error saving announcement:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('[Supabase] Exception saving announcement:', err);
    return { success: false, error: err?.message || 'Database error' };
  }
}

export async function deleteAnnouncementFromDB(id: string): Promise<{ success: boolean; error?: string }> {
  if (!supabase || !isSupabaseConfigured) {
    return { success: true };
  }
  try {
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

// ============================================================================
// 3. Support Tickets
// ============================================================================
export const mapDBToSupportTicket = (item: any): SupportTicket => ({
  id: item.id,
  userId: item.user_id,
  username: item.username,
  email: item.email,
  subject: item.subject,
  category: item.category || 'OTHER',
  message: item.message,
  status: item.status || 'OPEN',
  priority: item.priority || 'MEDIUM',
  createdAt: item.created_at || new Date().toISOString(),
  resolvedAt: item.resolved_at || undefined,
  adminReply: item.admin_reply || undefined,
  adminUsername: item.admin_username || undefined,
});

export async function fetchSupportTicketsFromDB(): Promise<SupportTicket[] | null> {
  if (!supabase || !isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Supabase] Failed to fetch support tickets:', error.message);
      return null;
    }
    return (data || []).map(mapDBToSupportTicket);
  } catch (err) {
    console.warn('[Supabase] Exception fetching tickets:', err);
    return null;
  }
}

export async function upsertSupportTicketInDB(
  ticket: SupportTicket
): Promise<{ success: boolean; error?: string }> {
  if (!supabase || !isSupabaseConfigured) {
    return { success: true };
  }
  try {
    const { error } = await supabase.from('support_tickets').upsert({
      id: ticket.id,
      user_id: ticket.userId,
      username: ticket.username,
      email: ticket.email,
      subject: ticket.subject,
      category: ticket.category,
      message: ticket.message,
      status: ticket.status,
      priority: ticket.priority,
      created_at: ticket.createdAt,
      resolved_at: ticket.resolvedAt || null,
      admin_reply: ticket.adminReply || null,
      admin_username: ticket.adminUsername || null,
    });

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

// ============================================================================
// 4. Notifications
// ============================================================================
export const mapDBToNotification = (item: any): UserNotification => ({
  id: item.id,
  userId: item.user_id || undefined,
  title: item.title,
  message: item.message,
  timestamp: item.timestamp || new Date().toISOString(),
  read: Boolean(item.read),
  type: item.type || 'system',
});

export async function fetchNotificationsFromDB(userId?: string): Promise<UserNotification[] | null> {
  if (!supabase || !isSupabaseConfigured) return null;
  try {
    let query = supabase.from('notifications').select('*').order('timestamp', { ascending: false }).limit(50);
    if (userId) {
      query = query.or(`user_id.eq.${userId},user_id.is.null`);
    }
    const { data, error } = await query;
    if (error) return null;
    return (data || []).map(mapDBToNotification);
  } catch (err) {
    return null;
  }
}

export async function insertNotificationToDB(notif: UserNotification): Promise<{ success: boolean; error?: string }> {
  if (!supabase || !isSupabaseConfigured) return { success: true };
  try {
    const { error } = await supabase.from('notifications').insert({
      id: notif.id,
      user_id: notif.userId || null,
      title: notif.title,
      message: notif.message,
      timestamp: notif.timestamp || new Date().toISOString(),
      read: notif.read ?? false,
      type: notif.type || 'system',
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

export async function markNotificationReadInDB(id: string): Promise<{ success: boolean }> {
  if (!supabase || !isSupabaseConfigured) return { success: true };
  try {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    return { success: true };
  } catch {
    return { success: false };
  }
}

// ============================================================================
// 5. Store Settings Key-Value Table
// ============================================================================
export async function getStoreSettingFromDB<T = any>(key: string): Promise<T | null> {
  if (!supabase || !isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('store_settings')
      .select('value')
      .eq('key', key)
      .single();

    if (error || !data) return null;
    return data.value as T;
  } catch {
    return null;
  }
}

export async function setStoreSettingInDB(key: string, value: any): Promise<{ success: boolean; error?: string }> {
  if (!supabase || !isSupabaseConfigured) return { success: true };
  try {
    const { error } = await supabase.from('store_settings').upsert({
      key,
      value,
      updated_at: new Date().toISOString(),
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}
