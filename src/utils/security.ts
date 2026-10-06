/**
 * Security, Hashing & Unique ID Generation Utilities
 */

// Simple SHA-256 hash using Web Crypto API or fallback
export async function hashPassword(password: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      const msgBuffer = new TextEncoder().encode(password + '_rawat_salt_2026');
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // fallback
    }
  }
  // Fast synchronous deterministic hash fallback
  let hash = 0;
  const str = password + '_rawat_salt_2026';
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return 'rawathash_' + Math.abs(hash).toString(16) + 'f892a';
}

// Generate unique formatted transaction ID
export function generateTransactionId(): string {
  const chars = '0123456789ABCDEF';
  let rand = '';
  for (let i = 0; i < 6; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `TXN-RAWAT-${rand}`;
}

// Generate unique payment request ID
export function generatePaymentRequestId(): string {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `PAY-${num}`;
}

// Generate unique audit log ID
export function generateAuditLogId(): string {
  const num = Math.floor(10000 + Math.random() * 90000);
  return `LOG-${num}`;
}

// Generate 6-digit verification code
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Generate unique secure verification token for simulated links
export function generateVerificationToken(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let rand = '';
  for (let i = 0; i < 24; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `rwt_tok_${rand}`;
}

// Build simulated verification URL
export function buildSimulatedVerificationLink(token: string, email: string): string {
  const encodedEmail = encodeURIComponent(email);
  return `https://rawatcards.store/verify-email?token=${token}&email=${encodedEmail}`;
}

// Safe decimal arithmetic for currency calculations
export function roundCurrency(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

// Format timestamp
export function getFormattedTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const mins = String(now.getMinutes()).padStart(2, '0');
  const secs = String(now.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${mins}:${secs}`;
}
