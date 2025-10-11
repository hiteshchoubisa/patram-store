-- NO LPAD Solution - Completely avoids LPAD function
-- Run this in your Supabase SQL Editor

-- Step 1: Check current order numbers
SELECT 
  id,
  order_number,
  client,
  created_at
FROM public.orders 
WHERE order_number LIKE 'ORD-20251012-%'
ORDER BY order_number DESC
LIMIT 10;

-- Step 2: Find the highest sequence number for today
SELECT 
  'Highest sequence today: ' || 
  COALESCE(MAX(CAST(SUBSTRING(order_number FROM LENGTH('ORD-20251012-') + 1) AS INTEGER)), 0) as max_sequence
FROM public.orders 
WHERE order_number LIKE 'ORD-20251012-%';

-- Step 3: Create function that avoids LPAD completely
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    new_order_number TEXT;
    today_date TEXT;
    sequence_number INTEGER;
    padded_sequence TEXT;
BEGIN
    -- Get today's date in YYYYMMDD format
    today_date := TO_CHAR(NOW(), 'YYYYMMDD');
    
    -- Get the highest sequence number for today
    SELECT COALESCE(MAX(
        CASE 
            WHEN order_number LIKE 'ORD-' || today_date || '-%' 
            THEN CAST(SUBSTRING(order_number FROM LENGTH('ORD-' || today_date || '-') + 1) AS INTEGER)
            ELSE 0
        END
    ), 0) + 1 INTO sequence_number
    FROM public.orders
    WHERE order_number LIKE 'ORD-' || today_date || '-%';
    
    -- Manual padding - no LPAD function used
    IF sequence_number < 10 THEN
        padded_sequence := '000' || sequence_number::TEXT;
    ELSIF sequence_number < 100 THEN
        padded_sequence := '00' || sequence_number::TEXT;
    ELSIF sequence_number < 1000 THEN
        padded_sequence := '0' || sequence_number::TEXT;
    ELSE
        padded_sequence := sequence_number::TEXT;
    END IF;
    
    -- Generate order number
    new_order_number := 'ORD-' || today_date || '-' || padded_sequence;
    
    RETURN new_order_number;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Test the function
SELECT generate_order_number() as test_next_order;

-- Step 5: Create trigger for automatic order number assignment
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL THEN
        NEW.order_number := generate_order_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_set_order_number ON public.orders;

-- Create the trigger
CREATE TRIGGER trigger_set_order_number
    BEFORE INSERT ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION set_order_number();

SELECT 'NO LPAD solution applied! Next orders will continue from backend sequence! ✅' as status;
