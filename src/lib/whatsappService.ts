interface WhatsAppMessage {
  phone: string;
  message: string;
}

interface OrderWhatsAppData {
  orderNumber: string;
  customerName: string;
  total: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  status: string;
  shippingAddress?: string;
}

export class WhatsAppService {
  private static readonly WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'https://api.whatsapp.com/send';
  private static readonly BUSINESS_PHONE = process.env.WHATSAPP_BUSINESS_PHONE || '+918107514654';

  /**
   * Send WhatsApp message to customer about order confirmation
   */
  static async sendOrderConfirmation(orderData: OrderWhatsAppData, customerPhone: string): Promise<boolean> {
    try {
      const message = this.generateOrderConfirmationMessage(orderData);
      const phoneNumber = this.formatPhoneNumber(customerPhone);
      
      if (!phoneNumber) {
        console.error('Invalid phone number format:', customerPhone);
        return false;
      }

      // For now, we'll log the message and return success
      // In production, you would integrate with WhatsApp Business API
      console.log('WhatsApp Message to send:');
      console.log('Phone:', phoneNumber);
      console.log('Message:', message);
      
      // TODO: Replace with actual WhatsApp API call
      // const response = await fetch(`${this.WHATSAPP_API_URL}`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${process.env.WHATSAPP_API_TOKEN}`
      //   },
      //   body: JSON.stringify({
      //     to: phoneNumber,
      //     message: message
      //   })
      // });

      return true;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      return false;
    }
  }

  /**
   * Generate order confirmation message
   */
  private static generateOrderConfirmationMessage(orderData: OrderWhatsAppData): string {
    const itemsList = orderData.items.map(item => 
      `• ${item.name} (Qty: ${item.quantity}) - ₹${item.price * item.quantity}`
    ).join('\n');

    return `🎉 *Order Confirmation - Patram Store*

Hello ${orderData.customerName}! 👋

Your order has been successfully placed and is being processed.

📋 *Order Details:*
Order Number: *${orderData.orderNumber}*
Status: *${orderData.status}*

🛍️ *Items Ordered:*
${itemsList}

💰 *Total Amount: ₹${orderData.total}*

${orderData.shippingAddress ? `📍 *Shipping Address:*\n${orderData.shippingAddress}\n` : ''}

📞 *Need Help?*
Contact us: ${this.BUSINESS_PHONE}
Email: support@patramstore.com

Thank you for choosing Patram Store! 🙏

---
*This is an automated message. Please do not reply to this number.*`;
  }

  /**
   * Format phone number for WhatsApp
   */
  private static formatPhoneNumber(phone: string): string | null {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Handle different phone number formats
    if (cleaned.length === 10) {
      // Indian mobile number without country code
      return `91${cleaned}`;
    } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
      // Indian mobile number with country code
      return cleaned;
    } else if (cleaned.length === 13 && cleaned.startsWith('+91')) {
      // Indian mobile number with +91
      return cleaned.substring(1);
    } else if (cleaned.length > 10) {
      // International number
      return cleaned;
    }
    
    return null;
  }

  /**
   * Generate WhatsApp web URL for manual sending (fallback)
   */
  static generateWhatsAppWebURL(phone: string, message: string): string {
    const phoneNumber = this.formatPhoneNumber(phone);
    if (!phoneNumber) return '';
    
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  }

  /**
   * Send order status update
   */
  static async sendOrderStatusUpdate(orderNumber: string, customerName: string, status: string, customerPhone: string): Promise<boolean> {
    try {
      const message = this.generateStatusUpdateMessage(orderNumber, customerName, status);
      const phoneNumber = this.formatPhoneNumber(customerPhone);
      
      if (!phoneNumber) {
        console.error('Invalid phone number format:', customerPhone);
        return false;
      }

      console.log('WhatsApp Status Update to send:');
      console.log('Phone:', phoneNumber);
      console.log('Message:', message);
      
      return true;
    } catch (error) {
      console.error('Error sending WhatsApp status update:', error);
      return false;
    }
  }

  /**
   * Generate status update message
   */
  private static generateStatusUpdateMessage(orderNumber: string, customerName: string, status: string): string {
    const statusEmoji = this.getStatusEmoji(status);
    
    return `📱 *Order Status Update - Patram Store*

Hello ${customerName}! 👋

${statusEmoji} *Order Update:*
Order Number: *${orderNumber}*
New Status: *${status}*

📞 *Need Help?*
Contact us: ${this.BUSINESS_PHONE}
Email: support@patramstore.com

Thank you for choosing Patram Store! 🙏

---
*This is an automated message. Please do not reply to this number.*`;
  }

  /**
   * Get emoji for order status
   */
  private static getStatusEmoji(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending': return '⏳';
      case 'confirmed': return '✅';
      case 'processing': return '🔄';
      case 'shipped': return '📦';
      case 'delivered': return '🎉';
      case 'cancelled': return '❌';
      default: return '📋';
    }
  }
}
