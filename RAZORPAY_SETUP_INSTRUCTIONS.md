# 🚀 Razorpay Setup Instructions

## Current Status
✅ Razorpay Key ID is configured: `IYqPh8zUJpdPWv`  
❌ Razorpay Key Secret needs to be added

## To Complete Setup:

### 1. Get Your Razorpay Key Secret
1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/app/keys)
2. Login to your Razorpay account
3. Copy your **Key Secret** (not the Key ID)

### 2. Update Environment Variables
Open `.env.local` file and replace:
```
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
```
with your actual key secret:
```
RAZORPAY_KEY_SECRET=your_actual_key_secret_from_razorpay_dashboard
```

### 3. Restart Development Server
```bash
npm run dev
```

## Testing
- **COD Orders**: Should work immediately
- **Online Payments**: Will work after adding the key secret

## Current Error
The error "Payment system is not configured" appears because the Razorpay Key Secret is missing. Once you add it, online payments will work perfectly!

## Database Schema
Make sure your `orders` table has these columns:
```sql
ALTER TABLE orders ADD COLUMN payment_method VARCHAR(50);
ALTER TABLE orders ADD COLUMN payment_id VARCHAR(255);
ALTER TABLE orders ADD COLUMN razorpay_order_id VARCHAR(255);
```
