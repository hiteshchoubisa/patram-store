-- Enable RLS on users table for customer authentication
-- Run this in Supabase SQL Editor

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create permissive policy for users table
DROP POLICY IF EXISTS "Allow all operations on users" ON users;
CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true);

-- Grant permissions
GRANT ALL ON users TO anon, authenticated;

-- Verify the setup
SELECT 'Users table RLS enabled successfully! ✅' as status;
