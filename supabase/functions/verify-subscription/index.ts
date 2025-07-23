import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifySubscriptionRequest {
  reference: string;
}

interface PaystackResponse {
  status: boolean;
  message: string;
  data?: any;
}

const logStep = (step: string, data?: any) => {
  console.log(`[VERIFY-SUBSCRIPTION] ${step}:`, data || '');
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  logStep("Starting subscription verification");

  try {
    // Get Paystack secret key
    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!paystackSecretKey) {
      throw new Error("Paystack secret key not configured");
    }

    // Initialize Supabase service client
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Parse request body
    const body: VerifySubscriptionRequest = await req.json();
    const { reference } = body;

    if (!reference) {
      throw new Error("Missing payment reference");
    }

    logStep("Verifying payment reference", reference);

    // Verify payment with Paystack
    const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
    });

    const verifyData: PaystackResponse = await verifyResponse.json();
    
    if (!verifyData.status) {
      logStep("Payment verification failed", verifyData);
      throw new Error(verifyData.message || "Payment verification failed");
    }

    const { data: paymentData } = verifyData;
    logStep("Payment verified", { status: paymentData.status, amount: paymentData.amount });

    if (paymentData.status !== 'success') {
      return new Response(JSON.stringify({
        success: false,
        verified: false,
        payment_status: paymentData.status
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extract metadata
    const metadata = paymentData.metadata || {};
    const { user_id, plan_name, billing_cycle } = metadata;

    if (!user_id || !plan_name || !billing_cycle) {
      logStep("Missing metadata in payment", metadata);
      throw new Error("Invalid payment metadata");
    }

    // Get subscription plan details
    const { data: planData, error: planError } = await supabaseService
      .from('subscription_plans')
      .select('*')
      .eq('plan_name', plan_name)
      .eq('billing_cycle', billing_cycle)
      .single();

    if (planError || !planData) {
      logStep("Plan not found", { plan_name, billing_cycle });
      throw new Error("Subscription plan not found");
    }

    // Create subscription with Paystack
    logStep("Creating subscription with Paystack");
    
    const subscriptionResponse = await fetch("https://api.paystack.co/subscription", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customer: paymentData.customer.customer_code,
        plan: planData.paystack_plan_code,
        authorization: paymentData.authorization.authorization_code
      }),
    });

    const subscriptionData: PaystackResponse = await subscriptionResponse.json();
    
    if (!subscriptionData.status) {
      logStep("Subscription creation failed", subscriptionData);
      throw new Error(subscriptionData.message || "Failed to create subscription");
    }

    logStep("Subscription created", subscriptionData.data);

    // Update user profile with subscription details
    const subscriptionInfo = subscriptionData.data;
    const { error: updateError } = await supabaseService
      .from('profiles')
      .update({
        subscription_status: 'active',
        plan: plan_name,
        billing_cycle: billing_cycle,
        paystack_customer_code: paymentData.customer.customer_code,
        paystack_subscription_code: subscriptionInfo.subscription_code,
        next_billing_date: subscriptionInfo.next_payment_date,
        subscription_created_at: new Date().toISOString(),
        subscription_updated_at: new Date().toISOString()
      })
      .eq('id', user_id);

    if (updateError) {
      logStep("Failed to update profile", updateError);
      throw new Error("Failed to update user subscription");
    }

    logStep("User subscription updated successfully");

    return new Response(JSON.stringify({
      success: true,
      verified: true,
      payment_status: paymentData.status,
      subscription_code: subscriptionInfo.subscription_code,
      plan_name: plan_name,
      billing_cycle: billing_cycle,
      next_billing_date: subscriptionInfo.next_payment_date
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    logStep("Error occurred", error.message);
    return new Response(JSON.stringify({
      success: false,
      verified: false,
      error: error.message
    }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});