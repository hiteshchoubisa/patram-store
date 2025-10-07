-- Add auth_id column to clients table
-- Run this in Supabase SQL Editor

-- Add the missing auth_id column
ALTER TABLE clients ADD COLUMN auth_id UUID;

-- Make it unique (optional, but recommended)
ALTER TABLE clients ADD CONSTRAINT clients_auth_id_unique UNIQUE (auth_id);

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'clients' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'auth_id column added successfully! ✅' as status;
