/**
 * Order Number Management Utilities
 * Provides functions to generate and validate order numbers
 */

/**
 * Generate a unique order number in the format ORD-YYYYMMDD-XXXX
 * This function creates a date-based order number with sequence
 */
export function generateOrderNumber(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const sequence = Math.floor(Math.random() * 9999) + 1;
  
  return `ORD-${dateStr}-${sequence.toString().padStart(4, '0')}`;
}

/**
 * Validate if a string is a valid order number format
 * @param orderNumber - The order number to validate
 * @returns boolean - True if valid format
 */
export function isValidOrderNumber(orderNumber: string): boolean {
  const pattern = /^ORD-[0-9]{8}-[0-9]{4}$/;
  return pattern.test(orderNumber);
}

/**
 * Format order number for display
 * @param orderNumber - The order number to format
 * @returns string - Formatted order number
 */
export function formatOrderNumber(orderNumber: string): string {
  if (!orderNumber) return '';
  return orderNumber.toUpperCase();
}

/**
 * Extract order number from order ID if order_number is not available
 * @param orderId - The order ID
 * @returns string - Formatted order identifier
 */
export function getOrderDisplayNumber(orderNumber?: string, orderId?: string): string {
  if (orderNumber) {
    return formatOrderNumber(orderNumber);
  }
  
  if (orderId) {
    return `#${orderId.slice(-8).toUpperCase()}`;
  }
  
  return 'Unknown Order';
}
