#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up environment variables for Patram Store');
console.log('');

const envContent = `# Supabase Configuration
# Replace with your actual Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Instructions:
# 1. Go to your Supabase project dashboard
# 2. Click Settings → API
# 3. Copy the Project URL and anon public key
# 4. Replace the values above with your actual credentials
`;

const envPath = path.join(process.cwd(), '.env.local');

if (fs.existsSync(envPath)) {
  console.log('✅ .env.local file already exists');
  console.log('📋 Please update it with your Supabase credentials');
} else {
  try {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env.local file');
    console.log('📋 Please update it with your Supabase credentials');
  } catch (error) {
    console.error('❌ Failed to create .env.local file:', error.message);
    console.log('📋 Please create the file manually with the following content:');
    console.log('');
    console.log(envContent);
  }
}

console.log('');
console.log('📖 For detailed instructions, see VERCEL_DEPLOYMENT_GUIDE.md');
console.log('');
console.log('🔧 Next steps:');
console.log('1. Update .env.local with your Supabase credentials');
console.log('2. Run npm run build to test locally');
console.log('3. Deploy to Vercel with environment variables set');
