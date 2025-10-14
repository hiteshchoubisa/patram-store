-- Fix missing columns in orders table
-- Run this in your Supabase SQL Editor

-- Step 1: Check current schema
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;

-- Step 2: Add missing columns
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS total DECIMAL(10,2);

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS client TEXT;

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS message TEXT;

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS discount DECIMAL(10,2) DEFAULT 0.00;

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50);

-- Removed Razorpay columns - only COD is supported

-- Step 3: Set default values for existing orders
UPDATE public.orders 
SET discount = 0.00 
WHERE discount IS NULL;

UPDATE public.orders 
SET payment_method = 'cod' 
WHERE payment_method IS NULL;

UPDATE public.orders 
SET payment_status = 'pending' 
WHERE payment_status IS NULL;

-- Step 4: Verify the schema
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;

-- Step 5: Test insert
INSERT INTO public.orders (
    client, 
    total, 
    status, 
    items, 
    payment_method, 
    payment_status,
    discount,
    order_date
) VALUES (
    'Test Client', 
    100.00, 
    'Pending', 
    '[{"qty":1,"kind":"product","productId":"test","product_name":"Test Product","price":100.00}]',
    'cod',
    'pending',
    0.00,
    NOW()
);

-- Step 6: Clean up test record
DELETE FROM public.orders 
WHERE client = 'Test Client' AND total = 100.00;

SELECT 'Columns added successfully! ✅' as status;
