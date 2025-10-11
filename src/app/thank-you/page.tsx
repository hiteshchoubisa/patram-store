"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface OrderDetails {
  id: string;
  orderId: string;
  order_number?: string;
  status: string;
  total: number;
  items: Array<{
    product_name: string;
    product_image: string;
    qty: number;
    price: number;
  }>;
  client: string;
  message: string;
  order_date: string;
}

export default function ThankYouPage() {
  const searchParams = useSearchParams();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const orderId = searchParams.get('orderId');
    
    if (orderId) {
      fetchOrderDetails(orderId);
    } else {
      setError("No order ID provided");
      setLoading(false);
    }
  }, [searchParams]);

  const fetchOrderDetails = async (orderId: string) => {
    try {
      console.log("Fetching order details for ID:", orderId);
      // Add cache busting to ensure fresh data
      const response = await fetch(`/api/orders/${orderId}?t=${Date.now()}`);
      console.log("Response status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("Order details received:", data);
        console.log("Order data:", data.order);
        console.log("Order ID (id):", data.order?.id);
        console.log("Order Number:", data.order?.order_number);
        console.log("Total amount:", data.order?.total);
        console.log("Items:", data.order?.items);
        console.log("All available fields:", Object.keys(data.order || {}));
        
        if (data.success && data.order) {
          console.log("Order details being set:", data.order);
          console.log("Order number in data:", data.order.order_number);
          console.log("Order ID in data:", data.order.id);
          setOrderDetails(data.order);
        } else {
          setError("Invalid order data received");
        }
      } else {
        let errorData;
        try {
          const responseText = await response.text();
          console.error("Error response text:", responseText);
          
          if (responseText) {
            errorData = JSON.parse(responseText);
          } else {
            errorData = { message: "Empty response from server" };
          }
        } catch (parseError) {
          console.error("Failed to parse error response:", parseError);
          errorData = { 
            message: "Failed to parse error response",
            status: response.status,
            statusText: response.statusText
          };
        }
        
        console.error("Error response:", errorData);
        setError(errorData.message || "Order not found");
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      setError("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <svg className="w-12 h-12 text-red-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <Link 
              href="/"
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <svg className="w-12 h-12 text-yellow-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h2 className="text-xl font-semibold text-yellow-800 mb-2">No Order Details</h2>
            <p className="text-yellow-600 mb-4">Unable to load order information.</p>
            <Link 
              href="/"
              className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors duration-200"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Thank You for Your Order!</h1>
          <p className="text-lg text-gray-600">Your order has been successfully placed and is being processed.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
              
              {/* Order Number */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-sm font-medium text-blue-900 mb-3">Order Number</h3>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-blue-900">
                    {orderDetails.order_number || 'Not assigned'}
                  </p>
                  {orderDetails.order_number && (
                    <button
                      onClick={() => {
                        if (orderDetails.order_number) {
                          navigator.clipboard.writeText(orderDetails.order_number);
                          // You could add a toast notification here
                        }
                      }}
                      className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 border border-blue-300 rounded hover:bg-blue-50"
                      title="Copy Order Number"
                    >
                      Copy
                    </button>
                  )}
                </div>
                {orderDetails.order_number && (
                  <p className="text-xs text-blue-700 mt-2">
                    ✓ Your order reference number
                  </p>
                )}
                {!orderDetails.order_number && (
                  <p className="text-xs text-yellow-700 mt-2">
                    ⚠ Order number not yet assigned
                  </p>
                )}
              </div>

              {/* Order Status */}
              <div className="mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    orderDetails.status === 'Pending' 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : orderDetails.status === 'Confirmed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {orderDetails.status || 'Unknown'}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Items Ordered</h3>
                <div className="space-y-4">
                  {orderDetails.items && orderDetails.items.length > 0 ? (
                    orderDetails.items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {item.product_image ? (
                          <img 
                            src={item.product_image} 
                            alt={item.product_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">{item.product_name}</h4>
                        <p className="text-sm text-gray-500">Quantity: {item.qty}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">₹{item.price ? item.price.toLocaleString("en-IN") : '0'}</p>
                        <p className="text-xs text-gray-500">per item</p>
                      </div>
                    </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No items found for this order.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Total */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-gray-900">Total Amount</span>
                  <span className="text-2xl font-bold text-indigo-600">
                    ₹{(() => {
                      // Use stored total if available, otherwise calculate from items
                      if (orderDetails.total) {
                        return orderDetails.total.toLocaleString("en-IN");
                      }
                      // Calculate total from items
                      if (orderDetails.items && orderDetails.items.length > 0) {
                        const calculatedTotal = orderDetails.items.reduce((sum, item) => {
                          return sum + (item.price * item.qty);
                        }, 0);
                        return calculatedTotal.toLocaleString("en-IN");
                      }
                      return '0';
                    })()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Details & Next Steps */}
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">Customer Name</span>
                  <p className="text-gray-900">{orderDetails.client || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Order Date</span>
                  <p className="text-gray-900">
                    {orderDetails.order_date 
                      ? new Date(orderDetails.order_date).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'N/A'
                    }
                  </p>
                </div>
                {orderDetails.message && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Shipping Address</span>
                    <p className="text-gray-900 text-sm">{orderDetails.message}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">What's Next?</h3>
              <div className="space-y-3 text-sm text-blue-800">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <span className="text-xs font-bold text-blue-800">1</span>
                  </div>
                  <p>We'll process your order within 24 hours</p>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <span className="text-xs font-bold text-blue-800">2</span>
                  </div>
                  <p>You'll receive a confirmation email with tracking details</p>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <span className="text-xs font-bold text-blue-800">3</span>
                  </div>
                  <p>Your order will be shipped within 2-3 business days</p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <p>If you have any questions about your order, please contact us:</p>
                <div className="space-y-2">
                  <p><strong>Phone:</strong> +91-1234567890</p>
                  <p><strong>Email:</strong> support@patramstore.com</p>
                  <p><strong>Order Number:</strong> {orderDetails.order_number || 'Not assigned'}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link 
                href="/"
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors duration-200 text-center block"
              >
                Continue Shopping
              </Link>
              <Link 
                href="/orders"
                className="w-full bg-white text-indigo-600 py-3 px-4 rounded-lg font-medium border border-indigo-600 hover:bg-indigo-50 transition-colors duration-200 text-center block"
              >
                View All Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
