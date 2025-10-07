"use client";
import { useState, useEffect } from "react";
import { useCart } from "../../components/cart/CartProvider";
import { useCustomerAuth } from "../../contexts/CustomerAuthContext";
import { useRouter } from "next/navigation";
import { loadRazorpay, openRazorpay, RazorpayOptions } from "../../lib/razorpay";

interface CheckoutForm {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  state: string;
  country: string;
  paymentMethod: "cod" | "online";
}

export default function CheckoutPage() {
  const { lines, total, clear } = useCart();
  const { customer, isAuthenticated } = useCustomerAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(true);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [form, setForm] = useState<CheckoutForm>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    state: "",
    country: "India",
    paymentMethod: "cod"
  });

  // Load Razorpay script
  useEffect(() => {
    loadRazorpay().then((razorpay) => {
      if (razorpay) {
        setRazorpayLoaded(true);
      }
    });
  }, []);

  // Pre-fill form with customer data if logged in
  useEffect(() => {
    if (isAuthenticated && customer) {
      setForm(prev => ({
        ...prev,
        name: customer.name || "",
        email: customer.email || "",
        phone: customer.phone || ""
      }));
    }
  }, [isAuthenticated, customer]);

  // Check cart state and redirect if empty
  useEffect(() => {
    // Give cart time to load from localStorage
    const timer = setTimeout(() => {
      setCartLoading(false);
      // Only redirect if cart is truly empty after loading
      if (lines.length === 0) {
        console.log("Cart is empty, redirecting to shop");
        router.push("/shop");
      }
    }, 200); // Increased timeout to ensure cart loads

    return () => clearTimeout(timer);
  }, [lines.length, router]);

  // Additional check to prevent flash
  useEffect(() => {
    if (!cartLoading && lines.length > 0) {
      console.log("Cart loaded with items:", lines.length);
    }
  }, [cartLoading, lines.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (form.paymentMethod === "online") {
        await handleOnlinePayment();
      } else {
        await handleCODPayment();
      }
    } catch (error) {
      console.error("Checkout error:", error);
      const errorMessage = error instanceof Error ? error.message : "Something went wrong. Please try again.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleOnlinePayment = async () => {
    if (!razorpayLoaded) {
      alert("Payment system is loading. Please try again in a moment.");
      return;
    }

    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID === 'your_razorpay_key_id_here') {
      alert("Payment system is not configured. Please contact support or try Cash on Delivery.");
      return;
    }

    try {
      // Debug cart items
      console.log("Cart items for order:", lines);
      lines.forEach((item, index) => {
        console.log(`Cart item ${index}:`, {
          id: item.id,
          name: item.name,
          photo: item.photo,
          price: item.price,
          qty: item.qty
        });
      });

      // First create order in our database
      const orderData = {
        items: lines.map(item => ({
          product_id: item.id,
          product_name: item.name,
          product_image: item.photo || '',
          quantity: item.qty,
          price: item.price
        })),
        total,
        customerEmail: form.email,
        shippingAddress: {
          name: form.name,
          phone: form.phone,
          address: form.address,
          city: form.city,
          pincode: form.pincode,
          state: form.state,
          country: form.country
        },
        paymentMethod: "online"
      };

      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData)
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        console.error("Order creation error in online payment:", errorData);
        throw new Error(errorData.message || "Failed to create order");
      }

      const orderResult = await orderResponse.json();
      const orderId = orderResult.orderId;

      // Create Razorpay order
      const paymentResponse = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: total,
          orderId: orderId
        })
      });

      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json();
        console.error("Payment order creation error:", errorData);
        
        if (errorData.message && errorData.message.includes("not configured")) {
          alert("Payment system is not fully configured. Please contact support or try Cash on Delivery.");
          return;
        }
        
        if (errorData.error && errorData.error.includes("Authentication failed")) {
          alert("Payment system authentication failed. Please try Cash on Delivery or contact support.");
          return;
        }
        
        throw new Error(errorData.message || "Failed to create payment order");
      }

      const paymentData = await paymentResponse.json();

      // Open Razorpay checkout
      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: paymentData.amount,
        currency: paymentData.currency,
        name: "Patram Store",
        description: `Order #${orderId}`,
        order_id: paymentData.orderId,
        prefill: {
          name: form.name,
          email: form.email,
          contact: form.phone
        },
        notes: {
          orderId: orderId
        },
        theme: {
          color: "#2563eb"
        },
        handler: async (response) => {
          try {
            // Verify payment
            const verifyResponse = await fetch("/api/razorpay/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            if (verifyResponse.ok) {
              // Update order with payment details
              await fetch("/api/orders", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  orderId: orderId,
                  paymentId: response.razorpay_payment_id,
                  razorpayOrderId: response.razorpay_order_id
                })
              });

              clear();
              router.push("/checkout/success");
            } else {
              throw new Error("Payment verification failed");
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            alert("Payment verification failed. Please contact support.");
          }
        }
      };

      openRazorpay(options);
    } catch (error) {
      console.error("Online payment error:", error);
      throw error;
    }
  };

  const handleCODPayment = async () => {
    const orderData = {
      items: lines.map(item => ({
        product_id: item.id,
        product_name: item.name,
        product_image: item.photo || '',
        quantity: item.qty,
        price: item.price
      })),
      total,
      customerEmail: form.email,
      shippingAddress: {
        name: form.name,
        phone: form.phone,
        address: form.address,
        city: form.city,
        pincode: form.pincode,
        state: form.state,
        country: form.country
      },
      paymentMethod: "cod"
    };

    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData)
    });

    if (response.ok) {
      clear();
      router.push("/checkout/success");
    } else {
      const errorData = await response.json();
      console.error("Order creation error:", errorData);
      throw new Error(errorData.message || "Failed to create order");
    }
  };

  const handleInputChange = (field: keyof CheckoutForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  // Check if address is in Udaipur, Rajasthan for COD eligibility
  const isUdaipurAddress = () => {
    const city = form.city.toLowerCase().trim();
    const state = form.state.toLowerCase().trim();
    const address = form.address.toLowerCase().trim();
    
    return (
      (city.includes('udaipur') || address.includes('udaipur')) &&
      (state.includes('rajasthan') || state.includes('raj'))
    );
  };

  // Get available payment methods based on location
  const getAvailablePaymentMethods = () => {
    const methods = [];
    
    if (isUdaipurAddress()) {
      methods.push({
        id: 'cod',
        value: 'cod',
        title: 'Cash on Delivery',
        description: 'Pay when your order arrives',
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        )
      });
    }
    
    methods.push({
      id: 'online',
      value: 'online',
      title: 'Online Payment',
      description: 'Pay securely with cards, UPI, or wallets',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      )
    });
    
    return methods;
  };

  // Auto-select payment method based on availability
  useEffect(() => {
    const availableMethods = getAvailablePaymentMethods();
    if (availableMethods.length === 1) {
      setForm(prev => ({ ...prev, paymentMethod: availableMethods[0].value as "cod" | "online" }));
    } else if (form.paymentMethod === 'cod' && !isUdaipurAddress()) {
      setForm(prev => ({ ...prev, paymentMethod: 'online' }));
    }
  }, [form.city, form.state, form.address]);

  // Show loading while cart is being checked
  if (cartLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  // Show redirect message if cart is empty
  if (lines.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting to shop...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="checkout-title">Checkout</h1>
          <p className="checkout-subtitle">Complete your order</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="checkout-form-container">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="checkout-section">
                <h2 className="checkout-section-title">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="checkout-label">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="checkout-input"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="checkout-label">Email *</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="checkout-input"
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <label className="checkout-label">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="checkout-input"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="checkout-section">
                <h2 className="checkout-section-title">Shipping Address</h2>
                <div className="space-y-4">
                  <div>
                    <label className="checkout-label">Address *</label>
                    <textarea
                      required
                      value={form.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      className="checkout-textarea"
                      placeholder="Enter your complete address"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="checkout-label">City *</label>
                      <input
                        type="text"
                        required
                        value={form.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        className="checkout-input"
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label className="checkout-label">Pincode *</label>
                      <input
                        type="text"
                        required
                        value={form.pincode}
                        onChange={(e) => handleInputChange("pincode", e.target.value)}
                        className="checkout-input"
                        placeholder="Pincode"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="checkout-label">State *</label>
                      <input
                        type="text"
                        required
                        value={form.state}
                        onChange={(e) => handleInputChange("state", e.target.value)}
                        className="checkout-input"
                        placeholder="State"
                      />
                    </div>
                    <div>
                      <label className="checkout-label">Country *</label>
                      <select
                        required
                        value={form.country}
                        onChange={(e) => handleInputChange("country", e.target.value)}
                        className="checkout-input"
                      >
                        <option value="India">India</option>
                        <option value="United States">United States</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Canada">Canada</option>
                        <option value="Australia">Australia</option>
                        <option value="Germany">Germany</option>
                        <option value="France">France</option>
                        <option value="Japan">Japan</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

            </form>
          </div>

          {/* Order Summary */}
          <div className="checkout-summary">
            <h2 className="checkout-summary-title">Order Summary</h2>
            <div className="checkout-items">
              {lines.map((item) => (
                <div key={item.id} className="checkout-item">
                  <div className="checkout-item-image">
                    {item.photo ? (
                      <img src={item.photo} alt={item.name} />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="checkout-item-details">
                    <div className="checkout-item-name">{item.name}</div>
                    <div className="checkout-item-qty">Qty: {item.qty}</div>
                  </div>
                  <div className="checkout-item-price">₹{(item.price * item.qty).toLocaleString("en-IN")}</div>
                </div>
              ))}
            </div>
            
            <div className="checkout-total">
              <div className="checkout-total-row">
                <span>Subtotal</span>
                <span>₹{total.toLocaleString("en-IN")}</span>
              </div>
              <div className="checkout-total-row">
                <span>Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="checkout-total-final">
                <span>Total</span>
                <span>₹{total.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          {/* Payment Method & Place Order */}
          <div className="checkout-summary">
            <h2 className="checkout-summary-title">Payment Method</h2>
            
            {/* Location-based payment info */}
            {/* {!isUdaipurAddress() && (form.city || form.state) && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">Cash on Delivery not available</p>
                    <p>COD is only available for Udaipur, Rajasthan addresses. Please use online payment for other locations.</p>
                  </div>
                </div>
              </div>
            )} */}

            <div className="space-y-4">
              {getAvailablePaymentMethods().map((method) => (
                <div key={method.id} className="payment-option">
                  <input
                    type="radio"
                    id={method.id}
                    name="paymentMethod"
                    value={method.value}
                    checked={form.paymentMethod === method.value}
                    onChange={(e) => handleInputChange("paymentMethod", e.target.value)}
                    className="payment-radio"
                  />
                  <label htmlFor={method.id} className="payment-label">
                    <div className="payment-icon">
                      {method.icon}
                    </div>
                    <div>
                      <div className="payment-title">{method.title}</div>
                      <div className="payment-description">{method.description}</div>
                    </div>
                  </label>
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="checkout-submit-btn"
              onClick={(e) => {
                e.preventDefault();
                handleSubmit(e);
              }}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                `Place Order - ₹${total.toLocaleString("en-IN")}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
