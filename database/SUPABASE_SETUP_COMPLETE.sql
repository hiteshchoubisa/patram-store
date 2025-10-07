-- Complete Supabase Setup for Patram Store Customer Authentication
-- Run this script in your Supabase SQL Editor

-- ==============================================
-- 1. CREATE TABLES
-- ==============================================

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  auth_id UUID UNIQUE, -- Links to Supabase Auth users
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_email VARCHAR(255) NOT NULL,
  items JSONB NOT NULL, -- Array of order items
  total DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  shipping_address JSONB, -- Customer shipping details
  payment_method VARCHAR(20) DEFAULT 'cod' CHECK (payment_method IN ('cod', 'online')),
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- ==============================================

CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_auth_id ON customers(auth_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- ==============================================
-- 3. ENABLE ROW LEVEL SECURITY
-- ==============================================

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- 4. CREATE RLS POLICIES
-- ==============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Customers can view own data" ON customers;
DROP POLICY IF EXISTS "Customers can update own data" ON customers;
DROP POLICY IF EXISTS "Customers can insert own data" ON customers;
DROP POLICY IF EXISTS "Customers can view own orders" ON orders;
DROP POLICY IF EXISTS "Service role can do everything" ON customers;
DROP POLICY IF EXISTS "Service role can do everything" ON orders;

-- Customers table policies
CREATE POLICY "Customers can view own data" ON customers
  FOR SELECT USING (auth.uid() = auth_id);

CREATE POLICY "Customers can update own data" ON customers
  FOR UPDATE USING (auth.uid() = auth_id);

CREATE POLICY "Customers can insert own data" ON customers
  FOR INSERT WITH CHECK (auth.uid() = auth_id);

-- Orders table policies
CREATE POLICY "Customers can view own orders" ON orders
  FOR SELECT USING (customer_email = (SELECT email FROM customers WHERE auth_id = auth.uid()));

-- Service role policies (for admin operations)
CREATE POLICY "Service role can do everything on customers" ON customers
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything on orders" ON orders
  FOR ALL USING (auth.role() = 'service_role');

-- Allow anonymous users to insert customers (for registration)
CREATE POLICY "Allow anonymous customer creation" ON customers
  FOR INSERT WITH CHECK (true);

-- Allow authenticated users to insert orders
CREATE POLICY "Allow authenticated users to insert orders" ON orders
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ==============================================
-- 5. CREATE FUNCTIONS
-- ==============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to automatically create customer record after auth signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO customers (email, name, auth_id)
  VALUES (
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.id
  );
  RETURN NEW;
END;
$$ language 'plpgsql';

-- ==============================================
-- 6. CREATE TRIGGERS
-- ==============================================

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_customers_updated_at 
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at 
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to automatically create customer record after auth signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ==============================================
-- 7. GRANT PERMISSIONS
-- ==============================================

-- Grant necessary permissions to roles
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON customers TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON orders TO anon, authenticated;

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- ==============================================
-- 8. INSERT SAMPLE DATA (OPTIONAL)
-- ==============================================

-- Insert a test customer (you can remove this if not needed)
INSERT INTO customers (email, name, phone, auth_id) VALUES
  ('test@patram.com', 'Test Customer', '+91-9876543210', gen_random_uuid())
ON CONFLICT (email) DO NOTHING;

-- ==============================================
-- 9. VERIFY SETUP
-- ==============================================

-- Check if tables exist
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('customers', 'orders');

-- Check if policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('customers', 'orders');

-- Check if triggers exist
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND event_object_table IN ('customers', 'orders', 'users');

-- ==============================================
-- 10. AUTH SETTINGS (Run in Supabase Dashboard)
-- ==============================================

-- Go to Authentication > Settings in Supabase Dashboard and ensure:
-- 1. Enable email confirmations: OFF (for testing)
-- 2. Enable phone confirmations: OFF
-- 3. Enable email change confirmations: OFF
-- 4. Enable phone change confirmations: OFF
-- 5. Enable anonymous users: ON (if you want anonymous checkout)

-- ==============================================
-- COMPLETION MESSAGE
-- ==============================================

SELECT 'Supabase setup completed successfully! 🎉' as message;
