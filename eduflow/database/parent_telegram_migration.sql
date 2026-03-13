-- Step 1: Create the parent registration requests table to hold webhook data
CREATE TABLE IF NOT EXISTS parent_registration_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id BIGINT NOT NULL,
  parent_name TEXT NOT NULL,
  child_name TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Add parent_telegram_id column to profiles if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS parent_telegram_id BIGINT;
