-- Update Supabase Setup for Existing Clients Table
-- Run this script in your Supabase SQL Editor

-- ==============================================
-- 1. ADD MISSING COLUMNS TO EXISTING CLIENTS TABLE
-- ==============================================

-- Add email column if it doesn't exist
ALTER TABLE clients ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Add auth_id column to link with Supabase Auth
ALTER TABLE clients ADD COLUMN IF NOT EXISTS auth_id UUID UNIQUE;

-- Add updated_at column if it doesn't exist
ALTER TABLE clients ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- ==============================================
-- 2. CREATE ORDERS TABLE
-- ==============================================

CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id),
  client_email VARCHAR(255),
  items JSONB NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  shipping_address JSONB,
  payment_method VARCHAR(20) DEFAULT 'cod' CHECK (payment_method IN ('cod', 'online')),
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- 3. CREATE INDEXES
-- ==============================================

CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_auth_id ON clients(auth_id);
CREATE INDEX IF NOT EXISTS idx_orders_client_id ON orders(client_id);
CREATE INDEX IF NOT EXISTS idx_orders_client_email ON orders(client_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- ==============================================
-- 4. ENABLE ROW LEVEL SECURITY
-- ==============================================

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- 5. CREATE RLS POLICIES
-- ==============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Clients can view own data" ON clients;
DROP POLICY IF EXISTS "Clients can update own data" ON clients;
DROP POLICY IF EXISTS "Clients can insert own data" ON clients;
DROP POLICY IF EXISTS "Clients can view own orders" ON orders;
DROP POLICY IF EXISTS "Allow all operations on clients" ON clients;
DROP POLICY IF EXISTS "Allow all operations on orders" ON orders;
DROP POLICY IF EXISTS "Allow anonymous client creation" ON clients;
DROP POLICY IF EXISTS "Allow authenticated users to insert orders" ON orders;

-- Clients table policies
CREATE POLICY "Clients can view own data" ON clients
  FOR SELECT USING (auth.uid() = auth_id);

CREATE POLICY "Clients can update own data" ON clients
  FOR UPDATE USING (auth.uid() = auth_id);

CREATE POLICY "Clients can insert own data" ON clients
  FOR INSERT WITH CHECK (auth.uid() = auth_id);

-- Allow anonymous users to insert clients (for registration)
CREATE POLICY "Allow anonymous client creation" ON clients
  FOR INSERT WITH CHECK (true);

-- Orders table policies
CREATE POLICY "Clients can view own orders" ON orders
  FOR SELECT USING (
    client_id = (SELECT id FROM clients WHERE auth_id = auth.uid()) OR
    client_email = (SELECT email FROM clients WHERE auth_id = auth.uid())
  );

-- Allow authenticated users to insert orders
CREATE POLICY "Allow authenticated users to insert orders" ON orders
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Service role policies (for admin operations)
CREATE POLICY "Service role can do everything on clients" ON clients
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything on orders" ON orders
  FOR ALL USING (auth.role() = 'service_role');

-- ==============================================
-- 6. CREATE FUNCTIONS
-- ==============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to automatically create client record after auth signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO clients (email, name, auth_id)
  VALUES (
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.id
  );
  RETURN NEW;
END;
$$ language 'plpgsql';

-- ==============================================
-- 7. CREATE TRIGGERS
-- ==============================================

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_clients_updated_at 
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at 
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to automatically create client record after auth signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ==============================================
-- 8. GRANT PERMISSIONS
-- ==============================================

-- Grant necessary permissions to roles
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON clients TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON orders TO anon, authenticated;

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- ==============================================
-- 9. VERIFY SETUP
-- ==============================================

-- Check if tables exist and have required columns
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('clients', 'orders')
ORDER BY table_name, ordinal_position;

-- Check if policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('clients', 'orders');

-- ==============================================
-- COMPLETION MESSAGE
-- ==============================================

SELECT 'Setup completed for existing clients table! 🎉' as message;
