-- Add the saved_addresses column to the profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS saved_addresses JSONB DEFAULT '[]'::jsonb;
