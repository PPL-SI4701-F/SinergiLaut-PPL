-- ============================================
-- SinergiLaut - Paste into NEW Supabase Project
-- Generated from local SQL + live project metadata.
-- Source project: vgjqnmoydwhyryihttys (SinergiLaut PPL Kelompok F)
-- Generated: 2026-06-15
--
-- Paste this whole file into Supabase SQL Editor on a fresh project.
-- This copies schema, functions, triggers, RLS policies, grants, storage bucket/policies,
-- realtime publications, and journey milestone seed data.
-- It does not copy auth users, uploaded storage files, or production table data.
-- ============================================
-- ============================================
-- SinergiLaut Database Schema
-- Idempotent ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â safe to run multiple times
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
DO $$ BEGIN CREATE TYPE volunteer_verify_status AS ENUM ('pending', 'approved', 'rejected'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE activity_status AS ENUM ('draft', 'pending_review', 'published', 'ongoing', 'cancelled', 'completed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
-- Tambahkan nilai 'ongoing' untuk database lama yang sudah punya tipe ini tanpa nilai tsb
ALTER TYPE activity_status ADD VALUE IF NOT EXISTS 'ongoing' AFTER 'published';
DO $$ BEGIN CREATE TYPE activity_category AS ENUM ('cleanup', 'restoration', 'education', 'research', 'event', 'other'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE donation_status AS ENUM ('pending', 'completed', 'refunded'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE donation_type AS ENUM ('money', 'item'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE volunteer_status AS ENUM ('pending', 'approved', 'rejected', 'attended', 'absent'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
ALTER TYPE volunteer_status ADD VALUE IF NOT EXISTS 'absent' AFTER 'attended';
DO $$ BEGIN CREATE TYPE sanction_type AS ENUM ('warning', 'suspend', 'ban'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE report_status AS ENUM ('draft', 'submitted', 'validated', 'rejected'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE disbursement_status AS ENUM ('pending', 'processing', 'completed', 'failed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE edit_request_status AS ENUM ('pending', 'approved', 'rejected', 'completed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

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
  volunteer_status volunteer_verify_status NOT NULL DEFAULT 'pending',
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
  -- Contact & admin info shown on the community profile
  email TEXT,
  phone TEXT,
  instagram TEXT,
  facebook TEXT,
  twitter TEXT,
  admin_name TEXT,
  focus_areas TEXT[] DEFAULT '{}',
  member_count INTEGER NOT NULL DEFAULT 0,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  verification_status verification_status NOT NULL DEFAULT 'pending',
  is_suspended BOOLEAN NOT NULL DEFAULT false,
  is_banned BOOLEAN NOT NULL DEFAULT false,
  -- Bank account info for disbursement
  bank_name TEXT,
  bank_account_number TEXT,
  bank_account_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Safe add columns if upgrading from old schema
DO $$ BEGIN ALTER TABLE communities ADD COLUMN admin_name TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE communities ADD COLUMN is_banned BOOLEAN NOT NULL DEFAULT false; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
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
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(community_id, slug)
);

-- Safe add columns if upgrading from old schema
DO $$ BEGIN ALTER TABLE activities ADD COLUMN execution_date TIMESTAMPTZ; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE activities ADD COLUMN is_featured BOOLEAN NOT NULL DEFAULT false; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
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
  attendance_proof_url TEXT,           -- URL bukti foto/gambar kehadiran (wajib saat ditandai hadir)
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
DO $$ BEGIN ALTER TABLE volunteer_registrations ADD COLUMN attendance_proof_url TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- ============================================
-- DONATIONS
-- Alur: Donor ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ Midtrans ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ Rekening SinergiLaut ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ Disbursement ke Komunitas
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
-- Pencairan dana dari SinergiLaut ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ Komunitas
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
-- ACTIVITY EDIT REQUESTS
-- Pengajuan edit kegiatan aktif (published) oleh komunitas, perlu disetujui admin
-- ============================================

CREATE TABLE IF NOT EXISTS activity_edit_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE NOT NULL,
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE NOT NULL,
  submitted_by UUID REFERENCES profiles(id) NOT NULL,
  reason TEXT NOT NULL,
  status edit_request_status NOT NULL DEFAULT 'pending',
  admin_note TEXT,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_edit_requests_activity_id ON activity_edit_requests(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_edit_requests_community_id ON activity_edit_requests(community_id);
CREATE INDEX IF NOT EXISTS idx_activity_edit_requests_status ON activity_edit_requests(status);

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

-- Enable Realtime for notifications table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
  END IF;
END $$;

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
DROP TRIGGER IF EXISTS update_activity_edit_requests_updated_at ON activity_edit_requests;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_communities_updated_at BEFORE UPDATE ON communities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_community_verifications_updated_at BEFORE UPDATE ON community_verifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_volunteer_registrations_updated_at BEFORE UPDATE ON volunteer_registrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_donations_updated_at BEFORE UPDATE ON donations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_disbursements_updated_at BEFORE UPDATE ON disbursements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_journey_milestones_updated_at BEFORE UPDATE ON journey_milestones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_activity_edit_requests_updated_at BEFORE UPDATE ON activity_edit_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TRIGGER: Auto-create profile on signup
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')::public.user_role,
    NULLIF(NEW.raw_user_meta_data->>'phone', '')
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
  -- Ketika donasi (uang ATAU barang/fulfillment) berstatus completed, tambahkan nilainya ke funding_raised
  -- Donasi barang menyimpan nilai (harga + markup) di kolom amount saat completeFulfillmentDonation()
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    UPDATE activities
    SET funding_raised = funding_raised + COALESCE(NEW.amount, 0)
    WHERE id = NEW.activity_id;
  END IF;
  -- Jika donasi di-refund setelah completed, kurangi kembali
  IF NEW.status = 'refunded' AND OLD.status = 'completed' THEN
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

CREATE OR REPLACE FUNCTION handle_volunteer_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  counted_statuses volunteer_status[] := ARRAY['approved', 'attended']::volunteer_status[];
  old_counts BOOLEAN := false;
  new_counts BOOLEAN := false;
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.status = ANY(counted_statuses) THEN
      UPDATE activities SET volunteer_count = COALESCE(volunteer_count, 0) + 1 WHERE id = NEW.activity_id;
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    old_counts := OLD.status = ANY(counted_statuses);
    new_counts := NEW.status = ANY(counted_statuses);

    IF old_counts AND NOT new_counts THEN
      UPDATE activities SET volunteer_count = GREATEST(COALESCE(volunteer_count, 0) - 1, 0) WHERE id = OLD.activity_id;
    ELSIF (NOT old_counts) AND new_counts THEN
      UPDATE activities SET volunteer_count = COALESCE(volunteer_count, 0) + 1 WHERE id = NEW.activity_id;
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'DELETE' THEN
    IF OLD.status = ANY(counted_statuses) THEN
      UPDATE activities SET volunteer_count = GREATEST(COALESCE(volunteer_count, 0) - 1, 0) WHERE id = OLD.activity_id;
    END IF;
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS on_volunteer_status_change ON volunteer_registrations;
DROP TRIGGER IF EXISTS update_volunteer_count ON volunteer_registrations;
CREATE TRIGGER update_volunteer_count
  AFTER INSERT OR UPDATE OR DELETE ON volunteer_registrations
  FOR EACH ROW EXECUTE FUNCTION handle_volunteer_status_change();

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
-- (Hanya insert jika tabel kosong ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â idempotent)
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

-- ============================================
-- STORAGE BUCKETS & POLICIES
-- ============================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('sinergilaut-assets', 'sinergilaut-assets', true) 
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Access to SinergiLaut Assets" ON storage.objects;
CREATE POLICY "Public Access to SinergiLaut Assets" 
ON storage.objects FOR SELECT USING ( bucket_id = 'sinergilaut-assets' );

DROP POLICY IF EXISTS "Users can upload assets" ON storage.objects;
CREATE POLICY "Users can upload assets" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'sinergilaut-assets' AND auth.role() = 'authenticated' );

DROP POLICY IF EXISTS "Users can update their own assets" ON storage.objects;
CREATE POLICY "Users can update their own assets"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'sinergilaut-assets' AND auth.uid() = owner );

DROP POLICY IF EXISTS "Users can delete their own assets" ON storage.objects;
CREATE POLICY "Users can delete their own assets"
ON storage.objects FOR DELETE
USING ( bucket_id = 'sinergilaut-assets' AND auth.uid() = owner );


-- ============================================
-- SinergiLaut - Row Level Security Policies
-- Run AFTER schema.sql
-- Last updated: 2026-04-15
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE disbursements ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE sanctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE journey_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_edit_requests ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Helper Functions
-- ============================================

-- Get current user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT get_user_role() = 'admin';
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if current user owns a community
CREATE OR REPLACE FUNCTION owns_community(community_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM communities WHERE id = community_id AND owner_id = auth.uid());
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================
-- PROFILES policies
-- ============================================

DROP POLICY IF EXISTS "Profiles are publicly readable" ON profiles;
CREATE POLICY "Profiles are publicly readable"
  ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admin can update any profile" ON profiles;
CREATE POLICY "Admin can update any profile"
  ON profiles FOR UPDATE USING (is_admin());

-- ============================================
-- COMMUNITIES policies
-- ============================================

-- Public can read verified, non-suspended communities
DROP POLICY IF EXISTS "Public can read verified communities" ON communities;
CREATE POLICY "Public can read verified communities"
  ON communities FOR SELECT
  USING (is_verified = true AND is_suspended = false);

-- Admin can read all communities
DROP POLICY IF EXISTS "Admin can read all communities" ON communities;
CREATE POLICY "Admin can read all communities"
  ON communities FOR SELECT USING (is_admin());

-- Community owner can read their own community
DROP POLICY IF EXISTS "Community owner can read own community" ON communities;
CREATE POLICY "Community owner can read own community"
  ON communities FOR SELECT USING (owner_id = auth.uid());

-- Community owners can update their own community
DROP POLICY IF EXISTS "Community owner can update own" ON communities;
CREATE POLICY "Community owner can update own"
  ON communities FOR UPDATE USING (owner_id = auth.uid());

-- Admin can update any community
DROP POLICY IF EXISTS "Admin can update any community" ON communities;
CREATE POLICY "Admin can update any community"
  ON communities FOR UPDATE USING (is_admin());

-- Authenticated users can create communities
DROP POLICY IF EXISTS "Authenticated users can create communities" ON communities;
CREATE POLICY "Authenticated users can create communities"
  ON communities FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND owner_id = auth.uid());

-- ============================================
-- COMMUNITY VERIFICATIONS policies
-- ============================================

DROP POLICY IF EXISTS "Admin can read all verifications" ON community_verifications;
CREATE POLICY "Admin can read all verifications"
  ON community_verifications FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Community owner can read own verification" ON community_verifications;
CREATE POLICY "Community owner can read own verification"
  ON community_verifications FOR SELECT
  USING (EXISTS (SELECT 1 FROM communities c WHERE c.id = community_id AND c.owner_id = auth.uid()));

DROP POLICY IF EXISTS "Admin can update verifications" ON community_verifications;
CREATE POLICY "Admin can update verifications"
  ON community_verifications FOR UPDATE USING (is_admin());

DROP POLICY IF EXISTS "Authenticated users can create verification" ON community_verifications;
CREATE POLICY "Authenticated users can create verification"
  ON community_verifications FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- ACTIVITIES policies
-- ============================================

DROP POLICY IF EXISTS "Public can view published activities" ON activities;
CREATE POLICY "Public can view published activities"
  ON activities FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Admin can view all activities" ON activities;
CREATE POLICY "Admin can view all activities"
  ON activities FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Community can view own activities" ON activities;
CREATE POLICY "Community can view own activities"
  ON activities FOR SELECT
  USING (owns_community(community_id));

DROP POLICY IF EXISTS "Community can create activities" ON activities;
CREATE POLICY "Community can create activities"
  ON activities FOR INSERT
  WITH CHECK (owns_community(community_id));

DROP POLICY IF EXISTS "Community can update own activities" ON activities;
CREATE POLICY "Community can update own activities"
  ON activities FOR UPDATE USING (owns_community(community_id));

DROP POLICY IF EXISTS "Admin can update any activity" ON activities;
CREATE POLICY "Admin can update any activity"
  ON activities FOR UPDATE USING (is_admin());

-- ============================================
-- VOLUNTEER REGISTRATIONS policies
-- ============================================

DROP POLICY IF EXISTS "Users can view own volunteer registrations" ON volunteer_registrations;
CREATE POLICY "Users can view own volunteer registrations"
  ON volunteer_registrations FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Community can view activity volunteer registrations" ON volunteer_registrations;
CREATE POLICY "Community can view activity volunteer registrations"
  ON volunteer_registrations FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM activities a
    WHERE a.id = activity_id AND owns_community(a.community_id)
  ));

DROP POLICY IF EXISTS "Admin can view all volunteer registrations" ON volunteer_registrations;
CREATE POLICY "Admin can view all volunteer registrations"
  ON volunteer_registrations FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Authenticated users can register as volunteer" ON volunteer_registrations;
CREATE POLICY "Authenticated users can register as volunteer"
  ON volunteer_registrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Community can update volunteer status" ON volunteer_registrations;
CREATE POLICY "Community can update volunteer status"
  ON volunteer_registrations FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM activities a
    WHERE a.id = activity_id AND owns_community(a.community_id)
  ));

-- ============================================
-- DONATIONS policies
-- ============================================

DROP POLICY IF EXISTS "Public can view public donations" ON donations;
CREATE POLICY "Public can view public donations"
  ON donations FOR SELECT
  USING (status = 'completed' AND is_anonymous = false);

DROP POLICY IF EXISTS "Users can view own donations" ON donations;
CREATE POLICY "Users can view own donations"
  ON donations FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Community can view activity donations" ON donations;
CREATE POLICY "Community can view activity donations"
  ON donations FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM activities a
    WHERE a.id = activity_id AND owns_community(a.community_id)
  ));

