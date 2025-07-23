import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaystackResponse {
  status: boolean;
  message: string;
  data?: any;
}

const logStep = (step: string, data?: any) => {
  console.log(`[CANCEL-SUBSCRIPTION] ${step}:`, data || '');
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  logStep("Starting subscription cancellation");

  try {
    // Get Paystack secret key
    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!paystackSecretKey) {
      throw new Error("Paystack secret key not configured");
    }

    // Initialize Supabase clients
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

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

    // Get user profile with subscription details
    const { data: profileData, error: profileError } = await supabaseService
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profileData) {
      logStep("Profile not found", profileError);
      throw new Error("User profile not found");
    }

    if (!profileData.paystack_subscription_code) {
      throw new Error("No active subscription found");
    }

    logStep("Found subscription", profileData.paystack_subscription_code);

    // Disable subscription with Paystack
    const cancelResponse = await fetch("https://api.paystack.co/subscription/disable", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: profileData.paystack_subscription_code,
        token: profileData.paystack_subscription_code
      }),
    });

    const cancelData: PaystackResponse = await cancelResponse.json();
    
    if (!cancelData.status) {
      logStep("Subscription cancellation failed", cancelData);
      throw new Error(cancelData.message || "Failed to cancel subscription");
    }

    logStep("Subscription cancelled with Paystack");

    // Update user profile to inactive subscription
    const { error: updateError } = await supabaseService
      .from('profiles')
      .update({
        subscription_status: 'inactive',
        subscription_updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      logStep("Failed to update profile", updateError);
      throw new Error("Failed to update subscription status");
    }

    logStep("Subscription cancelled successfully");

    return new Response(JSON.stringify({
      success: true,
      message: "Subscription cancelled successfully"
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