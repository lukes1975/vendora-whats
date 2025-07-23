import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { createHash } from "https://deno.land/std@0.190.0/crypto/crypto.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-paystack-signature",
};

interface PaystackWebhookEvent {
  event: string;
  data: any;
}

const logStep = (step: string, data?: any) => {
  console.log(`[PAYSTACK-WEBHOOK] ${step}:`, data || '');
};

const verifyPaystackSignature = (payload: string, signature: string, secret: string): boolean => {
  const hash = createHash("sha512");
  hash.update(secret + payload);
  const expectedSignature = hash.toString();
  return expectedSignature === signature;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  logStep("Webhook received");

  try {
    // Get Paystack secret key
    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!paystackSecretKey) {
      throw new Error("Paystack secret key not configured");
    }

    // Get payload and signature
    const payload = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    if (!signature) {
      logStep("Missing signature");
      throw new Error("Missing Paystack signature");
    }

    // Verify webhook signature
    if (!verifyPaystackSignature(payload, signature, paystackSecretKey)) {
      logStep("Invalid signature");
      throw new Error("Invalid webhook signature");
    }

    logStep("Signature verified");

    // Parse webhook event
    const webhookEvent: PaystackWebhookEvent = JSON.parse(payload);
    const { event, data } = webhookEvent;

    logStep("Event received", event);

    // Initialize Supabase service client
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    switch (event) {
      case "subscription.create":
        await handleSubscriptionCreate(supabaseService, data);
        break;

      case "subscription.not_renew":
        await handleSubscriptionNotRenew(supabaseService, data);
        break;

      case "subscription.disable":
        await handleSubscriptionDisable(supabaseService, data);
        break;

      case "invoice.payment_success":
        await handleInvoicePaymentSuccess(supabaseService, data);
        break;

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(supabaseService, data);
        break;

      default:
        logStep("Unhandled event type", event);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    logStep("Webhook error", error.message);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function handleSubscriptionCreate(supabase: any, data: any) {
  logStep("Handling subscription.create", data);

  const { customer, plan, subscription_code, next_payment_date } = data;
  
  // Find user by customer email
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', customer.email)
    .single();

  if (profileError || !profileData) {
    logStep("Profile not found for subscription", customer.email);
    return;
  }

  // Get plan details
  const { data: planData, error: planError } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('paystack_plan_code', plan.plan_code)
    .single();

  if (planError || !planData) {
    logStep("Plan not found", plan.plan_code);
    return;
  }

  // Update user profile with subscription details
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      subscription_status: 'active',
      plan: planData.plan_name,
      billing_cycle: planData.billing_cycle,
      paystack_customer_code: customer.customer_code,
      paystack_subscription_code: subscription_code,
      next_billing_date: next_payment_date,
      subscription_created_at: new Date().toISOString(),
      subscription_updated_at: new Date().toISOString()
    })
    .eq('id', profileData.id);

  if (updateError) {
    logStep("Failed to update profile", updateError);
  } else {
    logStep("Subscription created successfully", profileData.id);
  }
}

async function handleSubscriptionNotRenew(supabase: any, data: any) {
  logStep("Handling subscription.not_renew", data);

  const { customer, subscription_code } = data;
  
  const { error } = await supabase
    .from('profiles')
    .update({
      subscription_status: 'inactive',
      subscription_updated_at: new Date().toISOString()
    })
    .eq('paystack_subscription_code', subscription_code);

  if (error) {
    logStep("Failed to update subscription status", error);
  } else {
    logStep("Subscription marked as not renewing");
  }
}

async function handleSubscriptionDisable(supabase: any, data: any) {
  logStep("Handling subscription.disable", data);

  const { customer, subscription_code } = data;
  
  const { error } = await supabase
    .from('profiles')
    .update({
      subscription_status: 'inactive',
      subscription_updated_at: new Date().toISOString()
    })
    .eq('paystack_subscription_code', subscription_code);

  if (error) {
    logStep("Failed to disable subscription", error);
  } else {
    logStep("Subscription disabled successfully");
  }
}

async function handleInvoicePaymentSuccess(supabase: any, data: any) {
  logStep("Handling invoice.payment_success", data);

  const { customer, subscription, paid_at } = data;
  
  // Update subscription status to active and next billing date
  const { error } = await supabase
    .from('profiles')
    .update({
      subscription_status: 'active',
      next_billing_date: subscription.next_payment_date,
      subscription_updated_at: new Date().toISOString()
    })
    .eq('paystack_subscription_code', subscription.subscription_code);

  if (error) {
    logStep("Failed to update subscription after payment", error);
  } else {
    logStep("Subscription renewed successfully");
  }
}

async function handleInvoicePaymentFailed(supabase: any, data: any) {
  logStep("Handling invoice.payment_failed", data);

  const { customer, subscription } = data;
  
  // Mark subscription as inactive due to failed payment
  const { error } = await supabase
    .from('profiles')
    .update({
      subscription_status: 'inactive',
      subscription_updated_at: new Date().toISOString()
    })
    .eq('paystack_subscription_code', subscription.subscription_code);

  if (error) {
    logStep("Failed to update subscription after failed payment", error);
  } else {
    logStep("Subscription marked inactive due to failed payment");
  }
}