DROP POLICY IF EXISTS "Admin can view all donations" ON donations;
CREATE POLICY "Admin can view all donations"
  ON donations FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Anyone can create donations" ON donations;
CREATE POLICY "Anyone can create donations"
  ON donations FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin can update donations" ON donations;
CREATE POLICY "Admin can update donations"
  ON donations FOR UPDATE USING (is_admin());

-- Allow service role to update donations (for Midtrans webhook)
DROP POLICY IF EXISTS "Service role can update donations" ON donations;
CREATE POLICY "Service role can update donations"
  ON donations FOR UPDATE WITH CHECK (true);

-- ============================================
-- DONATION ITEMS policies
-- ============================================

DROP POLICY IF EXISTS "View donation items if can view donation" ON donation_items;
CREATE POLICY "View donation items if can view donation"
  ON donation_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM donations d
    WHERE d.id = donation_id AND (
      d.user_id = auth.uid() OR
      is_admin() OR
      EXISTS (SELECT 1 FROM activities a WHERE a.id = d.activity_id AND owns_community(a.community_id))
    )
  ));

DROP POLICY IF EXISTS "Anyone can insert donation items" ON donation_items;
CREATE POLICY "Anyone can insert donation items"
  ON donation_items FOR INSERT WITH CHECK (true);

