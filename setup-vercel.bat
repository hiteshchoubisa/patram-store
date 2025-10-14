@echo off
echo 🚀 Setting up Vercel deployment for Patram Store
echo.

REM Check if Vercel CLI is installed
where vercel >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Vercel CLI not found. Installing...
    npm install -g vercel
    echo ✅ Vercel CLI installed
) else (
    echo ✅ Vercel CLI found
)

echo.
echo 📋 Next steps:
echo 1. Get your Supabase credentials:
echo    - Go to your Supabase project dashboard
echo    - Click Settings → API
echo    - Copy Project URL and anon public key
echo.
echo 2. Set environment variables in Vercel:
echo    - Go to your Vercel project dashboard
echo    - Click Settings → Environment Variables
echo    - Add NEXT_PUBLIC_SUPABASE_URL
echo    - Add NEXT_PUBLIC_SUPABASE_ANON_KEY
echo.
echo 3. Redeploy your project:
echo    - Trigger a new deployment in Vercel
echo    - Or run: vercel --prod
echo.
echo 📖 For detailed instructions, see VERCEL_DEPLOYMENT_GUIDE.md
pause
