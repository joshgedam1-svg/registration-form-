-- ==============================================================================
-- Cricket Auction League - Initial Database Schema Migration
-- Version: 1.0
-- Database: Supabase PostgreSQL
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. REGISTRATION SEQUENCE & HELPER FUNCTIONS
-- ==============================================================================

CREATE SEQUENCE IF NOT EXISTS registration_id_seq START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE FUNCTION generate_registration_id()
RETURNS TEXT AS $$
DECLARE
  current_year TEXT;
  next_val BIGINT;
  new_id TEXT;
BEGIN
  current_year := to_char(CURRENT_DATE, 'YYYY');
  next_val := nextval('registration_id_seq');
  new_id := 'CAL-' || current_year || '-' || LPAD(next_val::TEXT, 6, '0');
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Timestamp update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 2. TABLE: admin_profiles
-- ==============================================================================
CREATE TABLE IF NOT EXISTS admin_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 3. TABLE: tournament_settings
-- ==============================================================================
CREATE TABLE IF NOT EXISTS tournament_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_name TEXT NOT NULL DEFAULT 'Cricket Auction League',
  registration_fee INTEGER NOT NULL DEFAULT 500 CHECK (registration_fee >= 0),
  upi_id TEXT NOT NULL DEFAULT 'cricketauctionleague@okhdfcbank',
  upi_qr_path TEXT,
  maximum_player_capacity INTEGER NOT NULL DEFAULT 100 CHECK (maximum_player_capacity >= 0),
  registration_open BOOLEAN NOT NULL DEFAULT true,
  registration_instructions TEXT DEFAULT 'Scan QR or copy UPI ID. Pay ₹500 from your bank UPI app, copy the 12-digit UTR, and upload the payment screenshot.',
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger for tournament_settings
DROP TRIGGER IF EXISTS set_tournament_settings_timestamp ON tournament_settings;
CREATE TRIGGER set_tournament_settings_timestamp
BEFORE UPDATE ON tournament_settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 4. TABLE: players
-- ==============================================================================
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id TEXT UNIQUE NOT NULL DEFAULT generate_registration_id(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  mobile TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  city TEXT NOT NULL,
  address TEXT NOT NULL,
  profile_photo_path TEXT,
  playing_role TEXT NOT NULL CHECK (playing_role IN ('batsman', 'bowler', 'all_rounder', 'wicketkeeper')),
  batting_style TEXT NOT NULL CHECK (batting_style IN ('right_hand', 'left_hand')),
  bowling_arm TEXT NOT NULL CHECK (bowling_arm IN ('right_arm', 'left_arm', 'do_not_bowl')),
  bowling_type TEXT NOT NULL CHECK (bowling_type IN ('fast', 'medium', 'spin', 'not_applicable')),
  experience_level TEXT NOT NULL CHECK (experience_level IN ('beginner', '1_2_years', '3_5_years', '5_plus_years')),
  previous_team_name TEXT,
  previous_captain_name TEXT,
  previous_tournament BOOLEAN NOT NULL DEFAULT false,
  previous_tournament_name TEXT,
  additional_information TEXT,
  emergency_contact_name TEXT NOT NULL,
  emergency_relationship TEXT NOT NULL,
  emergency_mobile TEXT NOT NULL,
  registration_status TEXT NOT NULL DEFAULT 'under_review' CHECK (registration_status IN ('under_review', 'approved', 'rejected')),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger for players
DROP TRIGGER IF EXISTS set_players_timestamp ON players;
CREATE TRIGGER set_players_timestamp
BEFORE UPDATE ON players
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes on players
CREATE INDEX IF NOT EXISTS idx_players_registration_id ON players(registration_id);
CREATE INDEX IF NOT EXISTS idx_players_mobile ON players(mobile);
CREATE INDEX IF NOT EXISTS idx_players_email ON players(email);
CREATE INDEX IF NOT EXISTS idx_players_playing_role ON players(playing_role);
CREATE INDEX IF NOT EXISTS idx_players_registration_status ON players(registration_status);
CREATE INDEX IF NOT EXISTS idx_players_created_at ON players(created_at DESC);

-- ==============================================================================
-- 5. TABLE: payments
-- ==============================================================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL DEFAULT 500 CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'INR',
  payment_method TEXT NOT NULL DEFAULT 'UPI',
  utr_number TEXT NOT NULL UNIQUE,
  screenshot_path TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending_verification' CHECK (payment_status IN ('pending_verification', 'verified', 'rejected')),
  rejection_reason TEXT,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger for payments
DROP TRIGGER IF EXISTS set_payments_timestamp ON payments;
CREATE TRIGGER set_payments_timestamp
BEFORE UPDATE ON payments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes on payments
CREATE INDEX IF NOT EXISTS idx_payments_player_id ON payments(player_id);
CREATE INDEX IF NOT EXISTS idx_payments_utr_number ON payments(utr_number);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);

