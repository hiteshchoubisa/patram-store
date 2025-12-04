"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ContactInfo from '@/components/order/ContactInfo';
import CustomerInfo from '@/components/order/CustomerInfo';
import OrderSummary from '@/components/order/OrderSummary';
import InnerBanner from '@/components/layout/InnerBanner';

interface OrderItem {
  qty: number;
  kind: string;
  productId?: string;
  product_name?: string;
  product_image?: string;
  price?: number;
  name?: string; // For custom items
}

interface Order {
  id: string;
  order_number?: string;
  client: string;
  order_date: string;
  status: string;
  items: OrderItem[];
  created_at: string;
  message?: string;
  discount?: number;
  payment_status?: string;
  payment_method?: string;
  total?: number;
  payment_id?: string;
  razorpay_order_id?: string;
}

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) {
      setError('Please enter an order number or ID');
      return;
    }

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const response = await fetch(`/api/orders/${orderId.trim()}`);
      const data = await response.json();

      if (data.success) {
        setOrder(data.order);
      } else {
        setError(data.message || 'Order not found');
      }
    } catch (err) {
      setError('Failed to track order. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <InnerBanner
        title="Track Your Order"
        subtitle="Enter your Patram order number or ID to view live progress."
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <form onSubmit={handleTrackOrder} className="space-y-4">
            <div>
              <label htmlFor="orderId" className="block text-sm font-medium text-gray-700 mb-2">
                Order Number or ID
              </label>
              <div className="flex gap-4">
                <input
                  type="text"
                  id="orderId"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="Enter order number (e.g., ORD-20250112-1234) or order ID"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !orderId.trim()}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Tracking...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Track Order
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {error && (
            <div className="mt-4 rounded-md bg-red-50 p-4">
              <div className="flex">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">{error}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Order Details */}
        {order && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Summary */}
            <div className="lg:col-span-2">
              <OrderSummary 
                orderNumber={order.order_number}
                status={order.status}
                items={order.items}
                total={order.total}
                discount={order.discount}
              />
            </div>

            {/* Order Details & Actions */}
            <div className="space-y-6">
              {/* Customer Information */}
              <CustomerInfo 
                client={order.client}
                orderDate={order.created_at}
                shippingAddress={order.message}
                paymentMethod={order.payment_method}
                paymentStatus={order.payment_status}
              />

              {/* Order Status Information */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">Order Status</h3>
                <div className="space-y-3 text-sm text-blue-800">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <svg className="w-3 h-3 text-blue-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p>Current Status: <strong>{order.status}</strong></p>
                  </div>
                  {order.status === 'Delivered' && (
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        <svg className="w-3 h-3 text-green-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p>Your order has been delivered successfully!</p>
                    </div>
                  )}
                  {order.status === 'Pending' && (
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-yellow-200 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        <svg className="w-3 h-3 text-yellow-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p>Your order is being processed</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <ContactInfo orderNumber={order.order_number} />

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setOrder(null);
                    setOrderId('');
                    setError('');
                  }}
                  className="w-full bg-white text-indigo-600 py-3 px-4 rounded-lg font-medium border border-indigo-600 hover:bg-indigo-50 transition-colors duration-200 text-center block"
                >
                  Track Another Order
                </button>
                <Link 
                  href="/orders"
                  className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors duration-200 text-center block"
                >
                  View All Orders
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}