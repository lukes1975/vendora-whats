import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AuthAttemptRequest {
  email: string;
  success: boolean;
  userAgent?: string;
}

const logStep = (step: string, data?: any) => {
  console.log(`[AUTH_RATE_LIMIT] ${step}:`, data);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { email, success, userAgent }: AuthAttemptRequest = await req.json();
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    
    logStep('Recording auth attempt', { email, success, clientIp });
    
    // Record the login attempt
    const { error: insertError } = await supabase
      .from('login_attempts')
      .insert({
        email,
        ip_address: clientIp,
        success,
        user_agent: userAgent
      });
    
    if (insertError) {
      logStep('Error recording attempt', insertError);
      throw insertError;
    }
    
    // Check if rate limit is exceeded (only for failed attempts)
    if (!success) {
      const { data: canProceed, error: rateLimitError } = await supabase
        .rpc('check_rate_limit', {
          user_email: email,
          client_ip: clientIp
        });
      
      if (rateLimitError) {
        logStep('Error checking rate limit', rateLimitError);
        throw rateLimitError;
      }
      
      logStep('Rate limit check result', { canProceed });
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          rateLimited: !canProceed,
          message: !canProceed ? 'Too many failed attempts. Please try again later.' : 'Attempt recorded'
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }
    
    return new Response(
      JSON.stringify({ success: true, rateLimited: false, message: 'Success recorded' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
    
  } catch (error: any) {
    logStep('Error in auth rate limit function', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});