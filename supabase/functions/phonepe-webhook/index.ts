import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/phonepe.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    console.log("PhonePe webhook received:", JSON.stringify(payload));

    const event = payload.event;
    const orderPayload = payload.payload ?? payload;
    const state = orderPayload.state;
    const merchantOrderId =
      orderPayload.merchantOrderId ?? orderPayload.merchantOrderID;
    const phonepeOrderId = orderPayload.orderId;
    const orderId = orderPayload.metaInfo?.udf1;

    if (!merchantOrderId && !orderId) {
      return new Response(JSON.stringify({ success: false }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let paymentStatus = "pending";
    let orderStatus: string | undefined;

    if (
      event === "checkout.order.completed" ||
      state === "COMPLETED"
    ) {
      paymentStatus = "paid";
      orderStatus = "Confirmed";
    } else if (
      event === "checkout.order.failed" ||
      state === "FAILED"
    ) {
      paymentStatus = "failed";
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const updateData: Record<string, string> = {
      payment_status: paymentStatus,
      payment_method: "phonepe",
    };

    if (phonepeOrderId) updateData.phonepe_order_id = phonepeOrderId;
    if (merchantOrderId) updateData.phonepe_merchant_order_id = merchantOrderId;
    if (orderStatus) updateData.status = orderStatus;

    const transactionId =
      orderPayload.paymentDetails?.[0]?.transactionId;
    if (transactionId) updateData.payment_id = transactionId;

    const query = supabase.from("orders").update(updateData);

    if (orderId) {
      await query.eq("id", orderId);
    } else if (merchantOrderId) {
      await query.eq("phonepe_merchant_order_id", merchantOrderId);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("phonepe-webhook error:", error);
    return new Response(JSON.stringify({ success: false }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
