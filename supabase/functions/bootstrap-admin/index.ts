import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BootstrapRequest {
  email: string;
  bootstrap_key?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const bootstrapKey = Deno.env.get("ADMIN_BOOTSTRAP_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }

    // Initialize Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { email, bootstrap_key }: BootstrapRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Email is required" 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Check bootstrap key if provided in environment
    if (bootstrapKey && bootstrap_key !== bootstrapKey) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Invalid bootstrap key" 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 403,
        }
      );
    }

    // Call the bootstrap function
    const { data, error } = await supabase.rpc('bootstrap_admin_user', {
      user_email: email
    });

    if (error) {
      console.error("Bootstrap admin error:", error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: error.message 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Log successful bootstrap
    console.log(`Successfully bootstrapped admin user: ${email}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `User ${email} has been granted admin privileges`,
        data: data
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Bootstrap admin function error:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});