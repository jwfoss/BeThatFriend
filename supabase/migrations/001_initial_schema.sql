-- Be That Friend - Initial Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sms_opted_in BOOLEAN DEFAULT FALSE,
  sms_opt_in_confirmed_at TIMESTAMPTZ,
  invite_code VARCHAR(20) UNIQUE NOT NULL
);

-- Important dates table
CREATE TABLE important_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  label VARCHAR(100) NOT NULL,
  date_month INT NOT NULL CHECK (date_month BETWEEN 1 AND 12),
  date_day INT NOT NULL CHECK (date_day BETWEEN 1 AND 31),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Connections (mutual circles)
CREATE TABLE connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_b_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed
  created_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  UNIQUE(user_a_id, user_b_id)
);

-- Invites (invite queue tracking)
CREATE TABLE invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id UUID REFERENCES users(id) ON DELETE CASCADE,
  contact_name VARCHAR(100) NOT NULL,
  contact_phone VARCHAR(20),
  status VARCHAR(20) DEFAULT 'queued', -- queued, sent, accepted
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ
);

-- SMS verifications (double opt-in tracking)
CREATE TABLE sms_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  verification_code VARCHAR(10) NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours'
);

-- Create indexes for performance
CREATE INDEX idx_important_dates_user_id ON important_dates(user_id);
CREATE INDEX idx_important_dates_month_day ON important_dates(date_month, date_day);
CREATE INDEX idx_connections_user_a ON connections(user_a_id);
CREATE INDEX idx_connections_user_b ON connections(user_b_id);
CREATE INDEX idx_connections_status ON connections(status);
CREATE INDEX idx_invites_inviter ON invites(inviter_id);
CREATE INDEX idx_invites_status ON invites(status);
CREATE INDEX idx_users_invite_code ON users(invite_code);
CREATE INDEX idx_users_phone ON users(phone);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE important_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_verifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- RLS Policies for important_dates
-- Users can manage their own dates
CREATE POLICY "Users can manage own dates" ON important_dates
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Users can view dates of confirmed connections
CREATE POLICY "Users can view connected users dates" ON important_dates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM connections
      WHERE status = 'confirmed'
      AND (
        (user_a_id::text = auth.uid()::text AND user_b_id = important_dates.user_id)
        OR (user_b_id::text = auth.uid()::text AND user_a_id = important_dates.user_id)
      )
    )
  );

-- RLS Policies for connections
-- Users can view their own connections
CREATE POLICY "Users can view own connections" ON connections
  FOR SELECT USING (
    auth.uid()::text = user_a_id::text OR auth.uid()::text = user_b_id::text
  );

-- Users can create connections (as initiator)
CREATE POLICY "Users can create connections" ON connections
  FOR INSERT WITH CHECK (auth.uid()::text = user_a_id::text);

-- Users can update connections they're part of
CREATE POLICY "Users can update own connections" ON connections
  FOR UPDATE USING (
    auth.uid()::text = user_a_id::text OR auth.uid()::text = user_b_id::text
  );

-- RLS Policies for invites
-- Users can manage their own invites
CREATE POLICY "Users can manage own invites" ON invites
  FOR ALL USING (auth.uid()::text = inviter_id::text);

-- RLS Policies for sms_verifications
-- Users can view their own verifications
CREATE POLICY "Users can view own verifications" ON sms_verifications
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Function to generate unique invite code
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's connections with their dates
CREATE OR REPLACE FUNCTION get_connection_dates(p_user_id UUID)
RETURNS TABLE (
  connection_user_id UUID,
  connection_name VARCHAR,
  date_label VARCHAR,
  date_month INT,
  date_day INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.name,
    d.label,
    d.date_month,
    d.date_day
  FROM connections c
  JOIN users u ON (
    CASE
      WHEN c.user_a_id = p_user_id THEN c.user_b_id = u.id
      ELSE c.user_a_id = u.id
    END
  )
  JOIN important_dates d ON d.user_id = u.id
  WHERE c.status = 'confirmed'
  AND (c.user_a_id = p_user_id OR c.user_b_id = p_user_id)
  ORDER BY d.date_month, d.date_day;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get today's reminders for opted-in users
CREATE OR REPLACE FUNCTION get_todays_reminders()
RETURNS TABLE (
  recipient_phone VARCHAR,
  recipient_name VARCHAR,
  friend_name VARCHAR,
  date_label VARCHAR
) AS $$
DECLARE
  today_month INT := EXTRACT(MONTH FROM CURRENT_DATE);
  today_day INT := EXTRACT(DAY FROM CURRENT_DATE);
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    recipient.phone,
    recipient.name,
    friend.name,
    d.label
  FROM important_dates d
  JOIN users friend ON friend.id = d.user_id
  JOIN connections c ON (
    c.status = 'confirmed'
    AND (c.user_a_id = friend.id OR c.user_b_id = friend.id)
  )
  JOIN users recipient ON (
    recipient.sms_opted_in = TRUE
    AND (
      (c.user_a_id = friend.id AND c.user_b_id = recipient.id)
      OR (c.user_b_id = friend.id AND c.user_a_id = recipient.id)
    )
  )
  WHERE d.date_month = today_month
  AND d.date_day = today_day;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