-- ============================================
-- DISBURSEMENTS policies
-- ============================================

DROP POLICY IF EXISTS "Admin can view all disbursements" ON disbursements;
CREATE POLICY "Admin can view all disbursements"
  ON disbursements FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Community can view own disbursements" ON disbursements;
CREATE POLICY "Community can view own disbursements"
  ON disbursements FOR SELECT
  USING (owns_community(community_id));

DROP POLICY IF EXISTS "Admin can create disbursements" ON disbursements;
CREATE POLICY "Admin can create disbursements"
  ON disbursements FOR INSERT WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admin can update disbursements" ON disbursements;
CREATE POLICY "Admin can update disbursements"
  ON disbursements FOR UPDATE USING (is_admin());

-- ============================================
-- REPORTS policies
-- ============================================

DROP POLICY IF EXISTS "Public can view validated reports" ON reports;
CREATE POLICY "Public can view validated reports"
  ON reports FOR SELECT USING (status = 'validated');

DROP POLICY IF EXISTS "Community can view own reports" ON reports;
CREATE POLICY "Community can view own reports"
  ON reports FOR SELECT USING (owns_community(community_id));

DROP POLICY IF EXISTS "Admin can view all reports" ON reports;
CREATE POLICY "Admin can view all reports"
  ON reports FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Community can create reports" ON reports;
