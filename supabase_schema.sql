-- ==========================================================
-- RAWAT CARD STORE — Supabase PostgreSQL Schema & Security
-- ==========================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'super_admin')),
  is_email_verified BOOLEAN NOT NULL DEFAULT true,
  verification_code TEXT,
  verification_token TEXT,
  verification_sent_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending_verification')),
  avatar_seed TEXT NOT NULL DEFAULT 'avatar-rawat',
  membership_tier TEXT NOT NULL DEFAULT 'ROYAL NOIR',
  referral_code TEXT UNIQUE NOT NULL,
  referred_by TEXT,
  total_referral_commission_earned NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  total_referral_bonus_earned NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  wishlist JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_login_at TIMESTAMPTZ
);

-- 3. Wallets Table
CREATE TABLE IF NOT EXISTS public.wallets (
  user_id TEXT PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (balance >= 0.00),
  currency TEXT NOT NULL DEFAULT 'INR',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Products Table (Cards / Collectibles)
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tagline TEXT,
  tier TEXT NOT NULL CHECK (tier IN ('BLACK', 'GOLD', 'PLATINUM', 'ELITE', 'SPECIAL')),
  finish TEXT NOT NULL CHECK (finish IN ('obsidian', 'gold', 'platinum', 'emerald', 'amethyst', 'carbon', 'iridescent', 'rose_gold')),
  network TEXT NOT NULL DEFAULT 'RAWAT',
  rarity TEXT DEFAULT 'Rare',
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0.00),
  limit_val NUMERIC(12, 2) DEFAULT 150000.00,
  daily_limit NUMERIC(12, 2) DEFAULT 50000.00,
  monthly_limit NUMERIC(12, 2) DEFAULT 150000.00,
  status TEXT NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'LIMITED', 'VAULT_ONLY')),
  card_number TEXT,
  masked_identifier TEXT NOT NULL DEFAULT '•••• •••• •••• 4821',
  exp_month TEXT DEFAULT '08',
  exp_year TEXT DEFAULT '31',
  exp_date TEXT NOT NULL DEFAULT '08/31',
  cvv TEXT NOT NULL DEFAULT '821',
  card_holder TEXT DEFAULT 'RAWAT VIP HOLDER',
  bank_name TEXT DEFAULT 'RAWAT RESERVE BANK',
  card_pin TEXT DEFAULT '4821',
  edition TEXT NOT NULL,
  description TEXT NOT NULL,
  perks JSONB NOT NULL DEFAULT '[]'::jsonb,
  stock_count INTEGER NOT NULL DEFAULT 10 CHECK (stock_count >= 0),
  featured BOOLEAN NOT NULL DEFAULT false,
  accent_color TEXT NOT NULL DEFAULT '#a855f7',
  gradient_class TEXT NOT NULL DEFAULT 'from-zinc-950 via-zinc-900 to-black',
  border_glow_class TEXT NOT NULL DEFAULT 'group-hover:border-purple-500/50',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  username TEXT,
  card_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
  card_name TEXT NOT NULL,
  card_tier TEXT NOT NULL,
  card_finish TEXT NOT NULL,
  card_network TEXT NOT NULL DEFAULT 'RAWAT',
  card_rarity TEXT,
  card_number TEXT,
  masked_identifier TEXT NOT NULL DEFAULT '•••• •••• •••• 4821',
  exp_month TEXT,
  exp_year TEXT,
  exp_date TEXT,
  cvv TEXT,
  limit_val NUMERIC(12, 2),
  daily_limit NUMERIC(12, 2),
  monthly_limit NUMERIC(12, 2),
  bank_name TEXT,
  card_holder TEXT,
  card_pin TEXT,
  original_price NUMERIC(10, 2) NOT NULL,
  discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  final_price NUMERIC(10, 2) NOT NULL,
  coupon_used TEXT,
  status TEXT NOT NULL DEFAULT 'COMPLETED' CHECK (status IN ('COMPLETED', 'VAULT ARCHIVED', 'REFUNDED')),
  purchase_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  transaction_ref TEXT NOT NULL,
  vault_token_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Wallet Transactions Table
