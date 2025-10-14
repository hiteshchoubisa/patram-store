import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orderId = id;
    console.log("Checking order for ID:", orderId);
    
    // Get the order
    const { data: order, error } = await supabase
      .from('orders')
      .select('id, order_number, client, status, total, created_at')
      .eq('id', orderId)
      .single();
    
    if (error) {
      console.error("Error fetching order:", error);
      return NextResponse.json(
        { success: false, message: "Order not found", error: error.message },
        { status: 404 }
      );
    }
    
    console.log("Order found:", order);
    
    return NextResponse.json({
      success: true,
      order: order,
      hasOrderNumber: !!order.order_number,
      orderNumber: order.order_number,
      displayText: order.order_number || order.id,
      message: order.order_number 
        ? `Order has number: ${order.order_number}` 
        : `Order missing number, using UUID: ${order.id}`
    });
    
  } catch (error) {
    console.error("Check order error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to check order",
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
