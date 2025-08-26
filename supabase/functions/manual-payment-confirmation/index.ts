import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ManualPaymentRequest {
  order_id: string;
  amount_kobo: number;
  customer_reference?: string;
  proof_image_url?: string;
  bank_details: {
    account_name: string;
    account_number: string;
    bank_name: string;
    transfer_date: string;
  };
}

interface ConfirmPaymentRequest {
  confirmation_id: string;
  action: "confirm" | "reject";
  rejection_reason?: string;
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[MANUAL-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Manual payment confirmation started");

    // Create Supabase client for user authentication
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Create service role client for database operations
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization header is required");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error("Invalid authentication token");
    }

    const userId = userData.user.id;
    const requestBody = await req.json();

    // Handle different types of requests
    if (requestBody.action === "confirm" || requestBody.action === "reject") {
      // Vendor confirming/rejecting a manual payment
      const { confirmation_id, action, rejection_reason }: ConfirmPaymentRequest = requestBody;

      logStep(`${action} manual payment`, { confirmation_id, userId });

      // Get the confirmation record
      const { data: confirmation, error: confirmationError } = await supabaseService
        .from("manual_payment_confirmations")
        .select("*, orders_v2!inner(vendor_id)")
        .eq("id", confirmation_id)
        .eq("orders_v2.vendor_id", userId)
        .maybeSingle();

      if (confirmationError || !confirmation) {
        throw new Error("Manual payment confirmation not found or access denied");
      }

      if (confirmation.status !== "pending") {
        throw new Error(`Payment confirmation already ${confirmation.status}`);
      }

      // Update confirmation status
      const updateData = {
        status: action === "confirm" ? "confirmed" : "rejected",
        confirmed_by: userId,
        confirmed_at: new Date().toISOString(),
        ...(action === "reject" && { rejected_reason }),
        updated_at: new Date().toISOString()
      };

      const { error: updateError } = await supabaseService
        .from("manual_payment_confirmations")
        .update(updateData)
        .eq("id", confirmation_id);

      if (updateError) {
        throw new Error("Failed to update confirmation status");
      }

      // If confirmed, update order status and create reconciliation record
      if (action === "confirm") {
        const { error: orderUpdateError } = await supabaseService
          .from("orders_v2")
          .update({ 
            status: "paid",
            updated_at: new Date().toISOString()
          })
          .eq("id", confirmation.order_id);

        if (orderUpdateError) {
          logStep("Failed to update order status", orderUpdateError);
        }

        // Create payment reconciliation record
        const { error: reconciliationError } = await supabaseService
          .from("payment_reconciliation")
          .insert({
            order_id: confirmation.order_id,
            payment_method: "bank_transfer",
            manual_confirmation_id: confirmation_id,
            reconciled_amount_kobo: confirmation.amount_kobo,
            status: "reconciled",
            reconciled_by: userId,
            notes: `Manual bank transfer confirmed by vendor`
          });

        if (reconciliationError) {
          logStep("Failed to create reconciliation record", reconciliationError);
        }

        // Auto-assign delivery
        try {
          const { error: deliveryError } = await supabaseService.functions.invoke('assign-delivery', {
            body: { order_id: confirmation.order_id }
          });
          if (deliveryError) {
            logStep("Failed to auto-assign delivery", deliveryError);
          }
        } catch (deliveryErr) {
          logStep("Error triggering delivery assignment", deliveryErr);
        }
      }

      logStep(`Payment confirmation ${action}ed successfully`);

      return new Response(
        JSON.stringify({
          success: true,
          status: action === "confirm" ? "confirmed" : "rejected",
          confirmation_id
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );

    } else {
      // Customer submitting manual payment proof
      const { order_id, amount_kobo, customer_reference, proof_image_url, bank_details }: ManualPaymentRequest = requestBody;

      logStep("Creating manual payment confirmation", { order_id, amount_kobo });

      // Verify the order exists and get vendor_id
      const { data: orderData, error: orderError } = await supabaseService
        .from("orders_v2")
        .select("vendor_id, total, status")
        .eq("id", order_id)
        .maybeSingle();

      if (orderError || !orderData) {
        throw new Error("Order not found");
      }

      if (orderData.status === "paid") {
        throw new Error("Order is already paid");
      }

      // Create manual payment confirmation record
      const { data: confirmationData, error: insertError } = await supabaseService
        .from("manual_payment_confirmations")
        .insert({
          order_id,
          vendor_id: orderData.vendor_id,
          amount_kobo,
          currency: "NGN",
          customer_reference,
          proof_image_url,
          bank_details,
          status: "pending"
        })
        .select()
        .single();

      if (insertError) {
        throw new Error("Failed to create payment confirmation record");
      }

      logStep("Manual payment confirmation created", { id: confirmationData.id });

      return new Response(
        JSON.stringify({
          success: true,
          confirmation_id: confirmationData.id,
          status: "pending",
          message: "Payment proof submitted successfully. Awaiting vendor confirmation."
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in manual-payment-confirmation", { message: errorMessage });
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});