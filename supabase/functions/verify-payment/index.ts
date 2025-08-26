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

    logStep("Payment verification result", {
      reference,
      status: paymentData.status,
      amount: paymentData.amount,
      customer: paymentData.customer?.email
    });

    // Update order status in orders_v2 table if payment was successful
    if (isSuccessful) {
      // Find the order by payment reference
      const { data: orderData, error: findError } = await supabaseService
        .from("orders_v2")
        .select("*")
        .eq("payment_reference", reference)
        .maybeSingle();

      if (findError) {
        logStep("Error finding order", findError);
      } else if (orderData) {
        // Update order status to paid
        const { error: updateError } = await supabaseService
          .from("orders_v2")
          .update({ 
            status: "paid",
            updated_at: new Date().toISOString()
          })
          .eq("id", orderData.id);

        if (updateError) {
          logStep("Failed to update order status", updateError);
        } else {
          logStep("Order status updated to paid", { orderId: orderData.id });

          // Create payment reconciliation record
          const { error: reconciliationError } = await supabaseService
            .from("payment_reconciliation")
            .insert({
              order_id: orderData.id,
              payment_method: "paystack",
              paystack_reference: reference,
              reconciled_amount_kobo: paymentData.amount,
              status: "reconciled",
              notes: `Auto-reconciled via Paystack verification`
            });

          if (reconciliationError) {
            logStep("Failed to create reconciliation record", reconciliationError);
          }

          // Auto-assign delivery if enabled
          if (orderData.vendor_id) {
            try {
              const { error: deliveryError } = await supabaseService.functions.invoke('assign-delivery', {
                body: { order_id: orderData.id }
              });
              if (deliveryError) {
                logStep("Failed to auto-assign delivery", deliveryError);
              } else {
                logStep("Delivery assignment triggered", { orderId: orderData.id });
              }
            } catch (deliveryErr) {
              logStep("Error triggering delivery assignment", deliveryErr);
            }
          }
        }
      } else {
        logStep("No order found with payment reference", { reference });
      }

      // Update product analytics if available in metadata
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
        amount: paymentData.amount / 100, // Convert kobo to naira
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