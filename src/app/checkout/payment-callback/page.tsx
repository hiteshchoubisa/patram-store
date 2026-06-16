"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import InnerBanner from "@/components/layout/InnerBanner";

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "failed" | "pending">("loading");
  const [message, setMessage] = useState("Verifying your payment...");

  useEffect(() => {
    if (!searchParams) return;

    const orderId = searchParams.get("orderId");
    const merchantOrderId = searchParams.get("merchantOrderId");

    if (!merchantOrderId) {
      setStatus("failed");
      setMessage("Invalid payment callback. Missing order reference.");
      return;
    }

    const verifyPayment = async () => {
      try {
        const response = await fetch("/api/payment/phonepe/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId, merchantOrderId }),
        });

        const data = await response.json();

        if (data.paymentStatus === "paid" || data.state === "COMPLETED") {
          setStatus("success");
          setMessage("Payment successful! Your order has been confirmed.");
          setTimeout(() => {
            router.push(`/thank-you?orderId=${orderId}`);
          }, 2000);
        } else if (data.paymentStatus === "failed" || data.state === "FAILED") {
          setStatus("failed");
          setMessage("Payment failed. Please try again or choose another payment method.");
        } else {
          setStatus("pending");
          setMessage("Payment is being processed. We'll update you shortly.");
        }
      } catch {
        setStatus("failed");
        setMessage("Could not verify payment. Please contact support with your order details.");
      }
    };

    verifyPayment();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <InnerBanner
        title="Payment Status"
        subtitle="Please wait while we confirm your payment."
        align="center"
      />
      <div className="max-w-md mx-auto px-4 mt-12 text-center">
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

        {status === "failed" && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <svg className="w-12 h-12 text-red-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <h2 className="text-xl font-semibold text-red-800 mb-2">Payment Failed</h2>
            <p className="text-red-700 mb-4">{message}</p>
            <Link
              href="/checkout"
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Try Again
            </Link>
          </div>
        )}

        {status === "pending" && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <svg className="w-12 h-12 text-yellow-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-semibold text-yellow-800 mb-2">Payment Pending</h2>
            <p className="text-yellow-700 mb-4">{message}</p>
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
            >
              Return Home
            </Link>
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
