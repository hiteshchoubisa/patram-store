-- Complete Working Solution - Based on partram-management approach
-- Run this in your Supabase SQL Editor

-- Step 1: Add order_number column if it doesn't exist
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS order_number TEXT;

-- Step 2: Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders (order_number);

-- Step 3: Check current state
SELECT 
  id,
  order_number,
  client,
  order_date,
  created_at
FROM public.orders 
WHERE order_number IS NULL
LIMIT 5;

-- Step 4: Fix existing orders using the working approach
-- Use created_at date instead of order_date to match backend behavior
UPDATE public.orders 
SET order_number = 'ORD-' || 
  TO_CHAR(created_at, 'YYYYMMDD') || '-' ||
  LPAD(
    (SELECT COUNT(*) + 1 
     FROM public.orders o2 
     WHERE o2.created_at < orders.created_at 
     AND o2.order_number IS NOT NULL
    )::TEXT, 
    4, '0'
  )
WHERE order_number IS NULL;

-- Step 5: Create function to generate order numbers for new orders
-- This matches the backend behavior exactly and continues the sequence
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    new_order_number TEXT;
    today_date TEXT;
    sequence_number INTEGER;
BEGIN
    -- Get today's date in YYYYMMDD format (same as backend)
    today_date := TO_CHAR(NOW(), 'YYYYMMDD');
    
    -- Get the highest sequence number for today (including backend orders)
    SELECT COALESCE(MAX(
        CASE 
            WHEN order_number LIKE 'ORD-' || today_date || '-%' 
            THEN CAST(SUBSTRING(order_number FROM LENGTH('ORD-' || today_date || '-') + 1) AS INTEGER)
            ELSE 0
        END
    ), 0) + 1 INTO sequence_number
    FROM public.orders
    WHERE order_number LIKE 'ORD-' || today_date || '-%';
    
    -- Generate order number in format ORD-YYYYMMDD-XXXX (continues from backend sequence)
    new_order_number := 'ORD-' || today_date || '-' || LPAD(sequence_number::TEXT, 4, '0'::TEXT);
    
    RETURN new_order_number;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Create trigger function to auto-assign order numbers
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
    -- Only set order_number if it's NULL or empty
    IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
        NEW.order_number := generate_order_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Create the trigger for new orders
DROP TRIGGER IF EXISTS trigger_set_order_number ON public.orders;
CREATE TRIGGER trigger_set_order_number
    BEFORE INSERT ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION set_order_number();

-- Step 8: Verify the results
SELECT 
  id,
  order_number,
  client,
  order_date,
  created_at
FROM public.orders 
ORDER BY created_at DESC 
LIMIT 10;

-- Step 9: Check for any remaining NULL values
SELECT COUNT(*) as null_order_numbers
FROM public.orders 
WHERE order_number IS NULL;

-- Step 10: Verify trigger exists
SELECT 
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_set_order_number';

SELECT 'Complete working solution applied successfully! ✅' as status;
