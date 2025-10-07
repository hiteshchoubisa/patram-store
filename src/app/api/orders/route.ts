import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

interface OrderItem {
  product_id: string;
  product_name: string;
  product_image: string;
  quantity: number;
  price: number;
}

interface OrderData {
  items: OrderItem[];
  total: number;
  customerEmail: string;
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    pincode: string;
    state: string;
    country: string;
  };
  paymentMethod: string;
  paymentId?: string;
  razorpayOrderId?: string;
}

export async function PUT(request: NextRequest) {
  try {
    const { orderId, paymentId, razorpayOrderId } = await request.json();
    
    if (!orderId || !paymentId || !razorpayOrderId) {
      return NextResponse.json(
        { success: false, message: "Order ID, payment ID, and Razorpay order ID are required" },
        { status: 400 }
      );
    }

    // Update order with payment details
    // For now, skip status updates to avoid constraint issues
    // TODO: Uncomment payment fields after running ADD_PAYMENT_COLUMNS.sql
    const { error } = await supabase
      .from('orders')
      .update({
        // payment_id: paymentId,
        // razorpay_order_id: razorpayOrderId,
        status: 'Processing' // Use valid status for payment completion
      })
      .eq('id', orderId);

    if (error) {
      console.error("Database update error:", error);
      return NextResponse.json(
        { success: false, message: "Failed to update order with payment details" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order updated with payment details"
    });
    
  } catch (error) {
    console.error("Order update error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update order" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const orderData: OrderData = await request.json();
    
    // Validate orderData structure
    if (!orderData || !orderData.items || !Array.isArray(orderData.items)) {
      return NextResponse.json(
        { success: false, message: "Invalid order data: items array is required" },
        { status: 400 }
      );
    }
    
    // Convert items to your format with product details
    const formattedItems = orderData.items.map((item: OrderItem) => ({
      qty: item.quantity,
      kind: 'product',
      productId: item.product_id,
      product_name: item.product_name,
      product_image: item.product_image,
      price: item.price
    }));

    // Save order to Supabase using absolute minimal fields
    const orderInsertData: any = {
      client: orderData.shippingAddress?.name || 'Guest Customer',
      order_date: new Date().toISOString(),
      status: 'Pending', // Use valid status that works with database constraint
      items: formattedItems
    };

    // Add optional fields only if they exist
    if (orderData.shippingAddress) {
      orderInsertData.message = `${orderData.shippingAddress.address}, ${orderData.shippingAddress.city}, ${orderData.shippingAddress.state}, ${orderData.shippingAddress.country} - ${orderData.shippingAddress.pincode}`;
    }
    
    // Add discount field
    orderInsertData.discount = 0.00;

    // For now, skip payment-related fields until database columns are added
    // TODO: Uncomment these after running ADD_PAYMENT_COLUMNS.sql
    // if (orderData.paymentMethod) {
    //   orderInsertData.payment_method = orderData.paymentMethod;
    // }
    // if (orderData.paymentId) {
    //   orderInsertData.payment_id = orderData.paymentId;
    // }
    // if (orderData.razorpayOrderId) {
    //   orderInsertData.razorpay_order_id = orderData.razorpayOrderId;
    // }

    console.log("Attempting to insert order with data:", orderInsertData);
    
    const { data, error } = await supabase
      .from('orders')
      .insert(orderInsertData)
      .select()
      .single();
    
    if (error) {
      console.error("Database error:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      console.error("Error details:", error.details);
      console.error("Error hint:", error.hint);
      
      return NextResponse.json(
        { 
          success: false, 
          message: "Failed to save order to database",
          error: error.message,
          code: error.code,
          details: error.details || null,
          hint: error.hint || null
        },
        { status: 500 }
      );
    }
    
    console.log("Order saved successfully:", data);
    
    // TODO: Send confirmation email
    // TODO: Update inventory
    // TODO: Create shipping label
    
    return NextResponse.json({
      success: true,
      orderId: data.id,
      message: "Order created successfully"
    });
    
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create order" },
      { status: 500 }
    );
  }
}
