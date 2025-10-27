interface OrderItem {
  qty: number;
  kind: string;
  productId?: string;
  product_name?: string;
  product_image?: string;
  price?: number;
  name?: string;
}

interface OrderSummaryProps {
  orderNumber?: string;
  status?: string;
  items?: OrderItem[];
  total?: number;
  discount?: number;
  className?: string;
}

export default function OrderSummary({ 
  orderNumber, 
  status, 
  items = [], 
  total, 
  discount = 0,
  className = "" 
}: OrderSummaryProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
      
      {/* Order Number */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="text-sm font-medium text-blue-900 mb-3">Order Number</h3>
        <div className="flex items-center gap-2">
          <p className="text-2xl font-bold text-blue-900">
            {orderNumber || 'Not assigned'}
          </p>
          {orderNumber && (
            <button
              onClick={() => {
                if (orderNumber) {
                  navigator.clipboard.writeText(orderNumber);
                }
              }}
              className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 border border-blue-300 rounded hover:bg-blue-50"
              title="Copy Order Number"
            >
              Copy
            </button>
          )}
        </div>
        {orderNumber && (
          <p className="text-xs text-blue-700 mt-2">
            ✓ Your order reference number
          </p>
        )}
        {!orderNumber && (
          <p className="text-xs text-yellow-700 mt-2">
            ⚠ Order number not yet assigned
          </p>
        )}
      </div>

      {/* Order Status */}
      {status && (
        <div className="mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
              {status}
            </span>
          </div>
        </div>
      )}

      {/* Order Items */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Items Ordered</h3>
        <div className="space-y-4">
          {items && items.length > 0 ? (
            items.map((item, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                  {item.product_image ? (
                    <img 
                      src={item.product_image} 
                      alt={item.product_name || item.name || 'Product'}
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
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {item.product_name || item.name || `Product ${item.productId ? item.productId.slice(-8) : 'Item'}`}
                  </h4>
                  <p className="text-sm text-gray-500">Quantity: {item.qty}</p>
                  {item.kind === 'custom' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                      Custom Item
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {item.price ? `₹${(item.price * item.qty).toLocaleString("en-IN")}` : 'Price N/A'}
                  </p>
                  {item.price && (
                    <p className="text-xs text-gray-500">₹{item.price.toLocaleString("en-IN")} per item</p>
                  )}
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
              if (total) {
                return total.toLocaleString("en-IN");
              }
              // Calculate total from items
              if (items && items.length > 0) {
                const calculatedTotal = items.reduce((sum, item) => {
                  return sum + ((item.price || 0) * item.qty);
                }, 0);
                return calculatedTotal.toLocaleString("en-IN");
              }
              return '0';
            })()}
          </span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between items-center text-sm text-green-600 mt-2">
            <span>Discount Applied:</span>
            <span>-₹{discount.toFixed(2)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
