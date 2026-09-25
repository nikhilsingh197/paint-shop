-- Add fcm_token column to profiles table to store the device push notification token
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS fcm_token TEXT;
