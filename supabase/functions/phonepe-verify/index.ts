import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  checkOrderStatus,
  corsHeaders,
  getAuthToken,
  getPhonePeConfig,
} from "../_shared/phonepe.ts";

function mapPaymentStatus(state: string): string {
  switch (state) {
    case "COMPLETED":
      return "paid";
    case "FAILED":
      return "failed";
    default:
      return "pending";
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { merchantOrderId, orderId } = await req.json();

    if (!merchantOrderId) {
      return new Response(
        JSON.stringify({ success: false, message: "merchantOrderId is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const config = getPhonePeConfig();
    const token = await getAuthToken(config);
    const status = await checkOrderStatus(config, token, merchantOrderId);

    const paymentStatus = mapPaymentStatus(status.state);
    const transactionId =
      status.paymentDetails?.[0]?.transactionId ?? status.orderId;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const updateData: Record<string, string> = {
      payment_status: paymentStatus,
      phonepe_order_id: status.orderId,
      phonepe_merchant_order_id: merchantOrderId,
    };

    if (transactionId) {
      updateData.payment_id = transactionId;
    }

    if (paymentStatus === "paid") {
      updateData.status = "Confirmed";
    }

    const query = supabase.from("orders").update(updateData);

    if (orderId) {
      await query.eq("id", orderId);
    } else {
      await query.eq("phonepe_merchant_order_id", merchantOrderId);
    }

    return new Response(
      JSON.stringify({
        success: true,
        state: status.state,
        paymentStatus,
        orderId: orderId ?? status.metaInfo?.udf1,
        phonepeOrderId: status.orderId,
        transactionId,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("phonepe-verify error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : "Payment verification failed",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
