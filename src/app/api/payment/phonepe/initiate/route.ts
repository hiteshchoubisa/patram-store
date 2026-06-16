import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  getAuthToken,
  getPhonePeConfig,
  initiatePayment,
} from "@/lib/phonepe";

function getSupabaseAdmin() {
  const url =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase configuration missing: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY",
    );
  }

  return createClient(url, key);
}

export async function POST(request: NextRequest) {
  try {
    const { orderId, merchantOrderId, amount, phone } = await request.json();

    if (!orderId || !merchantOrderId || !amount) {
      return NextResponse.json(
        {
          success: false,
          message: "orderId, merchantOrderId, and amount are required",
        },
        { status: 400 },
      );
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ??
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");

    const redirectUrl = `${siteUrl}/checkout/payment-callback?orderId=${orderId}&merchantOrderId=${encodeURIComponent(merchantOrderId)}`;

    const config = getPhonePeConfig();
    const token = await getAuthToken(config);

    const amountPaise = Math.round(Number(amount) * 100);
    if (amountPaise < 100) {
      return NextResponse.json(
        { success: false, message: "Minimum amount is ₹1" },
        { status: 400 },
      );
    }

    const payment = await initiatePayment(config, token, {
      merchantOrderId,
      amountPaise,
      redirectUrl,
      phone,
      orderId,
    });

    const supabase = getSupabaseAdmin();
    await supabase
      .from("orders")
      .update({
        payment_method: "phonepe",
        payment_status: "pending",
        phonepe_order_id: payment.orderId,
        phonepe_merchant_order_id: merchantOrderId,
      })
      .eq("id", orderId);

    return NextResponse.json({
      success: true,
      redirectUrl: payment.redirectUrl,
      phonepeOrderId: payment.orderId,
      merchantOrderId,
    });
  } catch (error) {
    console.error("PhonePe initiate error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to initiate PhonePe payment",
      },
      { status: 500 },
    );
  }
}
