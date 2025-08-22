import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SubaccountRequest {
  business_name: string;
  settlement_bank: string;
  account_number: string;
  percentage_charge: number; // e.g., 0.5 for 0.5%
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-SUBACCOUNT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Subaccount creation function started");

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
    logStep("User authenticated", { userId: user.id, email: user.email });

    const requestData: SubaccountRequest = await req.json();
    logStep("Subaccount request received", { 
      business_name: requestData.business_name,
      account_number: requestData.account_number.slice(-4) // Only log last 4 digits
    });

    // Validate request data
    if (!requestData.business_name || !requestData.settlement_bank || !requestData.account_number) {
      throw new Error("Missing required fields: business_name, settlement_bank, and account_number are required");
    }

    // Prepare Paystack subaccount payload
    const paystackPayload = {
      business_name: requestData.business_name,
      settlement_bank: requestData.settlement_bank,
      account_number: requestData.account_number,
      percentage_charge: requestData.percentage_charge || 0.5, // Default 0.5%
      description: `Vendora subaccount for ${requestData.business_name}`,
      primary_contact_email: user.email,
      primary_contact_name: requestData.business_name,
      primary_contact_phone: null,
      metadata: {
        vendora_user_id: user.id,
        created_by: "vendora_platform"
      }
    };

    logStep("Creating Paystack subaccount", { business_name: requestData.business_name });

    // Create Paystack subaccount
    const paystackResponse = await fetch("https://api.paystack.co/subaccount", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${paystackKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paystackPayload),
    });

    const paystackResult = await paystackResponse.json();
    logStep("Paystack subaccount response received", { 
      status: paystackResponse.status, 
      success: paystackResult.status 
    });

    if (!paystackResponse.ok || !paystackResult.status) {
      throw new Error(paystackResult.message || "Failed to create subaccount");
    }

    const subaccountCode = paystackResult.data.subaccount_code;
    logStep("Subaccount created successfully", { subaccount_code: subaccountCode });

    // Update bank account record with subaccount code
    const { error: updateError } = await supabaseService
      .from("bank_accounts")
      .update({
        subaccount_code: subaccountCode,
        subaccount_status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.error("Failed to update bank account with subaccount code:", updateError);
      throw new Error("Subaccount created but failed to save to database");
    }

    logStep("Bank account updated with subaccount code");

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        subaccount_code: subaccountCode,
        message: "Subaccount created successfully"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-paystack-subaccount", { message: errorMessage });
    
    // Provide more user-friendly error messages
    let userMessage = errorMessage;
    if (errorMessage.includes("PAYSTACK_SECRET_KEY")) {
      userMessage = "Payment system configuration error. Please contact support.";
    } else if (errorMessage.includes("Authentication error")) {
      userMessage = "Authentication failed. Please try again.";
    } else if (errorMessage.includes("Missing required fields")) {
      userMessage = errorMessage; // Keep the original message for validation errors
    } else if (errorMessage.includes("Failed to create subaccount")) {
      userMessage = "Failed to create payment account. Please check your bank details and try again.";
    }
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: userMessage,
        details: errorMessage // Include original error for debugging
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});