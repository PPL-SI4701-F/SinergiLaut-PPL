-- ============================================
-- SinergiLaut Database Schema
-- Idempotent — safe to run multiple times
-- Run this BEFORE rls-policies.sql
-- Last updated: 2026-04-15
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUM TYPES (safe re-run with DO blocks)
-- ============================================

DO $$ BEGIN CREATE TYPE user_role AS ENUM ('admin', 'community', 'user'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE activity_status AS ENUM ('draft', 'pending_review', 'published', 'cancelled', 'completed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE activity_category AS ENUM ('cleanup', 'restoration', 'education', 'research', 'event', 'other'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE donation_status AS ENUM ('pending', 'completed', 'refunded'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE donation_type AS ENUM ('money', 'item'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE volunteer_status AS ENUM ('pending', 'approved', 'rejected', 'attended'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE sanction_type AS ENUM ('warning', 'suspend', 'ban'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE report_status AS ENUM ('draft', 'submitted', 'validated', 'rejected'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE disbursement_status AS ENUM ('pending', 'processing', 'completed', 'failed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================
-- PROFILES (extends auth.users)
-- ============================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  bio TEXT,
  role user_role NOT NULL DEFAULT 'user',
  is_active BOOLEAN NOT NULL DEFAULT true,
  -- Volunteer verification fields
  volunteer_status verification_status NOT NULL DEFAULT 'pending',
  date_of_birth DATE,
  nik TEXT,                        -- No. KTP (16 digit)
  gender TEXT,                     -- male | female
  address TEXT,                    -- Alamat lengkap
  ktp_url TEXT,                    -- URL foto KTP yang diupload
  volunteer_verified_by UUID REFERENCES auth.users(id),
  volunteer_verified_at TIMESTAMPTZ,
  volunteer_reject_note TEXT,      -- Alasan penolakan
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- COMMUNITIES
-- ============================================

CREATE TABLE IF NOT EXISTS communities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  banner_url TEXT,
  website TEXT,
  location TEXT,
  focus_areas TEXT[] DEFAULT '{}',
  member_count INTEGER NOT NULL DEFAULT 0,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  verification_status verification_status NOT NULL DEFAULT 'pending',
  is_suspended BOOLEAN NOT NULL DEFAULT false,
  -- Bank account info for disbursement
  bank_name TEXT,
  bank_account_number TEXT,
  bank_account_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Safe add columns if upgrading from old schema
DO $$ BEGIN ALTER TABLE communities ADD COLUMN bank_name TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE communities ADD COLUMN bank_account_number TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE communities ADD COLUMN bank_account_name TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- ============================================
-- COMMUNITY VERIFICATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS community_verifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE NOT NULL,
  status verification_status NOT NULL DEFAULT 'pending',
  admin_note TEXT,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  documents TEXT[] DEFAULT '{}',
  legal_name TEXT,
  establishment_year INTEGER,
  representative_name TEXT,
  representative_email TEXT,
  representative_phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- ACTIVITIES
-- ============================================

CREATE TABLE IF NOT EXISTS activities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT NOT NULL,
  category activity_category NOT NULL DEFAULT 'other',
  status activity_status NOT NULL DEFAULT 'draft',
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  execution_date TIMESTAMPTZ,          -- Tanggal pelaksanaan fisik (min 6 bulan dari sekarang)
  location TEXT NOT NULL,
  latitude DECIMAL(9,6),
  longitude DECIMAL(9,6),
  volunteer_quota INTEGER NOT NULL DEFAULT 0,
  volunteer_count INTEGER NOT NULL DEFAULT 0,
  funding_goal BIGINT NOT NULL DEFAULT 0,
  funding_raised BIGINT NOT NULL DEFAULT 0,
  allow_item_donation BOOLEAN NOT NULL DEFAULT false,
  items_needed JSONB DEFAULT NULL,     -- Array: [{item_name, target, unit_price, donated}]
  receipt_urls TEXT[] DEFAULT '{}',    -- URL foto nota/kwitansi untuk verifikasi admin
  cover_image_url TEXT,
  images TEXT[] DEFAULT '{}',
  admin_note TEXT,
  reviewed_by UUID REFERENCES profiles(id),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(community_id, slug)
);

-- Safe add columns if upgrading from old schema
DO $$ BEGIN ALTER TABLE activities ADD COLUMN execution_date TIMESTAMPTZ; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE activities ADD COLUMN items_needed JSONB DEFAULT NULL; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE activities ADD COLUMN receipt_urls TEXT[] DEFAULT '{}'; EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- ============================================
-- VOLUNTEER REGISTRATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS volunteer_registrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  reason TEXT,
  emergency_contact_name TEXT,         -- Nama kontak darurat
  emergency_contact_phone TEXT,        -- Telepon kontak darurat
  skills TEXT[] DEFAULT '{}',          -- Keahlian: medis, fotografi, logistik, dll.
  t_shirt_size TEXT,                   -- Ukuran kaos: S, M, L, XL, XXL
  status volunteer_status NOT NULL DEFAULT 'pending',
  agreed_to_terms BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(activity_id, user_id)
);

