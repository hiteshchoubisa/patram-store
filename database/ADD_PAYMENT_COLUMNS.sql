-- Add payment-related columns to orders table
-- Run this in your Supabase SQL editor

-- Add payment method column
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);

-- Add payment ID column (for tracking Razorpay payment ID)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_id VARCHAR(255);

-- Add Razorpay order ID column
ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(255);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON orders(payment_method);
CREATE INDEX IF NOT EXISTS idx_orders_payment_id ON orders(payment_id);

-- Update existing orders to have 'cod' as default payment method
UPDATE orders 
SET payment_method = 'cod' 
WHERE payment_method IS NULL;

-- Verify the columns were added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN ('payment_method', 'payment_id', 'razorpay_order_id');
