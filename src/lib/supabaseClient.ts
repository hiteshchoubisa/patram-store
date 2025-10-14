import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Better error messages for deployment
if (!url) {
  console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL environment variable");
  console.error("📋 Please set this in your Vercel project settings:");
  console.error("   - Go to Vercel Dashboard → Settings → Environment Variables");
  console.error("   - Add NEXT_PUBLIC_SUPABASE_URL with your Supabase project URL");
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable. Check deployment guide.");
}

if (!anon) {
  console.error("❌ Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable");
  console.error("📋 Please set this in your Vercel project settings:");
  console.error("   - Go to Vercel Dashboard → Settings → Environment Variables");
  console.error("   - Add NEXT_PUBLIC_SUPABASE_ANON_KEY with your Supabase anon key");
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable. Check deployment guide.");
}

console.log("✅ Supabase client initialized successfully");

export const supabase = createClient(url, anon, {
  auth: { persistSession: true, detectSessionInUrl: true }
});