-- Safe add columns if upgrading from old schema
DO $$ BEGIN ALTER TABLE volunteer_registrations ADD COLUMN emergency_contact_name TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE volunteer_registrations ADD COLUMN emergency_contact_phone TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE volunteer_registrations ADD COLUMN skills TEXT[] DEFAULT '{}'; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE volunteer_registrations ADD COLUMN t_shirt_size TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- ============================================
-- DONATIONS
-- Alur: Donor → Midtrans → Rekening SinergiLaut → Disbursement ke Komunitas
-- ============================================

CREATE TABLE IF NOT EXISTS donations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  donor_name TEXT NOT NULL,
  donor_email TEXT NOT NULL,
  type donation_type NOT NULL DEFAULT 'money',
  -- Fields for money donation
  amount BIGINT,                             -- Nominal dalam IDR (satuan Rupiah)
  -- Midtrans integration fields
  midtrans_order_id TEXT UNIQUE,             -- Format: SL-{uuid singkat}
  midtrans_snap_token TEXT,                  -- Token Snap untuk payment page
  midtrans_transaction_id TEXT,              -- ID transaksi dari Midtrans (via webhook)
  midtrans_payment_type TEXT,                -- bank_transfer | gopay | qris | shopeepay | dll.
  midtrans_va_number TEXT,                   -- Nomor virtual account
  midtrans_expiry_time TIMESTAMPTZ,          -- Waktu kedaluwarsa pembayaran
  -- Status & metadata
  status donation_status NOT NULL DEFAULT 'pending',
  note TEXT,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- DONATION ITEMS (untuk donasi barang)
-- ============================================

CREATE TABLE IF NOT EXISTS donation_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  donation_id UUID REFERENCES donations(id) ON DELETE CASCADE NOT NULL,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  item_condition TEXT NOT NULL DEFAULT 'new',  -- new | good | fair
  description TEXT,
  tracking_number TEXT,                         -- Nomor resi pengiriman
  courier TEXT,                                 -- JNE | J&T | SiCepat | dll.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- DISBURSEMENTS
-- Pencairan dana dari SinergiLaut → Komunitas
-- ============================================

CREATE TABLE IF NOT EXISTS disbursements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  activity_id UUID REFERENCES activities(id) ON DELETE RESTRICT NOT NULL,
  community_id UUID REFERENCES communities(id) ON DELETE RESTRICT NOT NULL,
  amount BIGINT NOT NULL,                    -- Total dana yang dicairkan (IDR)
  platform_fee BIGINT NOT NULL DEFAULT 0,   -- Potongan platform SinergiLaut
  net_amount BIGINT GENERATED ALWAYS AS (amount - platform_fee) STORED,
  status disbursement_status NOT NULL DEFAULT 'pending',
  -- Detail rekening tujuan (snapshot saat pencairan)
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_name TEXT NOT NULL,
  reference_number TEXT,                     -- Nomor referensi transfer dari bank
  notes TEXT,
  disbursed_by UUID REFERENCES profiles(id) NOT NULL,
  disbursed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- REPORTS
-- ============================================

CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE NOT NULL,
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE NOT NULL,
  submitted_by UUID REFERENCES profiles(id) NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  fund_usage JSONB DEFAULT '[]',       -- Array: [{category, amount, description}]
  status report_status NOT NULL DEFAULT 'draft',
  admin_note TEXT,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  completion_status TEXT NOT NULL DEFAULT 'partial',  -- partial | completed
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- REPORT FILES
-- ============================================

CREATE TABLE IF NOT EXISTS report_files (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- JOURNEY MILESTONES
-- Data "Perjalanan Kami" dikelola oleh admin
-- ============================================

CREATE TABLE IF NOT EXISTS journey_milestones (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  year INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  impact_stat TEXT,
  icon TEXT DEFAULT 'Award',
  order_index INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- SANCTIONS
-- ============================================

CREATE TABLE IF NOT EXISTS sanctions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE NOT NULL,
  issued_by UUID REFERENCES profiles(id) NOT NULL,
  type sanction_type NOT NULL DEFAULT 'warning',
  reason TEXT NOT NULL,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- FEEDBACKS
-- ============================================

CREATE TABLE IF NOT EXISTS feedbacks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(activity_id, user_id)
);

-- ============================================
-- NOTIFICATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',  -- info | success | warning | error
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- AUDIT LOGS
-- ============================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,            -- CREATE | UPDATE | DELETE | APPROVE | REJECT | dll.
  resource_type TEXT NOT NULL,     -- activities | donations | volunteer_registrations | dll.
  resource_id UUID,
  metadata JSONB DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- FUNCTION: Auto-update updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop triggers first (safe to re-run)
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_communities_updated_at ON communities;
DROP TRIGGER IF EXISTS update_community_verifications_updated_at ON community_verifications;
DROP TRIGGER IF EXISTS update_activities_updated_at ON activities;
DROP TRIGGER IF EXISTS update_volunteer_registrations_updated_at ON volunteer_registrations;
DROP TRIGGER IF EXISTS update_donations_updated_at ON donations;
DROP TRIGGER IF EXISTS update_reports_updated_at ON reports;
DROP TRIGGER IF EXISTS update_disbursements_updated_at ON disbursements;
DROP TRIGGER IF EXISTS update_journey_milestones_updated_at ON journey_milestones;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_communities_updated_at BEFORE UPDATE ON communities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_community_verifications_updated_at BEFORE UPDATE ON community_verifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_volunteer_registrations_updated_at BEFORE UPDATE ON volunteer_registrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_donations_updated_at BEFORE UPDATE ON donations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_disbursements_updated_at BEFORE UPDATE ON disbursements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_journey_milestones_updated_at BEFORE UPDATE ON journey_milestones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TRIGGER: Auto-create profile on signup
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')::public.user_role
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- FUNCTION: Auto-update funding_raised on donation complete
-- ============================================

CREATE OR REPLACE FUNCTION update_funding_raised()
RETURNS TRIGGER AS $$
BEGIN
  -- Ketika donasi uang berstatus completed, update funding_raised
  IF NEW.type = 'money' AND NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    UPDATE activities
    SET funding_raised = funding_raised + COALESCE(NEW.amount, 0)
    WHERE id = NEW.activity_id;
  END IF;
  -- Jika donasi di-refund setelah completed, kurangi kembali
  IF NEW.type = 'money' AND NEW.status = 'refunded' AND OLD.status = 'completed' THEN
    UPDATE activities
    SET funding_raised = GREATEST(0, funding_raised - COALESCE(NEW.amount, 0))
    WHERE id = NEW.activity_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_donation_status_change ON donations;
CREATE TRIGGER on_donation_status_change
  AFTER UPDATE OF status ON donations
  FOR EACH ROW EXECUTE FUNCTION update_funding_raised();

-- ============================================
-- FUNCTION: Auto-update volunteer_count
-- ============================================

CREATE OR REPLACE FUNCTION update_volunteer_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    UPDATE activities SET volunteer_count = volunteer_count + 1 WHERE id = NEW.activity_id;
  END IF;
  IF TG_OP = 'UPDATE' AND OLD.status = 'approved' AND NEW.status != 'approved' THEN
    UPDATE activities SET volunteer_count = GREATEST(0, volunteer_count - 1) WHERE id = NEW.activity_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_volunteer_status_change ON volunteer_registrations;
CREATE TRIGGER on_volunteer_status_change
  AFTER INSERT OR UPDATE OF status ON volunteer_registrations
  FOR EACH ROW EXECUTE FUNCTION update_volunteer_count();

-- ============================================
-- INDEXES for performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_activities_community_id ON activities(community_id);
CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status);
CREATE INDEX IF NOT EXISTS idx_activities_category ON activities(category);
CREATE INDEX IF NOT EXISTS idx_activities_start_date ON activities(start_date);
CREATE INDEX IF NOT EXISTS idx_volunteer_registrations_activity_id ON volunteer_registrations(activity_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_registrations_user_id ON volunteer_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_registrations_status ON volunteer_registrations(status);
CREATE INDEX IF NOT EXISTS idx_donations_activity_id ON donations(activity_id);
CREATE INDEX IF NOT EXISTS idx_donations_user_id ON donations(user_id);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_midtrans_order_id ON donations(midtrans_order_id);
CREATE INDEX IF NOT EXISTS idx_donation_items_donation_id ON donation_items(donation_id);
CREATE INDEX IF NOT EXISTS idx_disbursements_activity_id ON disbursements(activity_id);
CREATE INDEX IF NOT EXISTS idx_disbursements_community_id ON disbursements(community_id);
CREATE INDEX IF NOT EXISTS idx_disbursements_status ON disbursements(status);
CREATE INDEX IF NOT EXISTS idx_reports_activity_id ON reports(activity_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_journey_milestones_year ON journey_milestones(year);
CREATE INDEX IF NOT EXISTS idx_journey_milestones_order ON journey_milestones(order_index);

-- ============================================
-- SEED DATA: Journey Milestones
-- (Hanya insert jika tabel kosong — idempotent)
-- ============================================

INSERT INTO journey_milestones (year, title, description, impact_stat, icon, order_index, is_published)
SELECT * FROM (VALUES
  (2020, 'SinergiLaut Didirikan',
   'SinergiLaut lahir dari keresahan akan sulitnya koordinasi antar komunitas konservasi laut di Indonesia. Platform ini hadir sebagai jembatan digital pertama untuk gerakan konservasi kolaboratif.',
   'Misi dimulai', 'Waves', 1, true),

  (2021, 'Komunitas Pertama Bergabung',
   'Sebanyak 10 komunitas konservasi dari Jawa, Bali, dan Sulawesi bergabung menjadi mitra perdana. Total 500 relawan aktif telah mendaftar dalam tahun pertama.',
   '10 komunitas, 500+ relawan', 'Users', 2, true),

  (2022, 'Sistem Donasi & Transparansi',
   'Meluncurkan sistem donasi terintegrasi dengan verifikasi penggunaan dana secara transparan. Setiap rupiah donasi dapat dilacak penggunaannya oleh publik.',
   'Rp 1M+ dana terhimpun', 'Banknote', 3, true),

  (2023, 'Ekspansi ke 50+ Komunitas',
   'Jaringan komunitas mitra SinergiLaut berkembang menjadi 50+ komunitas yang tersebar di 15 provinsi, dari Sabang hingga Papua.',
   '50+ komunitas, 15 provinsi', 'Globe', 4, true),

  (2024, 'Milestone 10.000 Relawan',
   'Mencapai tonggak bersejarah: 10.000+ relawan terdaftar dan lebih dari Rp 5 miliar dana konservasi berhasil terhimpun.',
   '10.000+ relawan, Rp 5M+ dana', 'Award', 5, true),

  (2026, 'Platform Generasi Baru',
   'Peluncuran platform generasi baru dengan fitur realtime, dashboard lengkap, integrasi Midtrans, laporan terverifikasi, dan pencairan dana transparan.',
   'Fitur lengkap & real-time', 'Zap', 6, true)
) AS v(year, title, description, impact_stat, icon, order_index, is_published)
WHERE NOT EXISTS (SELECT 1 FROM journey_milestones LIMIT 1);
