interface ContactInfoProps {
  orderNumber?: string;
  className?: string;
}

export default function ContactInfo({ orderNumber, className = "" }: ContactInfoProps) {
  return (
    <div className={`bg-gray-50 rounded-lg p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
      <div className="space-y-3 text-sm text-gray-600">
        <p>If you have any questions about your order, please contact us:</p>
        <div className="space-y-2">
          <p><strong>Phone:</strong> +91-8107514654</p>
          <p><strong>Email:</strong> support@patramstore.com</p>
          {orderNumber && (
            <p><strong>Order Number:</strong> {orderNumber}</p>
          )}
        </div>
      </div>
    </div>
  );
}
