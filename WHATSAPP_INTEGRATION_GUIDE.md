# WhatsApp Integration Guide

This guide explains how to set up WhatsApp messaging for order confirmations and updates in the Patram Store.

## 🚀 Features Implemented

### ✅ **Order Confirmation Messages**
- Automatically sends WhatsApp message when order is created
- Includes order details, items, total amount, and shipping address
- Professional message format with emojis and branding

### ✅ **Order Status Updates**
- Send status updates via WhatsApp
- Different messages for different order statuses
- Automated emoji selection based on status

### ✅ **Phone Number Formatting**
- Supports multiple phone number formats
- Handles Indian mobile numbers (with/without country code)
- International number support

### ✅ **Test Interface**
- Admin page for testing WhatsApp functionality
- Generate WhatsApp web URLs for manual sending
- Test both API integration and direct WhatsApp links

## 📁 Files Created/Modified

### New Files:
- `src/lib/whatsappService.ts` - WhatsApp service class
- `src/app/api/whatsapp/route.ts` - WhatsApp API endpoint
- `src/app/admin/whatsapp-test/page.tsx` - Test interface

### Modified Files:
- `src/app/api/orders/route.ts` - Integrated WhatsApp sending
- `env.template` - Added WhatsApp configuration

## 🔧 Setup Instructions

### 1. **Environment Variables**
Add these to your `.env.local` file:

```bash
# WhatsApp Configuration
WHATSAPP_API_URL=https://graph.facebook.com/v18.0/YOUR_PHONE_NUMBER_ID/messages
WHATSAPP_API_TOKEN=your_whatsapp_business_api_token_here
WHATSAPP_BUSINESS_PHONE=+911234567890
```

### 2. **WhatsApp Business API Setup**
For production use, you'll need:

1. **Facebook Business Account**
2. **WhatsApp Business API Access**
3. **Phone Number Verification**
4. **API Token Generation**

### 3. **Current Implementation**
Currently, the system logs WhatsApp messages to console. To enable actual sending:

1. Replace the console.log statements in `whatsappService.ts`
2. Uncomment the actual API call code
3. Add your WhatsApp Business API credentials

## 🧪 Testing

### **Test Page Access**
Visit: `http://localhost:4000/admin/whatsapp-test`

### **Test Features:**
- Send custom messages
- Send order confirmation messages
- Send order status updates
- Generate WhatsApp web URLs
- Test phone number formatting

### **Test Phone Numbers:**
- `9876543210` (Indian mobile)
- `+919876543210` (With country code)
- `919876543210` (Without +)

## 📱 Message Formats

### **Order Confirmation Message:**
```
🎉 *Order Confirmation - Patram Store*

Hello John Doe! 👋

Your order has been successfully placed and is being processed.

📋 *Order Details:*
Order Number: *ORD-20251027-0001*
Status: *Pending*

🛍️ *Items Ordered:*
• Patram Aushadhi Guggal (Qty: 1) - ₹50
• Patram Aushadhi Oudh (Qty: 1) - ₹50

💰 *Total Amount: ₹100*

📍 *Shipping Address:*
Dhebar Coloni Partap Nagar, udaipur, rajasthan, India - 313001

📞 *Need Help?*
Contact us: +918107514654
Email: support@patramstore.com

Thank you for choosing Patram Store! 🙏

---
*This is an automated message. Please do not reply to this number.*
```

### **Status Update Message:**
```
📱 *Order Status Update - Patram Store*

Hello John Doe! 👋

📦 *Order Update:*
Order Number: *ORD-20251027-0001*
New Status: *Shipped*

📞 *Need Help?*
Contact us: +918107514654
Email: support@patramstore.com

Thank you for choosing Patram Store! 🙏

---
*This is an automated message. Please do not reply to this number.*
```

## 🔄 Integration Points

### **Order Creation**
- Automatically triggered when order is created
- Sends confirmation message to customer's phone
- Includes all order details

### **Order Status Updates**
- Can be triggered manually via API
- Send status updates to customers
- Different messages for different statuses

### **Error Handling**
- WhatsApp failures don't affect order creation
- Logs errors for debugging
- Graceful fallback to console logging

## 🚀 Production Deployment

### **For Vercel Deployment:**
1. Add environment variables in Vercel dashboard
2. Update `WHATSAPP_API_URL` with your production endpoint
3. Add your WhatsApp Business API token
4. Test with real phone numbers

### **For Other Platforms:**
1. Set environment variables
2. Ensure HTTPS is enabled (required for WhatsApp API)
3. Configure webhook endpoints if needed

## 📞 Support

### **Manual WhatsApp URLs**
The system can generate WhatsApp web URLs for manual sending:
- Useful for testing
- Fallback when API is unavailable
- Direct customer communication

### **API Endpoints**
- `POST /api/whatsapp` - Send WhatsApp messages
- `GET /api/whatsapp` - Generate WhatsApp URLs

## 🔒 Security Notes

- Phone numbers are validated before sending
- API tokens should be kept secure
- Rate limiting should be implemented for production
- Consider implementing webhook verification

## 📈 Future Enhancements

- WhatsApp Business API integration
- Message templates
- Delivery status tracking
- Customer opt-in/opt-out
- Multi-language support
- Rich media messages (images, documents)
