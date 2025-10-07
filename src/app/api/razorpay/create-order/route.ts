import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

// Check if Razorpay credentials are available
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error("Razorpay credentials not found in environment variables");
}

const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET 
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  : null;

export async function POST(request: NextRequest) {
  try {
    if (!razorpay) {
      return NextResponse.json(
        { success: false, message: "Razorpay is not configured. Please check environment variables." },
        { status: 500 }
      );
    }

    const { amount, currency = "INR", orderId } = await request.json();

    if (!amount || !orderId) {
      return NextResponse.json(
        { success: false, message: "Amount and orderId are required" },
        { status: 400 }
      );
    }

    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency,
      receipt: orderId,
      notes: {
        orderId,
      },
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create payment order" },
      { status: 500 }
    );
  }
}