CREATE POLICY "Community can create reports"
  ON reports FOR INSERT
  WITH CHECK (owns_community(community_id) AND submitted_by = auth.uid());

DROP POLICY IF EXISTS "Community can update own reports" ON reports;
CREATE POLICY "Community can update own reports"
  ON reports FOR UPDATE
  USING (owns_community(community_id) AND status IN ('draft', 'submitted'));

DROP POLICY IF EXISTS "Admin can update any report" ON reports;
CREATE POLICY "Admin can update any report"
  ON reports FOR UPDATE USING (is_admin());

-- ============================================
-- REPORT FILES policies
-- ============================================

DROP POLICY IF EXISTS "Public can view files of validated reports" ON report_files;
CREATE POLICY "Public can view files of validated reports"
  ON report_files FOR SELECT
  USING (EXISTS (SELECT 1 FROM reports r WHERE r.id = report_id AND r.status = 'validated'));

DROP POLICY IF EXISTS "Community can view own report files" ON report_files;
CREATE POLICY "Community can view own report files"
  ON report_files FOR SELECT
  USING (EXISTS (SELECT 1 FROM reports r WHERE r.id = report_id AND owns_community(r.community_id)));

DROP POLICY IF EXISTS "Admin can view all report files" ON report_files;
CREATE POLICY "Admin can view all report files"
  ON report_files FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Community can insert report files" ON report_files;
