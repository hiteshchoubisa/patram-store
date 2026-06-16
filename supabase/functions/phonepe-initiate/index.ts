import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  corsHeaders,
  getAuthToken,
  getPhonePeConfig,
  initiatePayment,
} from "../_shared/phonepe.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { orderId, merchantOrderId, amount, phone, redirectUrl } =
      await req.json();

    if (!orderId || !merchantOrderId || !amount || !redirectUrl) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "orderId, merchantOrderId, amount, and redirectUrl are required",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const config = getPhonePeConfig();
    const token = await getAuthToken(config);

    const amountPaise = Math.round(Number(amount) * 100);
    if (amountPaise < 100) {
      return new Response(
        JSON.stringify({ success: false, message: "Minimum amount is ₹1" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const payment = await initiatePayment(config, token, {
      merchantOrderId,
      amountPaise,
      redirectUrl,
      phone,
      orderId,
    });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    await supabase
      .from("orders")
      .update({
        payment_method: "phonepe",
        payment_status: "pending",
        phonepe_order_id: payment.orderId,
        phonepe_merchant_order_id: merchantOrderId,
      })
      .eq("id", orderId);

    return new Response(
      JSON.stringify({
        success: true,
        redirectUrl: payment.redirectUrl,
        phonepeOrderId: payment.orderId,
        merchantOrderId,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("phonepe-initiate error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : "Payment initiation failed",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
