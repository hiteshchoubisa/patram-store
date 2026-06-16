import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  checkOrderStatus,
  getAuthToken,
  getPhonePeConfig,
  resolvePaymentOutcome,
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
    const { merchantOrderId, orderId } = await request.json();

    if (!merchantOrderId) {
      return NextResponse.json(
        { success: false, message: "merchantOrderId is required" },
        { status: 400 },
      );
    }

    const config = getPhonePeConfig();
    const token = await getAuthToken(config);
    const status = await checkOrderStatus(config, token, merchantOrderId);

    const paymentOutcome = resolvePaymentOutcome(status);
    const paymentStatus = paymentOutcome;
    const transactionId =
      status.paymentDetails?.[0]?.transactionId ?? status.orderId;

    const updateData: Record<string, string> = {
      payment_status: paymentStatus,
      phonepe_order_id: status.orderId,
      phonepe_merchant_order_id: merchantOrderId,
    };

    if (transactionId && paymentOutcome !== "cancelled") {
      updateData.payment_id = transactionId;
    }

    if (paymentOutcome === "paid") {
      updateData.status = "Confirmed";
    }

    const supabase = getSupabaseAdmin();
    const query = supabase.from("orders").update(updateData);

    if (orderId) {
      await query.eq("id", orderId);
    } else {
      await query.eq("phonepe_merchant_order_id", merchantOrderId);
    }

    return NextResponse.json({
      success: true,
      state: status.state,
      paymentStatus,
      paymentOutcome,
      cancelled: paymentOutcome === "cancelled",
      orderId: orderId ?? status.metaInfo?.udf1,
      merchantOrderId,
      phonepeOrderId: status.orderId,
      transactionId,
    });
  } catch (error) {
    console.error("PhonePe verify error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to verify PhonePe payment",
      },
      { status: 500 },
    );
  }
}