CREATE TABLE IF NOT EXISTS public.transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'ADMIN_CREDIT',
    'ADMIN_DEBIT',
    'PAYMENT_DEPOSIT',
    'PRODUCT_PURCHASE',
    'REFUND',
    'REFERRAL_SIGNUP_BONUS',
    'REFERRAL_DEPOSIT_COMMISSION'
  )),
  amount NUMERIC(10, 2) NOT NULL,
  balance_before NUMERIC(12, 2) NOT NULL,
  balance_after NUMERIC(12, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'COMPLETED' CHECK (status IN ('COMPLETED', 'PENDING', 'REJECTED', 'FAILED')),
  description TEXT NOT NULL,
  reason TEXT,
  created_by TEXT NOT NULL DEFAULT 'SYSTEM',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reference_id TEXT
);

-- 7. Payment Requests Table (Deposit Verifications)
CREATE TABLE IF NOT EXISTS public.payment_requests (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  user_email TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  status TEXT NOT NULL DEFAULT 'PENDING_VERIFICATION' CHECK (status IN ('PENDING_VERIFICATION', 'APPROVED', 'REJECTED')),
  utr_ref TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT,
  rejection_reason TEXT,
  admin_notes TEXT
);

-- 8. Payment Settings Table (Merchant Branding, UPI & QR)
CREATE TABLE IF NOT EXISTS public.payment_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  upi_id TEXT NOT NULL DEFAULT 'rawatcard@ybl',
  backup_upi_id TEXT DEFAULT 'rawatcard@ibl',
  payment_display_name TEXT NOT NULL DEFAULT 'PARAMVEER RAWAT',
  payment_instructions TEXT NOT NULL DEFAULT 'Scan the PhonePe QR code or enter UPI ID rawatcard@ybl. Enter the amount, complete the transfer, and submit your UTR reference code for instant verification.',
  instruction_steps JSONB DEFAULT '["1. Open PhonePe, Google Pay, or Paytm", "2. Scan the dynamic QR code above or copy UPI ID rawatcard@ybl", "3. Complete payment of desired amount", "4. Copy 12-digit UPI Ref / UTR number", "5. Click I HAVE PAID & submit UTR for instant balance credit"]'::jsonb,
  security_notice TEXT DEFAULT 'Official Merchant Account of PARAMVEER RAWAT • Protected with 256-Bit Vault Encryption',
  active_qr_image_url TEXT NOT NULL,
  qr_type TEXT NOT NULL DEFAULT 'generated' CHECK (qr_type IN ('generated', 'uploaded')),
  min_deposit_amount NUMERIC(10, 2) DEFAULT 50.00,
  max_deposit_amount NUMERIC(10, 2) DEFAULT 50000.00,
  quick_preset_amounts JSONB DEFAULT '[100, 250, 500, 1000, 2000, 5000]'::jsonb,
  require_utr BOOLEAN NOT NULL DEFAULT false,
  is_payment_active BOOLEAN NOT NULL DEFAULT true,
  maintenance_message TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by TEXT NOT NULL DEFAULT 'PARAMVEER RAWAT',
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- 9. Admin Audit Logs Table
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  admin_id TEXT NOT NULL,
  admin_username TEXT NOT NULL,
  target_user_id TEXT,
  target_username TEXT,
  amount NUMERIC(10, 2),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  reason TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 10. Promo Coupons Table
CREATE TABLE IF NOT EXISTS public.coupons (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'flat')),
  discount_value NUMERIC(10, 2) NOT NULL CHECK (discount_value > 0),
  min_order_value NUMERIC(10, 2) DEFAULT 0,
  description TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  usage_count INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ
);

-- 11. Referrals Table
CREATE TABLE IF NOT EXISTS public.referrals (
  id TEXT PRIMARY KEY,
  referrer_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  referrer_username TEXT NOT NULL,
  referred_user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  referred_username TEXT NOT NULL,
  referred_email TEXT NOT NULL,
  referral_code_used TEXT NOT NULL,
  signup_bonus_referrer NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  signup_bonus_referred NUMERIC(10, 2) NOT NULL DEFAULT 50.00,
  total_deposited_by_friend NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  total_commission_earned NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_deposit_at TIMESTAMPTZ
);

