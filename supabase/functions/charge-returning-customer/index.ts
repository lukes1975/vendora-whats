import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ChargeRequest {
  authorization_code: string;
  email: string;
  amount: number; // Amount in kobo
  currency?: string;
  reference?: string;
  subaccount?: string;
  metadata?: Record<string, any>;
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHARGE-RETURNING-CUSTOMER] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Charging returning customer function started");

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

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseService.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    const chargeData: ChargeRequest = await req.json();
    logStep("Charge request received", { 
      email: chargeData.email, 
      amount: chargeData.amount 
    });

    // Validate charge data
    if (!chargeData.authorization_code) {
      throw new Error("Authorization code is required");
    }

    if (!chargeData.email) {
      throw new Error("Customer email is required");
    }

    if (!chargeData.amount || chargeData.amount < 100) {
      throw new Error("Invalid amount. Minimum charge is ₦1.00");
    }

    // Generate unique reference if not provided
    const reference = chargeData.reference || `vendora_recurring_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Prepare Paystack payload for charging authorization
    const paystackPayload = {
      authorization_code: chargeData.authorization_code,
      email: chargeData.email,
      amount: chargeData.amount,
      currency: chargeData.currency || "NGN",
      reference: reference,
      ...(chargeData.subaccount && { 
        subaccount: chargeData.subaccount,
        bearer: "subaccount"
      }),
      metadata: {
        vendora_user_id: user.id,
        source: "vendora_recurring_charge",
        ...chargeData.metadata
      }
    };

    logStep("Charging authorization", { reference, amount: chargeData.amount });

    // Charge the authorization
    const paystackResponse = await fetch("https://api.paystack.co/transaction/charge_authorization", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${paystackKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paystackPayload),
    });

    const paystackResult = await paystackResponse.json();
    logStep("Paystack charge response received", { 
      status: paystackResponse.status, 
      success: paystackResult.status 
    });

    if (!paystackResponse.ok || !paystackResult.status) {
      throw new Error(paystackResult.message || "Failed to charge customer");
    }

    // Return charge result
    return new Response(
      JSON.stringify({
        success: true,
        reference: reference,
        status: paystackResult.data.status,
        gateway_response: paystackResult.data.gateway_response,
        amount: paystackResult.data.amount,
        currency: paystackResult.data.currency,
        transaction_date: paystackResult.data.transaction_date,
        channel: paystackResult.data.channel
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in charge-returning-customer", { message: errorMessage });
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