"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import ContactInfo from '@/components/order/ContactInfo';
import CustomerInfo from '@/components/order/CustomerInfo';
import OrderSummary from '@/components/order/OrderSummary';
import InnerBanner from '@/components/layout/InnerBanner';

interface OrderDetails {
  id: string;
  orderId: string;
  order_number?: string;
  status: string;
  total: number;
  items: Array<{
    qty: number;
    kind: string;
    productId?: string;
    product_name?: string;
    product_image?: string;
    price?: number;
    name?: string;
  }>;
  client: string;
  message: string;
  order_date: string;
}

function ThankYouContent() {
  const searchParams = useSearchParams();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!searchParams) return;
    const orderId = searchParams.get("orderId");
    if (!orderId) return;
    fetchOrderDetails(orderId);
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
    <div className="min-h-screen bg-gray-50 pb-12">
      <InnerBanner
        title="Thank You"
        subtitle="We’ve received your order and will share updates shortly."
        align="center"
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
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
            <OrderSummary 
              orderNumber={orderDetails.order_number}
              status={orderDetails.status}
              items={orderDetails.items}
              total={orderDetails.total}
            />
          </div>

          {/* Order Details & Next Steps */}
          <div className="space-y-6">
            {/* Customer Information */}
            <CustomerInfo 
              client={orderDetails.client}
              orderDate={orderDetails.order_date}
              shippingAddress={orderDetails.message}
            />

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
            <ContactInfo orderNumber={orderDetails.order_number} />

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

export default function ThankYouPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    }>
      <ThankYouContent />
    </Suspense>
  );
}
