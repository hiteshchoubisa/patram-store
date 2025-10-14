"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { supabase } from '@/lib/supabaseClient';
import { getOrderDisplayNumber } from '@/lib/orderNumber';

// Component to handle product name display with fallback
const ProductName = ({ item }: { item: OrderItem }) => {
  const [productName, setProductName] = useState<string>(item.product_name || '');
  const [isLoading, setIsLoading] = useState(!item.product_name);

  useEffect(() => {
    const fetchProductDetails = async () => {
      // If we have the product name, no need to fetch
      if (item.product_name) {
        setProductName(item.product_name);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('products')
          .select('name')
          .eq('id', item.productId)
          .single();
        
        if (!error && data) {
          setProductName(data.name || item.product_name || 'Product');
        } else {
          setProductName(item.product_name || 'Product');
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
        setProductName(item.product_name || 'Product');
      }
      
      setIsLoading(false);
    };

    fetchProductDetails();
  }, [item.productId, item.product_name]);

  if (isLoading) {
    return (
      <div>
        <h4 className="text-sm font-medium text-gray-900 truncate">
          <div className="animate-pulse bg-gray-200 h-4 w-32 rounded mb-1"></div>
        </h4>
        <div className="animate-pulse bg-gray-200 h-3 w-20 rounded"></div>
      </div>
    );
  }

  return (
    <div>
      <h4 className="text-sm font-medium text-gray-900 truncate">
        {productName}
      </h4>
    </div>
  );
};

// Component to handle product image display with fallback
const ProductImage = ({ item, index }: { item: OrderItem; index: number }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadImage = async () => {
      setIsLoading(true);
      
      // First try the stored product_image
      if (item.product_image) {
        const url = getPhotoUrl(item.product_image);
        if (url) {
          setImageUrl(url);
          setIsLoading(false);
          return;
        }
      }
      
      // If no product_image, try to fetch from database
      try {
        const { data, error } = await supabase
          .from('products')
          .select('photo_url, images')
          .eq('id', item.productId)
          .single();
        
        if (!error && data) {
          let fallbackUrl = null;
          
          if (data.photo_url) {
            fallbackUrl = getPhotoUrl(data.photo_url);
          } else if (data.images && Array.isArray(data.images) && data.images.length > 0) {
            fallbackUrl = getPhotoUrl(data.images[0]);
          }
          
          if (fallbackUrl) {
            setImageUrl(fallbackUrl);
          }
        }
      } catch (error) {
        console.error('Error fetching product image:', error);
      }
      
      setIsLoading(false);
    };

    loadImage();
  }, [item.productId, item.product_image]);

  const getPhotoUrl = (photoUrl: string | null) => {
    if (!photoUrl) return null;
    if (photoUrl.startsWith("http")) return photoUrl;
    const { data } = supabase.storage.from("product-photos").getPublicUrl(photoUrl);
    return data.publicUrl;
  };

  if (isLoading) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
      </div>
    );
  }

  if (imageUrl) {
    return (
      <img 
        src={imageUrl} 
        alt={item.product_name || 'Product'} 
        className="w-full h-full object-cover"
        onError={() => {
          console.log('Image failed to load:', imageUrl);
          setImageUrl(null);
        }}
        onLoad={() => {
          console.log('Image loaded successfully:', imageUrl);
        }}
      />
    );
  }

  return (
    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
};

interface OrderItem {
  qty: number;
  kind: string;
  productId: string;
  product_name?: string;
  product_image?: string;
  price?: number;
}

interface Order {
  id: string;
  order_number?: string; // Add order_number field
  client: string;
  order_date: string;
  status: string;
  items: OrderItem[];
  created_at: string;
  message?: string;
  discount: number;
  payment_status?: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { customer, isAuthenticated, loading: authLoading } = useCustomerAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/customer-login');
      return;
    }

    if (isAuthenticated && customer) {
      loadOrders();
    }
  }, [isAuthenticated, customer, authLoading, router]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      console.log("Loading orders for customer:", customer?.name);
      
      // First, let's debug what orders exist in the database
      try {
        const debugResponse = await fetch("/api/debug-orders");
        if (debugResponse.ok) {
          const debugData = await debugResponse.json();
          console.log("Debug orders data:", debugData);
        }
      } catch (debugError) {
        console.error("Debug orders error:", debugError);
      }
      
      // Try multiple ways to match orders
      let { data, error } = await supabase
        .from('orders')
        .select('*')
        .or(`client.eq.${customer?.name},client.eq.${customer?.email}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Orders query error:", error);
        throw error;
      }

      console.log("Found orders:", data?.length || 0);
      setOrders(data || []);
      
      // Debug the order data
      if (data && data.length > 0) {
        debugOrderData(data);
      } else {
        console.log("No orders found. Customer name:", customer?.name);
        console.log("Customer email:", customer?.email);
      }
    } catch (err: any) {
      console.error("Load orders error:", err);
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper function to get photo URL
  const getPhotoUrl = (photoUrl: string | null) => {
    if (!photoUrl) return null;
    if (photoUrl.startsWith("http")) return photoUrl;
    const { data } = supabase.storage.from("product-photos").getPublicUrl(photoUrl);
    return data.publicUrl;
  };

  // Helper function to fetch product image from database if missing
  const fetchProductImage = async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('photo_url, images')
        .eq('id', productId)
        .single();
      
      if (error || !data) return null;
      
      // Try photo_url first, then first image from images array
      if (data.photo_url) {
        return getPhotoUrl(data.photo_url);
      } else if (data.images && Array.isArray(data.images) && data.images.length > 0) {
        return getPhotoUrl(data.images[0]);
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching product image:', error);
      return null;
    }
  };

  // Debug function to log order data
  const debugOrderData = (orders: Order[]) => {
    console.log("Orders data:", orders);
    orders.forEach((order, index) => {
      console.log(`Order ${index + 1}:`, {
        id: order.id,
        items: order.items,
        itemsCount: order.items.length
      });
      order.items.forEach((item, itemIndex) => {
        console.log(`  Item ${itemIndex + 1}:`, {
          productId: item.productId,
          product_name: item.product_name,
          product_image: item.product_image,
          price: item.price,
          qty: item.qty
        });
      });
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
            <p className="mt-2 text-gray-600">Track and manage your orders</p>
          </div>
          <button
            onClick={loadOrders}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 mr-2"></div>
                Loading...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
            <p className="mt-1 text-sm text-gray-500">You haven't placed any orders yet.</p>
            <div className="mt-6 space-x-4">
              <button
                onClick={loadOrders}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Refresh Orders
              </button>
              <a
                href="/shop"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Start Shopping
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Order {getOrderDisplayNumber(order.order_number, order.id)}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Placed on {formatDate(order.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      {order.payment_status && (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(order.payment_status)}`}>
                          {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4">
                  <div className="space-y-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <div className="h-16 w-16 bg-gray-200 rounded-md flex items-center justify-center overflow-hidden">
                          <ProductImage item={item} index={index} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <ProductName item={item} />
                          <div className="flex items-center gap-4 mt-1">
                            <p className="text-sm text-gray-500">
                              Qty: {item.qty}
                            </p>
                            {item.price && (
                              <p className="text-sm text-gray-600">
                                ₹{item.price.toLocaleString("en-IN")} each
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {item.price ? `₹${(item.price * item.qty).toLocaleString("en-IN")}` : 'N/A'}
                        </div>
                      </div>
                    ))}
                  </div>


                  {order.discount > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-500">Discount Applied</p>
                        <p className="text-sm font-medium text-green-600">
                          -₹{order.discount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
