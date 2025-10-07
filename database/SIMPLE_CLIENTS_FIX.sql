-- Simple fix for clients table
-- Run this in Supabase SQL Editor

-- Step 1: Add email column
ALTER TABLE clients ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Step 2: Add auth_id column  
ALTER TABLE clients ADD COLUMN IF NOT EXISTS auth_id UUID;

-- Step 3: Add updated_at column
ALTER TABLE clients ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Step 4: Make auth_id unique (this might fail if there are duplicates)
DO $$ 
BEGIN
    -- Try to add unique constraint
    BEGIN
        ALTER TABLE clients ADD CONSTRAINT clients_auth_id_unique UNIQUE (auth_id);
    EXCEPTION WHEN duplicate_table THEN
        -- Constraint already exists, ignore
        NULL;
    WHEN others THEN
        -- Other error, log it but continue
        RAISE NOTICE 'Could not add unique constraint: %', SQLERRM;
    END;
END $$;

-- Step 5: Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Step 6: Create permissive policy
DROP POLICY IF EXISTS "Allow all operations on clients" ON clients;
CREATE POLICY "Allow all operations on clients" ON clients FOR ALL USING (true);

-- Step 7: Grant permissions
GRANT ALL ON clients TO anon, authenticated;

-- Step 8: Verify
SELECT 'Clients table updated!' as status;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'clients' 
AND table_schema = 'public'
ORDER BY ordinal_position;
