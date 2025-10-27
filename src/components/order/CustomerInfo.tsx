interface CustomerInfoProps {
  client?: string;
  orderDate?: string;
  shippingAddress?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  className?: string;
}

export default function CustomerInfo({ 
  client, 
  orderDate, 
  shippingAddress, 
  paymentMethod, 
  paymentStatus,
  className = "" 
}: CustomerInfoProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
      <div className="space-y-3">
        {client && (
          <div>
            <span className="text-sm font-medium text-gray-500">Customer Name</span>
            <p className="text-gray-900">{client}</p>
          </div>
        )}
        {orderDate && (
          <div>
            <span className="text-sm font-medium text-gray-500">Order Date</span>
            <p className="text-gray-900">{formatDate(orderDate)}</p>
          </div>
        )}
        {shippingAddress && (
          <div>
            <span className="text-sm font-medium text-gray-500">Shipping Address</span>
            <p className="text-gray-900 text-sm">{shippingAddress}</p>
          </div>
        )}
        {paymentMethod && (
          <div>
            <span className="text-sm font-medium text-gray-500">Payment Method</span>
            <p className="text-gray-900">{paymentMethod.toUpperCase()}</p>
          </div>
        )}
        {paymentStatus && (
          <div>
            <span className="text-sm font-medium text-gray-500">Payment Status</span>
            <p className="text-gray-900">{paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}</p>
          </div>
        )}
      </div>
    </div>
  );
}
