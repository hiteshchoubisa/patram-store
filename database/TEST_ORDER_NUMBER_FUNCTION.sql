-- Test Order Number Function
-- Run this to test the function without LPAD

-- Test 1: Check if function exists
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'generate_order_number') 
    THEN 'Function exists ✅'
    ELSE 'Function does not exist ❌'
  END as function_status;

-- Test 2: Test the function
SELECT generate_order_number() as test_order_number;

-- Test 3: Test multiple calls to see sequence
SELECT 
  generate_order_number() as call_1,
  generate_order_number() as call_2,
  generate_order_number() as call_3;

-- Test 4: Check current orders
SELECT 
  COUNT(*) as total_orders_today,
  MAX(order_number) as highest_order
FROM public.orders 
WHERE order_number LIKE 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-%';

SELECT 'Function test completed! ✅' as status;
