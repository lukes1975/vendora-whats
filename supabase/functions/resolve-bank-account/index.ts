import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ResolveAccountRequest {
  account_number: string;
  bank_code: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const paystackKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!paystackKey) {
      throw new Error("PAYSTACK_SECRET_KEY is not configured");
    }

    const { account_number, bank_code }: ResolveAccountRequest = await req.json();

    if (!account_number || !bank_code) {
      throw new Error("Missing required fields: account_number and bank_code");
    }

    // Resolve account with Paystack
    const paystackResponse = await fetch(
      `https://api.paystack.co/bank/resolve?account_number=${account_number}&bank_code=${bank_code}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${paystackKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const paystackResult = await paystackResponse.json();

    if (!paystackResponse.ok || !paystackResult.status) {
      throw new Error(paystackResult.message || "Failed to resolve account");
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          account_number: paystackResult.data.account_number,
          account_name: paystackResult.data.account_name,
          bank_id: paystackResult.data.bank_id
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
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