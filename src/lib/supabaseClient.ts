import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if we're in a build environment without environment variables
const isBuildTime = !url || !anon;

let supabase: any;

if (isBuildTime) {
  console.warn("⚠️ Supabase environment variables not found");
  console.warn("📋 Please create a .env.local file with:");
  console.warn("   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co");
  console.warn("   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here");
  console.warn("📖 See VERCEL_DEPLOYMENT_GUIDE.md for detailed instructions");
  
  // Create a mock client for build time
  const mockClient = {
    from: () => ({
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }) }) }),
      insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }) }) }),
      update: () => ({ eq: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }) }),
      delete: () => ({ eq: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }) })
    }),
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      signIn: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
      signOut: () => Promise.resolve({ error: null })
    }
  };
  
  console.warn("🔧 Using mock client for build. Please set real values for production.");
  supabase = mockClient;
} else {
  console.log("✅ Supabase client initialized successfully");
  
  supabase = createClient(url, anon, {
    auth: { persistSession: true, detectSessionInUrl: true }
  });
}

export { supabase };