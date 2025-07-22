import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyPaymentRequest {
  reference: string;
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Payment verification started");

    const paystackKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!paystackKey) {
      throw new Error("PAYSTACK_SECRET_KEY is not configured");
    }

    // Create Supabase client with service role for secure operations
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { reference }: VerifyPaymentRequest = await req.json();
    if (!reference) {
      throw new Error("Payment reference is required");
    }

    logStep("Verifying payment with Paystack", { reference });

    // Verify payment with Paystack
    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${paystackKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const paystackResult = await paystackResponse.json();
    logStep("Paystack verification response", { 
      status: paystackResponse.status,
      success: paystackResult.status,
      paymentStatus: paystackResult.data?.status
    });

    if (!paystackResponse.ok || !paystackResult.status) {
      throw new Error(paystackResult.message || "Failed to verify payment");
    }

    const paymentData = paystackResult.data;
    const isSuccessful = paymentData.status === "success";
    const amount = paymentData.amount / 100; // Convert from kobo to naira

    logStep("Payment verification result", {
      reference,
      status: paymentData.status,
      amount,
      customer: paymentData.customer?.email
    });

    // Update order status in database if payment was successful
    if (isSuccessful && paymentData.metadata?.vendora_store_id) {
      const { error: updateError } = await supabaseService
        .from("orders")
        .update({ 
          status: "paid",
          updated_at: new Date().toISOString()
        })
        .eq("vendor_id", paymentData.metadata.vendora_user_id)
        .eq("store_id", paymentData.metadata.vendora_store_id)
        .ilike("order_notes", `%${reference}%`);

      if (updateError) {
        logStep("Failed to update order status", updateError);
      } else {
        logStep("Order status updated to paid");
      }

      // Update product analytics if product_id is available
      if (paymentData.metadata?.product_id) {
        const { error: productUpdateError } = await supabaseService
          .from("products")
          .update({ 
            views: supabaseService.sql`views + 1`,
            updated_at: new Date().toISOString()
          })
          .eq("id", paymentData.metadata.product_id);

        if (productUpdateError) {
          logStep("Failed to update product analytics", productUpdateError);
        }
      }
    }

    // Return verification result
    return new Response(
      JSON.stringify({
        success: true,
        verified: isSuccessful,
        payment_status: paymentData.status,
        amount: amount,
        currency: paymentData.currency,
        customer_email: paymentData.customer?.email,
        paid_at: paymentData.paid_at,
        reference: reference,
        gateway_response: paymentData.gateway_response
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in verify-payment", { message: errorMessage });
    return new Response(
      JSON.stringify({ 
        success: false, 
        verified: false,
        error: errorMessage 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});