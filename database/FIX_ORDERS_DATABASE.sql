-- Comprehensive fix for orders table
-- Run this in your Supabase SQL Editor

-- Step 1: Check current constraints and status values
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'orders'::regclass 
AND contype = 'c';

-- Step 2: Check existing status values
SELECT DISTINCT status, COUNT(*) as count
FROM orders 
GROUP BY status
ORDER BY status;

-- Step 3: Add payment columns if they don't exist
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_id VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(255);

-- Step 4: Drop the problematic constraint if it exists
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- Step 5: Create a more flexible status constraint
ALTER TABLE orders ADD CONSTRAINT orders_status_check 
CHECK (status IN ('New', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Completed'));

-- Step 6: Update existing orders to have valid status
UPDATE orders SET status = 'New' WHERE status IS NULL OR status NOT IN ('New', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Completed');

-- Step 7: Set default payment method for existing orders
UPDATE orders SET payment_method = 'cod' WHERE payment_method IS NULL;

-- Step 8: Verify everything is working
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN ('payment_method', 'payment_id', 'razorpay_order_id', 'status')
ORDER BY column_name;

-- Step 9: Test insert (this should work now)
-- INSERT INTO orders (client, order_date, status, items, message, discount, payment_method) 
-- VALUES ('Test Customer', NOW(), 'New', '[{"qty":1,"kind":"product","productId":"test"}]', 'Test Address', 0.00, 'cod');
