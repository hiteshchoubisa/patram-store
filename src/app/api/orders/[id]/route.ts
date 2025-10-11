import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;
    console.log("Fetching order with ID:", orderId);
    
    // Try to find order by order_number first, then by id
    let { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', orderId)
      .single();
    
    console.log("Search by order_number result:", { order, error });
    
    // If not found by order_number, try by id
    if (error && error.code === 'PGRST116') {
      console.log("Order not found by order_number, trying by id");
      const { data: orderById, error: errorById } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
      
      console.log("Search by id result:", { orderById, errorById });
      
      if (errorById) {
        console.error("Order not found by id either:", errorById);
        return NextResponse.json(
          { success: false, message: "Order not found", error: errorById.message },
          { status: 404 }
        );
      }
      
      order = orderById;
      error = null; // Clear the error since we found the order
    }
    
    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { success: false, message: "Failed to fetch order", error: error.message },
        { status: 500 }
      );
    }
    
    if (!order) {
      console.error("No order data returned");
      return NextResponse.json(
        { success: false, message: "Order data is empty" },
        { status: 404 }
      );
    }
    
    console.log("Order found successfully:", {
      id: order.id,
      order_number: order.order_number,
      client: order.client,
      status: order.status,
      total: order.total
    });
    
    return NextResponse.json({
      success: true,
      order: order
    });
    
  } catch (error) {
    console.error("Order fetch error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to fetch order",
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}