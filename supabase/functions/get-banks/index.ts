import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const paystackKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!paystackKey) {
      throw new Error("PAYSTACK_SECRET_KEY is not configured");
    }

    // Get list of banks from Paystack
    const paystackResponse = await fetch("https://api.paystack.co/bank", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${paystackKey}`,
        "Content-Type": "application/json",
      },
    });

    const paystackResult = await paystackResponse.json();

    if (!paystackResponse.ok || !paystackResult.status) {
      throw new Error(paystackResult.message || "Failed to fetch banks");
    }

    // Filter to Nigerian banks and popular ones
    const banks = paystackResult.data
      .filter((bank: any) => bank.country === 'Nigeria')
      .sort((a: any, b: any) => a.name.localeCompare(b.name));

    return new Response(
      JSON.stringify({
        success: true,
        data: banks.map((bank: any) => ({
          name: bank.name,
          code: bank.code,
          slug: bank.slug
        }))
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