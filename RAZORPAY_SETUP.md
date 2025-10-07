# Razorpay Payment Integration Setup

## Environment Variables Required

Add these environment variables to your `.env.local` file:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id_here

# Supabase Configuration (if not already set)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## Razorpay Account Setup

1. **Create Razorpay Account**: Go to [https://razorpay.com](https://razorpay.com) and create an account
2. **Get API Keys**: 
   - Go to Dashboard → Settings → API Keys
   - Generate API Keys for Test/Live mode
   - Copy the Key ID and Key Secret
3. **Update Environment Variables**: Replace the placeholder values in `.env.local`

## Database Schema Updates

The following columns need to be added to your `orders` table in Supabase:

```sql
ALTER TABLE orders ADD COLUMN payment_method VARCHAR(50);
ALTER TABLE orders ADD COLUMN payment_id VARCHAR(255);
ALTER TABLE orders ADD COLUMN razorpay_order_id VARCHAR(255);
```

## Features Implemented

- ✅ Razorpay payment integration
- ✅ Payment verification
- ✅ Order creation with payment details
- ✅ COD and Online payment options
- ✅ Payment status tracking
- ✅ Error handling and user feedback

## Testing

1. **Test Mode**: Use Razorpay test credentials for development
2. **Test Cards**: Use Razorpay's test card numbers for testing
3. **Webhook Setup**: Configure webhooks in Razorpay dashboard for production

## Security Notes

- Never expose `RAZORPAY_KEY_SECRET` in client-side code
- Always verify payments on the server side
- Use HTTPS in production
- Implement proper error handling and logging
