import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
  amount: number; // Amount in kobo (smallest currency unit)
  email: string;
  currency?: string;
  reference?: string;
  callback_url?: string;
  metadata?: {
    product_id: string;
    product_name: string;
    store_id: string;
    customer_name?: string;
    customer_phone?: string;
  };
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PAYSTACK-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Payment function started");

    const paystackKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!paystackKey) {
      throw new Error("PAYSTACK_SECRET_KEY is not configured");
    }
    logStep("Paystack key verified");

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

    const paymentData: PaymentRequest = await req.json();
    logStep("Payment request received", { amount: paymentData.amount, email: paymentData.email });

    // Validate payment data
    if (!paymentData.amount || paymentData.amount < 100) { // Minimum 1 NGN
      throw new Error("Invalid amount. Minimum payment is ₦1.00");
    }

    if (!paymentData.email) {
      throw new Error("Customer email is required");
    }

    // Generate unique reference if not provided
    const reference = paymentData.reference || `vendora_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Get vendor's subaccount for direct payments
    let subaccountCode = null;
    if (paymentData.metadata?.store_id) {
      logStep("Fetching vendor subaccount", { store_id: paymentData.metadata.store_id });
      
      const { data: storeData } = await supabaseService
        .from("stores")
        .select("vendor_id")
        .eq("id", paymentData.metadata.store_id)
        .single();

      if (storeData?.vendor_id) {
        const { data: bankData } = await supabaseService
          .from("bank_accounts")
          .select("subaccount_code, subaccount_status")
          .eq("user_id", storeData.vendor_id)
          .eq("is_active", true)
          .single();

        if (bankData?.subaccount_code && bankData.subaccount_status === 'active') {
          subaccountCode = bankData.subaccount_code;
          logStep("Using vendor subaccount", { subaccount_code: subaccountCode });
        } else {
          logStep("No active subaccount found for vendor", { vendor_id: storeData.vendor_id });
        }
      }
    }

    // Prepare Paystack payload with enhanced subaccount integration
    const paystackPayload = {
      amount: paymentData.amount,
      email: paymentData.email,
      currency: paymentData.currency || "NGN",
      reference: reference,
      callback_url: paymentData.callback_url || `${req.headers.get("origin")}/payment-success`,
      ...(subaccountCode && { 
        subaccount: subaccountCode,
        bearer: "subaccount", // Subaccount bears the transaction fee
        transaction_charge: 0 // Platform takes no additional commission
      }),
      metadata: {
        vendora_user_id: user.id,
        vendora_store_id: paymentData.metadata?.store_id,
        product_id: paymentData.metadata?.product_id,
        product_name: paymentData.metadata?.product_name,
        customer_name: paymentData.metadata?.customer_name,
        customer_phone: paymentData.metadata?.customer_phone,
        source: "vendora_storefront",
        uses_subaccount: subaccountCode ? "yes" : "no",
        split_type: subaccountCode ? "direct_settlement" : "platform_settlement"
      }
    };

    logStep("Initiating Paystack transaction", { reference, amount: paymentData.amount });

    // Initialize Paystack transaction
    const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${paystackKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paystackPayload),
    });

    const paystackResult = await paystackResponse.json();
    logStep("Paystack response received", { 
      status: paystackResponse.status, 
      success: paystackResult.status 
    });

    if (!paystackResponse.ok || !paystackResult.status) {
      throw new Error(paystackResult.message || "Failed to initialize payment");
    }

    // Create order record in database
    const orderData = {
      vendor_id: user.id,
      store_id: paymentData.metadata?.store_id,
      product_id: paymentData.metadata?.product_id,
      customer_name: paymentData.metadata?.customer_name || "Guest Customer",
      customer_email: paymentData.email,
      customer_phone: paymentData.metadata?.customer_phone,
      quantity: 1,
      unit_price: paymentData.amount / 100, // Convert from kobo to naira
      total_price: paymentData.amount / 100,
      status: "pending",
      order_notes: `Payment reference: ${reference}`,
      whatsapp_message: null
    };

    const { data: order, error: orderError } = await supabaseService
      .from("orders")
      .insert(orderData)
      .select()
      .single();

    if (orderError) {
      console.error("Failed to create order:", orderError);
      // Don't fail the payment for this, just log it
      logStep("Order creation failed", orderError);
    } else {
      logStep("Order created successfully", { orderId: order.id });
    }

    // Return payment URL to frontend
    return new Response(
      JSON.stringify({
        success: true,
        payment_url: paystackResult.data.authorization_url,
        reference: reference,
        access_code: paystackResult.data.access_code,
        order_id: order?.id
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in paystack-payment", { message: errorMessage });
    
    // Provide more user-friendly error messages
    let userMessage = errorMessage;
    if (errorMessage.includes("PAYSTACK_SECRET_KEY")) {
      userMessage = "Payment system configuration error. Please contact support.";
    } else if (errorMessage.includes("Authentication error")) {
      userMessage = "Authentication failed. Please try again.";
    } else if (errorMessage.includes("Invalid amount")) {
      userMessage = errorMessage; // Keep the original message for amount errors
    } else if (errorMessage.includes("Failed to initialize payment")) {
      userMessage = "Payment initialization failed. Please try again.";
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