# Vercel Deployment Guide

## 🚀 Environment Variables Setup

To fix the "supabaseUrl is required" error on Vercel, you need to configure your environment variables.

### 📋 Required Environment Variables

1. **NEXT_PUBLIC_SUPABASE_URL**
   - Get this from your Supabase project settings
   - Format: `https://your-project-id.supabase.co`

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Get this from your Supabase project settings
   - This is your public anon key

3. **SUPABASE_SERVICE_ROLE_KEY** (server-only, never expose to browser)
   - Required for PhonePe payment APIs on the live site

4. **NEXT_PUBLIC_SITE_URL**
   - Your live domain, e.g. `https://www.patramworks.in`
   - Used for PhonePe payment redirect callbacks

5. **PhonePe (server-only — required for checkout payments)**
   - `PHONEPE_CLIENT_ID`
   - `PHONEPE_CLIENT_SECRET`
   - `PHONEPE_CLIENT_VERSION` = `1`
   - `PHONEPE_MERCHANT_ID`
   - `PHONEPE_ENV` = `sandbox` (for merchant IDs starting with `SU`)

> **Important:** `.env.local` only works locally. For `patramworks.in` to accept payments, all PhonePe variables above must be added in Vercel and the project must be redeployed.

### 🔧 How to Set Environment Variables in Vercel

#### Option 1: Vercel Dashboard
1. Go to your Vercel project dashboard
2. Click on "Settings" tab
3. Click on "Environment Variables" in the sidebar
4. Add the following variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://your-project-id.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `your-anon-key-here`
   - `SUPABASE_SERVICE_ROLE_KEY` = `your-service-role-key`
   - `NEXT_PUBLIC_SITE_URL` = `https://www.patramworks.in`
   - `PHONEPE_CLIENT_ID`, `PHONEPE_CLIENT_SECRET`, `PHONEPE_MERCHANT_ID`, `PHONEPE_ENV`

#### Option 2: Vercel CLI
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### 🔍 How to Get Supabase Credentials

1. **Go to your Supabase project dashboard**
2. **Click on "Settings" (gear icon)**
3. **Click on "API"**
4. **Copy the following values:**
   - **Project URL** → Use as `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → Use as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### ✅ Verification

After setting the environment variables:

1. **Redeploy your Vercel project**
2. **Check the build logs** - should not show "supabaseUrl is required" error
3. **Test your app** - should connect to Supabase successfully

### 🛠️ Local Development

For local development, create a `.env.local` file:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 🚨 Common Issues

1. **Missing Environment Variables**: Make sure both variables are set in Vercel
2. **Wrong Values**: Double-check the Supabase URL and anon key
3. **Case Sensitivity**: Variable names are case-sensitive
4. **Redeploy Required**: Changes to environment variables require a new deployment

### 📞 Support

If you're still having issues:
1. Check Vercel build logs for specific error messages
2. Verify your Supabase project is active
3. Ensure your Supabase database is properly configured
4. Check that your Supabase RLS policies allow the operations you're trying to perform