-- ==============================================================================
-- 6. TABLE: admin_activity_logs
-- ==============================================================================
CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON admin_activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_admin_id ON admin_activity_logs(admin_id);

-- ==============================================================================
-- 7. ATOMIC TRANSACTION: verify_payment_transaction
-- ==============================================================================
CREATE OR REPLACE FUNCTION verify_payment_transaction(
  p_payment_id UUID,
  p_admin_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_settings RECORD;
  v_payment RECORD;
  v_verified_count INTEGER;
  v_result JSONB;
BEGIN
  -- 1. Lock settings for concurrency safety
  SELECT * INTO v_settings FROM tournament_settings LIMIT 1 FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tournament settings not configured';
  END IF;

  -- 2. Count current verified players
  SELECT COUNT(*) INTO v_verified_count FROM payments WHERE payment_status = 'verified';

  -- 3. Check capacity
  IF v_verified_count >= v_settings.maximum_player_capacity THEN
    RAISE EXCEPTION 'Tournament maximum capacity of % reached', v_settings.maximum_player_capacity;
  END IF;

  -- 4. Lock & check payment
  SELECT * INTO v_payment FROM payments WHERE id = p_payment_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment record not found';
  END IF;

  IF v_payment.payment_status != 'pending_verification' THEN
    RAISE EXCEPTION 'Payment is already %', v_payment.payment_status;
  END IF;

  -- 5. Update payment status to verified
  UPDATE payments
  SET payment_status = 'verified',
      verified_by = p_admin_id,
      verified_at = NOW(),
      rejection_reason = NULL,
      updated_at = NOW()
  WHERE id = p_payment_id;

  -- 6. Insert audit log
  INSERT INTO admin_activity_logs (
    admin_id,
    action,
    entity_type,
    entity_id,
    old_values,
    new_values
  ) VALUES (
    p_admin_id,
    'payment_verified',
    'payment',
    p_payment_id,
    jsonb_build_object('payment_status', v_payment.payment_status),
    jsonb_build_object(
      'payment_status', 'verified',
      'verified_at', NOW(),
      'verified_by', p_admin_id
    )
  );

  v_result := jsonb_build_object(
    'success', true,
    'payment_id', p_payment_id,
    'verified_count', v_verified_count + 1,
    'maximum_capacity', v_settings.maximum_player_capacity
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Helper function to check if current user is an active admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE id = auth.uid() AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on all tables
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- Policies for admin_profiles
CREATE POLICY "Admins can view admin profiles"
  ON admin_profiles FOR SELECT
  USING (is_admin());

CREATE POLICY "Super admins can manage admin profiles"
  ON admin_profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE id = auth.uid() AND role = 'super_admin' AND is_active = true
    )
  );

-- Policies for tournament_settings
-- Anyone can view public tournament settings (fees, upi_id, open status)
CREATE POLICY "Public read for tournament settings"
  ON tournament_settings FOR SELECT
  USING (true);

-- Only admins can update settings
CREATE POLICY "Admins can update tournament settings"
  ON tournament_settings FOR UPDATE
  USING (is_admin());

-- Policies for players
-- Anonymous/Public: No direct SELECT/UPDATE/DELETE. Insert via server endpoint.
CREATE POLICY "Admins have full access to players"
  ON players FOR ALL
  USING (is_admin());

-- Policies for payments
CREATE POLICY "Admins have full access to payments"
  ON payments FOR ALL
  USING (is_admin());

-- Policies for admin_activity_logs
CREATE POLICY "Admins can view activity logs"
  ON admin_activity_logs FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can insert activity logs"
  ON admin_activity_logs FOR INSERT
  WITH CHECK (is_admin());

-- ==============================================================================
-- 9. SUPABASE STORAGE BUCKETS SETUP
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('payment-screenshots', 'payment-screenshots', false, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']),
  ('player-photos', 'player-photos', true, 3145728, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage Policies for payment-screenshots (Private, admin read only)
CREATE POLICY "Admins can view payment screenshots"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'payment-screenshots' AND is_admin());

-- Storage Policies for player-photos (Public read)
CREATE POLICY "Public read player photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'player-photos');