CREATE POLICY "Community can insert report files"
  ON report_files FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM reports r WHERE r.id = report_id AND owns_community(r.community_id)));

-- ============================================
-- ACTIVITY EDIT REQUESTS policies
-- ============================================

DROP POLICY IF EXISTS "Community can view own edit requests" ON activity_edit_requests;
CREATE POLICY "Community can view own edit requests"
  ON activity_edit_requests FOR SELECT USING (owns_community(community_id));

DROP POLICY IF EXISTS "Admin can view all edit requests" ON activity_edit_requests;
CREATE POLICY "Admin can view all edit requests"
  ON activity_edit_requests FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Community can create edit requests for published activities" ON activity_edit_requests;
CREATE POLICY "Community can create edit requests for published activities"
  ON activity_edit_requests FOR INSERT
  WITH CHECK (
    owns_community(community_id)
    AND submitted_by = auth.uid()
    AND EXISTS (SELECT 1 FROM activities a WHERE a.id = activity_id AND a.status = 'published')
  );

DROP POLICY IF EXISTS "Admin can update edit requests" ON activity_edit_requests;
CREATE POLICY "Admin can update edit requests"
  ON activity_edit_requests FOR UPDATE USING (is_admin());

-- ============================================
-- SANCTIONS policies
-- ============================================

DROP POLICY IF EXISTS "Admin can manage sanctions" ON sanctions;
CREATE POLICY "Admin can manage sanctions"
  ON sanctions FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Community can view own sanctions" ON sanctions;
