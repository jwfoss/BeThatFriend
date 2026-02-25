-- Be That Friend - Email Pivot Migration
-- Migrates from SMS-based to Email-based authentication and communication

-- 1. Rename phone column to email in users table
ALTER TABLE users RENAME COLUMN phone TO email;

-- 2. Rename SMS opt-in columns to email equivalents
ALTER TABLE users RENAME COLUMN sms_opted_in TO email_opted_in;
ALTER TABLE users RENAME COLUMN sms_opt_in_confirmed_at TO email_opt_in_confirmed_at;

-- 3. Rename contact_phone to contact_email in invites table
ALTER TABLE invites RENAME COLUMN contact_phone TO contact_email;

-- 4. Drop sms_verifications table (no longer needed with Supabase email auth)
DROP TABLE IF EXISTS sms_verifications;

-- 5. Update index on users table (rename phone index to email)
DROP INDEX IF EXISTS idx_users_phone;
CREATE INDEX idx_users_email ON users(email);

-- 6. Update get_todays_reminders() function to return email instead of phone
CREATE OR REPLACE FUNCTION get_todays_reminders()
RETURNS TABLE (
  recipient_email VARCHAR,
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
    recipient.email,
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
    recipient.email_opted_in = TRUE
    AND (
      (c.user_a_id = friend.id AND c.user_b_id = recipient.id)
      OR (c.user_b_id = friend.id AND c.user_a_id = recipient.id)
    )
  )
  WHERE d.date_month = today_month
  AND d.date_day = today_day;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
