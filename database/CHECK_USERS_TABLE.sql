-- Check users table data
-- Run this in Supabase SQL Editor

-- Show all users with their password hashes
SELECT 
  id,
  name,
  email,
  password_hash,
  LENGTH(password_hash) as password_length,
  role,
  created_at
FROM users
ORDER BY created_at DESC;

-- Check for any users with 'supabase_auth_user' password
SELECT 
  name,
  email,
  password_hash
FROM users 
WHERE password_hash = 'supabase_auth_user';

-- Check for any users with NULL or empty passwords
SELECT 
  name,
  email,
  password_hash
FROM users 
WHERE password_hash IS NULL OR password_hash = '';

SELECT 'Users table check completed! ✅' as status;
