-- Add PhonePe payment columns to orders table
-- Run this in your Supabase SQL Editor

ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS phonepe_order_id VARCHAR(100);

ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS phonepe_merchant_order_id VARCHAR(100);

ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS payment_id VARCHAR(100);

SELECT 'PhonePe columns added successfully!' as status;