CREATE POLICY "Community can view own sanctions"
  ON sanctions FOR SELECT USING (owns_community(community_id));

-- ============================================
-- FEEDBACKS policies
-- ============================================

DROP POLICY IF EXISTS "Public can read public feedbacks" ON feedbacks;
CREATE POLICY "Public can read public feedbacks"
  ON feedbacks FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "Users can view own feedbacks" ON feedbacks;
CREATE POLICY "Users can view own feedbacks"
  ON feedbacks FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Attended volunteers can create feedback" ON feedbacks;
CREATE POLICY "Attended volunteers can create feedback"
  ON feedbacks FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM volunteer_registrations vr
      WHERE vr.activity_id = feedbacks.activity_id
        AND vr.user_id = auth.uid()
        AND vr.status = 'attended'
    )
  );

DROP POLICY IF EXISTS "Attended volunteers can update own feedback" ON feedbacks;
CREATE POLICY "Attended volunteers can update own feedback"
  ON feedbacks FOR UPDATE
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM volunteer_registrations vr
      WHERE vr.activity_id = feedbacks.activity_id
        AND vr.user_id = auth.uid()
        AND vr.status = 'attended'
    )
  );

-- ============================================
-- NOTIFICATIONS policies
-- ============================================

DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Service role can insert notifications" ON notifications;
CREATE POLICY "Service role can insert notifications"
  ON notifications FOR INSERT WITH CHECK (true);

-- ============================================
-- AUDIT LOGS policies
-- ============================================

DROP POLICY IF EXISTS "Admin can view audit logs" ON audit_logs;
CREATE POLICY "Admin can view audit logs"
  ON audit_logs FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Service role can insert audit logs" ON audit_logs;
CREATE POLICY "Service role can insert audit logs"
  ON audit_logs FOR INSERT WITH CHECK (true);

-- ============================================
-- JOURNEY MILESTONES policies
-- ============================================

DROP POLICY IF EXISTS "Public can read published milestones" ON journey_milestones;
CREATE POLICY "Public can read published milestones"
  ON journey_milestones FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "Admin can read all milestones" ON journey_milestones;
CREATE POLICY "Admin can read all milestones"
  ON journey_milestones FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Admin can create milestones" ON journey_milestones;
CREATE POLICY "Admin can create milestones"
  ON journey_milestones FOR INSERT WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admin can update milestones" ON journey_milestones;
CREATE POLICY "Admin can update milestones"
  ON journey_milestones FOR UPDATE USING (is_admin());

DROP POLICY IF EXISTS "Admin can delete milestones" ON journey_milestones;
CREATE POLICY "Admin can delete milestones"
  ON journey_milestones FOR DELETE USING (is_admin());

-- ============================================
-- LIVE PROJECT COMPATIBILITY PATCH
-- Source checked from project vgjqnmoydwhyryihttys on 2026-06-15
-- This section mirrors important live DB changes not fully captured by older local SQL files.
-- ============================================

-- Ensure current enum/table shape from the live project.
DO $$ BEGIN CREATE TYPE volunteer_verify_status AS ENUM ('pending', 'approved', 'rejected'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
ALTER TYPE volunteer_status ADD VALUE IF NOT EXISTS 'absent' AFTER 'attended';

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'volunteer_status'
      AND udt_name <> 'volunteer_verify_status'
  ) THEN
    ALTER TABLE public.profiles ALTER COLUMN volunteer_status DROP DEFAULT;
    ALTER TABLE public.profiles
      ALTER COLUMN volunteer_status TYPE volunteer_verify_status
      USING volunteer_status::text::volunteer_verify_status;
    ALTER TABLE public.profiles
      ALTER COLUMN volunteer_status SET DEFAULT 'pending'::volunteer_verify_status;
  END IF;
END $$;

DO $$ BEGIN ALTER TABLE public.communities ADD COLUMN admin_name TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.communities ADD COLUMN is_banned BOOLEAN NOT NULL DEFAULT false; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.activities ADD COLUMN is_featured BOOLEAN NOT NULL DEFAULT false; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.volunteer_registrations ADD COLUMN attendance_proof_url TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- Realtime tables used by the app.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'activities'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.activities;
  END IF;
