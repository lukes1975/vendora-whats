import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateSubscriptionRequest {
  plan_name: 'starter' | 'pro';
  billing_cycle: 'monthly' | 'quarterly' | 'yearly';
}

interface PaystackResponse {
  status: boolean;
  message: string;
  data?: any;
}

const logStep = (step: string, data?: any) => {
  console.log(`[CREATE-SUBSCRIPTION] ${step}:`, data || '');
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  logStep("Starting subscription creation");

  try {
    // Get Paystack secret key
    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!paystackSecretKey) {
      throw new Error("Paystack secret key not configured");
    }

    // Initialize Supabase client (for user auth)
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Initialize Supabase service client (for database operations)
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      logStep("Authentication failed", authError);
      throw new Error("Authentication failed");
    }

    logStep("User authenticated", user.id);

    // Parse request body
    const body: CreateSubscriptionRequest = await req.json();
    const { plan_name, billing_cycle } = body;

    if (!plan_name || !billing_cycle) {
      throw new Error("Missing plan_name or billing_cycle");
    }

    logStep("Request parsed", { plan_name, billing_cycle });

    // Get subscription plan details
    const { data: planData, error: planError } = await supabaseService
      .from('subscription_plans')
      .select('*')
      .eq('plan_name', plan_name)
      .eq('billing_cycle', billing_cycle)
      .eq('is_active', true)
      .single();

    if (planError || !planData) {
      logStep("Plan not found", planError);
      throw new Error("Subscription plan not found");
    }

    logStep("Plan found", planData);

    // Get user profile
    const { data: profileData, error: profileError } = await supabaseService
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profileData) {
      logStep("Profile not found", profileError);
      throw new Error("User profile not found");
    }

    logStep("Profile found", { email: profileData.email });

    // Check if customer already exists in Paystack
    let paystackCustomerCode = profileData.paystack_customer_code;
    
    if (!paystackCustomerCode) {
      logStep("Creating new Paystack customer");
      
      // Create customer in Paystack
      const customerResponse = await fetch("https://api.paystack.co/customer", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${paystackSecretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: profileData.email,
          first_name: profileData.full_name?.split(' ')[0] || '',
          last_name: profileData.full_name?.split(' ').slice(1).join(' ') || '',
        }),
      });

      const customerData: PaystackResponse = await customerResponse.json();
      
      if (!customerData.status) {
        logStep("Customer creation failed", customerData);
        throw new Error(customerData.message || "Failed to create customer");
      }

      paystackCustomerCode = customerData.data.customer_code;
      logStep("Customer created", { customer_code: paystackCustomerCode });

      // Update profile with customer code
      await supabaseService
        .from('profiles')
        .update({ paystack_customer_code: paystackCustomerCode })
        .eq('id', user.id);
    }

    // Initialize subscription with Paystack
    logStep("Initializing subscription with Paystack");
    
    const subscriptionResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: profileData.email,
        amount: planData.amount, // Amount in kobo
        plan: planData.paystack_plan_code,
        callback_url: `${req.headers.get("origin")}/payment-success?type=subscription`,
        metadata: {
          user_id: user.id,
          plan_name: plan_name,
          billing_cycle: billing_cycle,
          subscription_type: "new"
        }
      }),
    });

    const subscriptionData: PaystackResponse = await subscriptionResponse.json();
    
    if (!subscriptionData.status) {
      logStep("Subscription initialization failed", subscriptionData);
      throw new Error(subscriptionData.message || "Failed to initialize subscription");
    }

    logStep("Subscription initialized", subscriptionData.data);

    return new Response(JSON.stringify({
      success: true,
      payment_url: subscriptionData.data.authorization_url,
      reference: subscriptionData.data.reference,
      access_code: subscriptionData.data.access_code
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    logStep("Error occurred", error.message);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});