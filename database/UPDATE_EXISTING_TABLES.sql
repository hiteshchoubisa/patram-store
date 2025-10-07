-- Update existing tables for customer authentication
-- Run this in Supabase SQL Editor

-- Add missing columns to clients table
ALTER TABLE clients ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS auth_id UUID UNIQUE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Enable RLS on existing tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create basic policies (allow all for now)
CREATE POLICY IF NOT EXISTS "Allow all operations on clients" ON clients FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Allow all operations on orders" ON orders FOR ALL USING (true);

-- Grant permissions
GRANT ALL ON clients TO anon, authenticated;
GRANT ALL ON orders TO anon, authenticated;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for clients table
CREATE TRIGGER IF NOT EXISTS update_clients_updated_at 
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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

-- Trigger to automatically create client record after auth signup
CREATE TRIGGER IF NOT EXISTS on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

SELECT 'Tables updated successfully! ✅' as status;
