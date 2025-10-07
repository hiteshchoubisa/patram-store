-- Add missing columns to existing clients table
-- Run this in Supabase SQL Editor

-- Add email column if it doesn't exist
ALTER TABLE clients ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Add auth_id column to link with Supabase Auth
ALTER TABLE clients ADD COLUMN IF NOT EXISTS auth_id UUID UNIQUE;

-- Add updated_at column if it doesn't exist
ALTER TABLE clients ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id),
  client_email VARCHAR(255),
  items JSONB NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  shipping_address JSONB,
  payment_method VARCHAR(20) DEFAULT 'cod',
  payment_status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create basic policies (allow all for now)
CREATE POLICY "Allow all operations on clients" ON clients FOR ALL USING (true);
CREATE POLICY "Allow all operations on orders" ON orders FOR ALL USING (true);

-- Grant permissions
GRANT ALL ON clients TO anon, authenticated;
GRANT ALL ON orders TO anon, authenticated;

SELECT 'Columns added successfully! ✅' as status;
