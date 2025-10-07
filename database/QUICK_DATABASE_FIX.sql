-- Quick fix for orders table - add payment columns
-- Copy and paste this entire script into your Supabase SQL Editor

-- Step 1: Add the missing columns
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_id VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(255);

-- Step 2: Set default payment method for existing orders
UPDATE orders SET payment_method = 'cod' WHERE payment_method IS NULL;

-- Step 3: Verify the columns were added successfully
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN ('payment_method', 'payment_id', 'razorpay_order_id')
ORDER BY column_name;

-- Step 4: Test that the table structure is correct
SELECT COUNT(*) as total_orders FROM orders;
