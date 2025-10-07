-- Check what status values are allowed in the orders table
-- Run this in your Supabase SQL Editor

-- Step 1: Check the check constraint definition
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'orders'::regclass 
AND contype = 'c'
AND conname LIKE '%status%';

-- Step 2: Check existing status values in the table
SELECT DISTINCT status, COUNT(*) as count
FROM orders 
GROUP BY status
ORDER BY status;

-- Step 3: Check if there are any existing orders
SELECT COUNT(*) as total_orders FROM orders;

-- Step 4: Try to find the exact constraint definition
SELECT 
    tc.constraint_name,
    tc.table_name,
    cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'orders' 
AND tc.constraint_type = 'CHECK';