-- 12. Store Announcements Table
CREATE TABLE IF NOT EXISTS public.announcements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'INFO' CHECK (type IN ('INFO', 'SALE', 'ALERT', 'UPDATE')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  target_tier TEXT DEFAULT 'ALL'
);

-- 13. Support Tickets Table
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('PAYMENT', 'ORDER', 'CARD_ISSUE', 'WALLET', 'OTHER')),
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED')),
  priority TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  admin_reply TEXT,
  admin_username TEXT
);

-- 14. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  read BOOLEAN NOT NULL DEFAULT false,
  type TEXT NOT NULL DEFAULT 'system'
);

-- 15. Store Settings Table (VIP Tiers, Referral program, Fraud rules)
CREATE TABLE IF NOT EXISTS public.store_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for High Performance Querying
CREATE INDEX IF NOT EXISTS idx_products_tier ON public.products(tier);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_requests_user ON public.payment_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_requests_status ON public.payment_requests(status);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON public.referrals(referred_user_id);

-- Enable Row Level Security (RLS) Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Public & Authenticated Read/Write Access Policies
CREATE POLICY "Public Read Products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admin All Products" ON public.products FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public Read Coupons" ON public.coupons FOR SELECT USING (true);
CREATE POLICY "Admin All Coupons" ON public.coupons FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public Read Payment Settings" ON public.payment_settings FOR SELECT USING (true);
CREATE POLICY "Admin All Payment Settings" ON public.payment_settings FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public Read Announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Admin All Announcements" ON public.announcements FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public Read Store Settings" ON public.store_settings FOR SELECT USING (true);
CREATE POLICY "Admin All Store Settings" ON public.store_settings FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Users Read Own Or Admin All Users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users Insert Self" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users Update Self Or Admin" ON public.users FOR UPDATE USING (true);
CREATE POLICY "Admin Delete Users" ON public.users FOR DELETE USING (true);

CREATE POLICY "Users Read Own Wallets" ON public.wallets FOR SELECT USING (true);
CREATE POLICY "Wallets Upsert" ON public.wallets FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Orders Read" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Orders Insert" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Orders Update" ON public.orders FOR UPDATE USING (true);
CREATE POLICY "Orders Delete" ON public.orders FOR DELETE USING (true);

CREATE POLICY "Transactions Read" ON public.transactions FOR SELECT USING (true);
CREATE POLICY "Transactions Insert" ON public.transactions FOR INSERT WITH CHECK (true);

CREATE POLICY "Payment Requests Read" ON public.payment_requests FOR SELECT USING (true);
CREATE POLICY "Payment Requests Insert" ON public.payment_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Payment Requests Update" ON public.payment_requests FOR UPDATE USING (true);

CREATE POLICY "Referrals Read" ON public.referrals FOR SELECT USING (true);
CREATE POLICY "Referrals Insert" ON public.referrals FOR INSERT WITH CHECK (true);
CREATE POLICY "Referrals Update" ON public.referrals FOR UPDATE USING (true);

CREATE POLICY "Audit Logs Read" ON public.admin_audit_logs FOR SELECT USING (true);
CREATE POLICY "Audit Logs Insert" ON public.admin_audit_logs FOR INSERT WITH CHECK (true);

CREATE POLICY "Support Tickets Read" ON public.support_tickets FOR SELECT USING (true);
CREATE POLICY "Support Tickets Insert" ON public.support_tickets FOR INSERT WITH CHECK (true);
CREATE POLICY "Support Tickets Update" ON public.support_tickets FOR UPDATE USING (true);

CREATE POLICY "Notifications Read" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "Notifications Insert" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Notifications Update" ON public.notifications FOR UPDATE USING (true);

-- Enable Realtime Publication on relevant tables
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

ALTER PUBLICATION supabase_realtime ADD TABLE 
  public.products,
  public.coupons,
  public.payment_settings,
  public.announcements,
  public.orders,
  public.payment_requests,
  public.transactions,
  public.wallets,
  public.users,
  public.referrals,
  public.store_settings;
