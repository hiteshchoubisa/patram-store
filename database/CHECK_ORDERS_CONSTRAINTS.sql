-- Check what status values are allowed in the orders table
-- Run this in your Supabase SQL Editor to see the constraints

-- Check the check constraint on status column
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'orders'::regclass 
AND contype = 'c';

-- Check existing status values in the table
SELECT DISTINCT status, COUNT(*) as count
FROM orders 
GROUP BY status
ORDER BY status;

-- Check the column definition
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name = 'status';
