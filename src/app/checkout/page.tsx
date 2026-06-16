"use client";
import { useState, useEffect } from "react";
import { useCart } from "../../components/cart/CartProvider";
import { useCustomerAuth } from "../../contexts/CustomerAuthContext";
import { useRouter } from "next/navigation";
import InnerBanner from "@/components/layout/InnerBanner";

interface CheckoutForm {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  state: string;
  country: string;
  paymentMethod: "cod" | "phonepe";
}

export default function CheckoutPage() {
  const { lines, total, clear } = useCart();
  const { customer, isAuthenticated } = useCustomerAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSearchingClient, setIsSearchingClient] = useState(false);
  const [clientFound, setClientFound] = useState(false);
  const [orderProcessing, setOrderProcessing] = useState(false);
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

  const handleClearCart = () => {
    if (!lines.length) return;
    if (confirm("Clear all items from cart?")) {
      clear();
    }
  };

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

  // Redirect if cart is empty
  useEffect(() => {
    if (lines.length === 0 && !orderProcessing) {
      router.replace("/shop");
    }
  }, [lines.length, orderProcessing, router]);

  const validateForm = () => {
    const errors: string[] = [];
    const fieldErrors: Record<string, string> = {};
    
    if (!form.name.trim()) {
      errors.push("Full name is required");
      fieldErrors.name = "Full name is required";
    }
    
    if (!form.email.trim()) {
      errors.push("Email is required");
      fieldErrors.email = "Email is required";
    } else {
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) {
        errors.push("Please enter a valid email address");
        fieldErrors.email = "Please enter a valid email address";
      }
    }
    
    if (!form.phone.trim()) {
      errors.push("Phone number is required");
      fieldErrors.phone = "Phone number is required";
    } else {
      // Phone validation (basic)
      const phoneRegex = /^[0-9+\-\s()]{10,}$/;
      if (!phoneRegex.test(form.phone.replace(/\s/g, ''))) {
        errors.push("Please enter a valid phone number");
        fieldErrors.phone = "Please enter a valid phone number";
      }
    }
    
    if (!form.address.trim()) {
      errors.push("Address is required");
      fieldErrors.address = "Address is required";
    }
    
    if (!form.city.trim()) {
      errors.push("City is required");
      fieldErrors.city = "City is required";
    }
    
    if (!form.pincode.trim()) {
      errors.push("Pincode is required");
      fieldErrors.pincode = "Pincode is required";
    }
    
    if (!form.state.trim()) {
      errors.push("State is required");
      fieldErrors.state = "State is required";
    }
    
    if (!form.country.trim()) {
      errors.push("Country is required");
      fieldErrors.country = "Country is required";
    }
    
    return { errors, fieldErrors };
  };

  // Helper function to check if a field is empty
  const isFieldEmpty = (field: keyof CheckoutForm) => {
    return !form[field].trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setFormErrors([]);
    setFieldErrors({});
    
    // Validate form
    const { errors, fieldErrors } = validateForm();
    if (errors.length > 0) {
      setFormErrors(errors);
      setFieldErrors(fieldErrors);
      return;
    }
    
    setLoading(true);
    setOrderProcessing(true);

    try {
      if (form.paymentMethod === "phonepe") {
        await handlePhonePePayment();
      } else {
        await handleCODPayment();
      }
    } catch (error) {
      console.error("Checkout error:", error);
      const errorMessage = error instanceof Error ? error.message : "Something went wrong. Please try again.";
      setFormErrors([errorMessage]);
      setOrderProcessing(false);
    } finally {
      setLoading(false);
    }
  };


  const createOrder = async (paymentMethod: string) => {
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
      paymentMethod
    };

    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData)
    });

    if (!response.ok) {
      const responseText = await response.text();
      let errorData;
      try {
        errorData = responseText ? JSON.parse(responseText) : { message: "Failed to create order" };
      } catch {
        errorData = { message: responseText || "Failed to create order" };
      }
      throw new Error(errorData.message || "Failed to create order");
    }

    return response.json();
  };

  const handlePhonePePayment = async () => {
    const result = await createOrder("phonepe");
    const orderId = result.orderId;
    const merchantOrderId = (result.orderNumber || `ORD-${orderId}`)
      .replace(/[^a-zA-Z0-9_-]/g, "-")
      .slice(0, 63);

    const paymentResponse = await fetch("/api/payment/phonepe/initiate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId,
        merchantOrderId,
        amount: total,
        phone: form.phone,
      }),
    });

    const paymentData = await paymentResponse.json();

    if (!paymentResponse.ok || !paymentData.redirectUrl) {
      throw new Error(paymentData.message || "Failed to initiate PhonePe payment");
    }

    window.location.href = paymentData.redirectUrl;
  };

  const handleCODPayment = async () => {
    const result = await createOrder("cod");
    clear();
    router.push(`/thank-you?orderId=${result.orderId}`);
  };

  // Search for client by phone number
  const searchClient = async (phone: string) => {
    if (phone.length < 10) return; // Only search if phone has at least 10 digits
    
    setIsSearchingClient(true);
    try {
      const response = await fetch(`/api/clients/search?phone=${encodeURIComponent(phone)}`);
      const data = await response.json();
      
      if (data.found && data.client) {
        const client = data.client;
        setForm(prev => ({
          ...prev,
          name: client.name || prev.name,
          email: client.email || prev.email,
          address: client.address || prev.address,
          city: client.city || prev.city,
          pincode: client.pincode || prev.pincode,
          state: client.state || prev.state,
          country: client.country || prev.country,
        }));
        setClientFound(true);
      } else {
        setClientFound(false);
      }
    } catch (error) {
      console.error("Client search error:", error);
      setClientFound(false);
    } finally {
      setIsSearchingClient(false);
    }
  };

  // Debounced client search effect
  useEffect(() => {
    if (form.phone.length >= 10) {
      const timeoutId = setTimeout(() => {
        searchClient(form.phone);
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    } else {
      setClientFound(false);
    }
  }, [form.phone]);

  const handleInputChange = (field: keyof CheckoutForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    
    // Clear errors when user starts typing
    if (formErrors.length > 0) {
      setFormErrors([]);
    }
    // Clear field-specific error
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
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

  const getAvailablePaymentMethods = () => {
    const methods: {
      id: string;
      value: "phonepe" | "cod";
      title: string;
      description: string;
      icon: React.ReactNode;
    }[] = [
      {
        id: 'phonepe',
        value: 'phonepe',
        title: 'PhonePe / UPI / Cards',
        description: 'Pay securely via PhonePe, UPI, debit or credit card',
        icon: (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
          </svg>
        )
      }
    ];

    if (isUdaipurAddress()) {
      methods.push({
        id: 'cod',
        value: 'cod' as const,
        title: 'Cash on Delivery',
        description: 'Pay when your order arrives (Udaipur only)',
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        )
      });
    }

    return methods;
  };

  useEffect(() => {
    const methods = getAvailablePaymentMethods();
    if (!methods.find(m => m.value === form.paymentMethod)) {
      setForm(prev => ({ ...prev, paymentMethod: methods[0].value }));
    }
  }, [form.city, form.state, form.address]);

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <InnerBanner
        title="Checkout"
        subtitle="Complete your order securely in just a few steps."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="mb-8">
          <h1 className="checkout-title">Checkout</h1>
          <p className="checkout-subtitle">Complete your order</p>
        </div>
        {/* Render nothing if cart empty (redirect happens silently) */}
        {lines.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Checkout Form */}
            <div className="checkout-form-container">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Required Fields Note */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h3 className="text-sm font-medium text-blue-800">All fields marked with <span className="text-red-500">*</span> are required</h3>
                      <p className="mt-1 text-sm text-blue-700">Please fill in all the required information to complete your order.</p>
                    </div>
                  </div>
                </div>
                
                {/* Personal Information */}
                <div className="checkout-section">
                  <h2 className="checkout-section-title">Already a Member? <br/><small>We’ll auto-fill your details using your phone number.</small></h2>
                  <div className="grid gap-4">
                    <div>
                      <label className="checkout-label">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          required
                          value={form.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          className={`checkout-input pr-10 ${fieldErrors.phone ? 'border-red-500 focus:border-red-500' : isFieldEmpty('phone') ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-indigo-500'}`}
                          placeholder="Enter your phone number"
                        />
                        {isSearchingClient && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                          </div>
                        )}
                        {clientFound && !isSearchingClient && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                      {fieldErrors.phone && (
                        <p className="mt-1 text-sm text-red-600">{fieldErrors.phone}</p>
                      )}
                      {clientFound && !isSearchingClient && (
                        <p className="mt-1 text-sm text-green-600 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Client found! Form auto-filled with existing details.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="checkout-section">
                  <h2 className="checkout-section-title">Personal Details</h2>
                  <div>
                    <label className="checkout-label">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className={`checkout-input ${fieldErrors.name ? 'border-red-500 focus:border-red-500' : isFieldEmpty('name') ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-indigo-500'}`}
                      placeholder="Enter your full name"
                    />
                    {fieldErrors.name && (
                      <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="checkout-label">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className={`checkout-input ${fieldErrors.email ? 'border-red-500 focus:border-red-500' : isFieldEmpty('email') ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-indigo-500'}`}
                      placeholder="Enter your email"
                    />
                    {fieldErrors.email && (
                      <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="checkout-label">
                        Address <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        required
                        value={form.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        className={`checkout-textarea ${fieldErrors.address ? 'border-red-500 focus:border-red-500' : isFieldEmpty('address') ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-indigo-500'}`}
                        placeholder="Enter your complete address"
                        rows={3}
                      />
                      {fieldErrors.address && (
                        <p className="mt-1 text-sm text-red-600">{fieldErrors.address}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="checkout-label">
                          City <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={form.city}
                          onChange={(e) => handleInputChange("city", e.target.value)}
                          className={`checkout-input ${fieldErrors.city ? 'border-red-500 focus:border-red-500' : isFieldEmpty('city') ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-indigo-500'}`}
                          placeholder="City"
                        />
                        {fieldErrors.city && (
                          <p className="mt-1 text-sm text-red-600">{fieldErrors.city}</p>
                        )}
                      </div>
                      <div>
                        <label className="checkout-label">
                          Pincode <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={form.pincode}
                          onChange={(e) => handleInputChange("pincode", e.target.value)}
                          className={`checkout-input ${fieldErrors.pincode ? 'border-red-500 focus:border-red-500' : isFieldEmpty('pincode') ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-indigo-500'}`}
                          placeholder="Pincode"
                        />
                        {fieldErrors.pincode && (
                          <p className="mt-1 text-sm text-red-600">{fieldErrors.pincode}</p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="checkout-label">
                          State <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={form.state}
                          onChange={(e) => handleInputChange("state", e.target.value)}
                          className={`checkout-input ${fieldErrors.state ? 'border-red-500 focus:border-red-500' : isFieldEmpty('state') ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-indigo-500'}`}
                          placeholder="State"
                        />
                        {fieldErrors.state && (
                          <p className="mt-1 text-sm text-red-600">{fieldErrors.state}</p>
                        )}
                      </div>
                      <div>
                        <label className="checkout-label">
                          Country <span className="text-red-500">*</span>
                        </label>
                        <select
                          required
                          value={form.country}
                          onChange={(e) => handleInputChange("country", e.target.value)}
                          className={`checkout-input ${fieldErrors.country ? 'border-red-500 focus:border-red-500' : isFieldEmpty('country') ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-indigo-500'}`}
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
                        {fieldErrors.country && (
                          <p className="mt-1 text-sm text-red-600">{fieldErrors.country}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Order Summary */}
            <div>
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
                  {/* Clear Cart Button */}
                  <button
                    type="button"
                    onClick={handleClearCart}
                    disabled={!lines.length}
                    className="mt-4 w-full rounded-md border border-red-500 text-red-600 text-sm py-2 font-medium hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>

              {/* Payment Method & Place Order */}
              <div className="checkout-summary">
                <h2 className="checkout-summary-title">Payment Method</h2>
                <div className="space-y-4">
                  {getAvailablePaymentMethods().map((method) => (
                    <div key={method.id} className="payment-option mb-4">
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
                  ) : form.paymentMethod === "phonepe" ? (
                    `Pay with PhonePe - ₹${total.toLocaleString("en-IN")}`
                  ) : (
                    `Place Order - ₹${total.toLocaleString("en-IN")}`
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