END $$;

-- Grants observed on the live project.
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON SCHEMA public TO postgres, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;

DO $$
DECLARE
  t TEXT;
  public_select_tables TEXT[] := ARRAY[
    'activities', 'communities', 'profiles', 'reports', 'report_files',
    'journey_milestones', 'feedbacks', 'donations', 'donation_items'
  ];
  all_tables TEXT[] := ARRAY[
    'activities', 'activity_edit_requests', 'audit_logs', 'communities',
    'community_verifications', 'disbursements', 'donation_items', 'donations',
    'feedbacks', 'journey_milestones', 'notifications', 'profiles',
    'report_files', 'reports', 'sanctions', 'volunteer_registrations'
  ];
BEGIN
  FOREACH t IN ARRAY all_tables LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('GRANT SELECT ON public.%I TO anon, authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);

    EXECUTE format('DROP POLICY IF EXISTS "Admin full access" ON public.%I', t);
    EXECUTE format('CREATE POLICY "Admin full access" ON public.%I FOR ALL TO service_role USING (true) WITH CHECK (true)', t);
  END LOOP;

  FOREACH t IN ARRAY public_select_tables LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Public select" ON public.%I', t);
    EXECUTE format('CREATE POLICY "Public select" ON public.%I FOR SELECT USING (true)', t);

    EXECUTE format('DROP POLICY IF EXISTS "Service role all" ON public.%I', t);
    EXECUTE format('CREATE POLICY "Service role all" ON public.%I FOR ALL TO service_role USING (true) WITH CHECK (true)', t);
  END LOOP;
END $$;

-- Live project also has profile update permission for authenticated users.
GRANT UPDATE ON public.profiles TO authenticated;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Keep the live public read policies that existed alongside the broad Public select policies.
DROP POLICY IF EXISTS "Public can view published activities" ON public.activities;
CREATE POLICY "Public can view published activities"
  ON public.activities FOR SELECT
  USING (status = ANY (ARRAY['published'::activity_status, 'completed'::activity_status]));

DROP POLICY IF EXISTS "Public can read verified communities" ON public.communities;
CREATE POLICY "Public can read verified communities"
  ON public.communities FOR SELECT
  USING (is_verified = true);

DROP POLICY IF EXISTS "Public can view validated reports" ON public.reports;
CREATE POLICY "Public can view validated reports"
  ON public.reports FOR SELECT
  USING (status = 'validated'::report_status);

DROP POLICY IF EXISTS "Public can read published milestones" ON public.journey_milestones;
CREATE POLICY "Public can read published milestones"
  ON public.journey_milestones FOR SELECT
  USING (is_published = true);

DROP POLICY IF EXISTS "Public can view report files" ON public.report_files;
CREATE POLICY "Public can view report files"
  ON public.report_files FOR SELECT
  USING (true);

-- Activity edit request policies as used by the app.
DROP POLICY IF EXISTS "Community can view own edit requests" ON public.activity_edit_requests;
CREATE POLICY "Community can view own edit requests"
  ON public.activity_edit_requests FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.communities c
    WHERE c.id = activity_edit_requests.community_id AND c.owner_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Community can create edit requests for published activities" ON public.activity_edit_requests;
CREATE POLICY "Community can create edit requests for published activities"
  ON public.activity_edit_requests FOR INSERT
  WITH CHECK (
    submitted_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.communities c
      WHERE c.id = activity_edit_requests.community_id AND c.owner_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM public.activities a
      WHERE a.id = activity_edit_requests.activity_id AND a.status = 'published'::activity_status
    )
  );

DROP POLICY IF EXISTS "Service role all" ON public.activity_edit_requests;
CREATE POLICY "Service role all"
  ON public.activity_edit_requests FOR ALL TO service_role
  USING (true) WITH CHECK (true);
