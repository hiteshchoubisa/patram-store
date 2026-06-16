"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import InnerBanner from "@/components/layout/InnerBanner";
import { useCart } from "@/components/cart/CartProvider";

type PaymentStatus = "loading" | "success" | "failed" | "cancelled" | "pending";

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clear } = useCart();
  const [status, setStatus] = useState<PaymentStatus>("loading");
  const [message, setMessage] = useState("Verifying your payment...");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [merchantOrderId, setMerchantOrderId] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    if (!searchParams) return;

    const orderIdParam = searchParams.get("orderId");
    const merchantOrderIdParam = searchParams.get("merchantOrderId");

    setOrderId(orderIdParam);
    setMerchantOrderId(merchantOrderIdParam);

    if (!merchantOrderIdParam) {
      setStatus("failed");
      setMessage("Invalid payment callback. Missing order reference.");
      return;
    }

    const verifyPayment = async () => {
      try {
        const response = await fetch("/api/payment/phonepe/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: orderIdParam,
            merchantOrderId: merchantOrderIdParam,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setStatus("failed");
          setMessage(data.message || "Could not verify payment status.");
          return;
        }

        if (data.paymentStatus === "paid" || data.state === "COMPLETED") {
          clear();
          setStatus("success");
          setMessage("Payment successful! Your order has been confirmed.");
          setTimeout(() => {
            router.push(`/thank-you?orderId=${orderIdParam}`);
          }, 2000);
        } else if (data.cancelled || data.paymentStatus === "cancelled") {
          setStatus("cancelled");
          setMessage(
            "You cancelled the payment. Your order is saved and no amount was charged.",
          );
        } else if (data.paymentStatus === "failed" || data.state === "FAILED") {
          setStatus("failed");
          setMessage(
            "Payment failed. Please try again or choose another payment method.",
          );
        } else {
          setStatus("pending");
          setMessage(
            "Payment is still processing. You can retry or check your order status shortly.",
          );
        }
      } catch {
        setStatus("failed");
        setMessage(
          "Could not verify payment. Please contact support with your order details.",
        );
      }
    };

    verifyPayment();
  }, [searchParams, router, clear]);

  const handleRetryPayment = async () => {
    if (!orderId || !merchantOrderId) return;

    setRetrying(true);
    try {
      const orderResponse = await fetch(`/api/orders/${orderId}`);
      const orderData = await orderResponse.json();

      if (!orderResponse.ok || !orderData.order) {
        throw new Error("Could not load order details for retry.");
      }

      const paymentResponse = await fetch("/api/payment/phonepe/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          merchantOrderId,
          amount: orderData.order.total,
        }),
      });

      const paymentData = await paymentResponse.json();

      if (!paymentResponse.ok || !paymentData.redirectUrl) {
        throw new Error(paymentData.message || "Failed to restart payment.");
      }

      window.location.href = paymentData.redirectUrl;
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not restart payment. Please try again.",
      );
      setRetrying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <InnerBanner
        title="Payment Status"
        subtitle="Please wait while we confirm your payment."
        align="center"
      />
      <div className="max-w-lg mx-auto px-4 mt-12 text-center">
        {status === "loading" && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === "success" && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <svg className="w-12 h-12 text-green-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <h2 className="text-xl font-semibold text-green-800 mb-2">Payment Successful</h2>
            <p className="text-green-700">{message}</p>
          </div>
        )}

        {status === "cancelled" && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <svg className="w-12 h-12 text-orange-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-semibold text-orange-900 mb-2">Payment Cancelled</h2>
            <p className="text-orange-800 mb-4">{message}</p>
            {merchantOrderId && (
              <p className="text-sm text-orange-700 mb-6">
                Order reference: <span className="font-semibold">{merchantOrderId}</span>
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={handleRetryPayment}
                disabled={retrying}
                className="inline-flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-60"
              >
                {retrying ? "Redirecting..." : "Retry Payment"}
              </button>
              <Link
                href="/checkout"
                className="inline-flex items-center justify-center px-4 py-2 bg-white text-orange-700 border border-orange-300 rounded-md hover:bg-orange-100"
              >
                Back to Checkout
              </Link>
              <Link
                href="/shop"
                className="inline-flex items-center justify-center px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        )}

        {status === "failed" && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <svg className="w-12 h-12 text-red-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <h2 className="text-xl font-semibold text-red-800 mb-2">Payment Failed</h2>
            <p className="text-red-700 mb-4">{message}</p>
            {merchantOrderId && (
              <p className="text-sm text-red-600 mb-6">
                Order reference: <span className="font-semibold">{merchantOrderId}</span>
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={handleRetryPayment}
                disabled={retrying}
                className="inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-60"
              >
                {retrying ? "Redirecting..." : "Try Again"}
              </button>
              <Link
                href="/checkout"
                className="inline-flex items-center justify-center px-4 py-2 bg-white text-red-700 border border-red-300 rounded-md hover:bg-red-50"
              >
                Back to Checkout
              </Link>
            </div>
          </div>
        )}

        {status === "pending" && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <svg className="w-12 h-12 text-yellow-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-semibold text-yellow-800 mb-2">Payment Pending</h2>
            <p className="text-yellow-700 mb-4">{message}</p>
            {merchantOrderId && (
              <p className="text-sm text-yellow-700 mb-6">
                Order reference: <span className="font-semibold">{merchantOrderId}</span>
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={handleRetryPayment}
                disabled={retrying}
                className="inline-flex items-center justify-center px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-60"
              >
                {retrying ? "Redirecting..." : "Retry Payment"}
              </button>
              {orderId && (
                <Link
                  href={`/track-order?orderId=${orderId}`}
                  className="inline-flex items-center justify-center px-4 py-2 bg-white text-yellow-800 border border-yellow-300 rounded-md hover:bg-yellow-100"
                >
                  Track Order
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
        </div>
      }
    >
      <PaymentCallbackContent />
    </Suspense>
  );
}
