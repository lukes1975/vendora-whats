import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ConnectionRequest {
  storeId: string;
  action: 'connect' | 'disconnect' | 'status';
  sessionData?: any;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Invalid authentication');
    }

    const { storeId, action, sessionData }: ConnectionRequest = await req.json();

    // Verify user owns the store
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id, vendor_id')
      .eq('id', storeId)
      .eq('vendor_id', user.id)
      .single();

    if (storeError || !store) {
      throw new Error('Store not found or access denied');
    }

    switch (action) {
      case 'connect':
        // Create or update WhatsApp session
        const { data: session, error: sessionError } = await supabase
          .from('wa_sessions')
          .upsert({
            store_id: storeId,
            session_json: sessionData,
            status: 'connected',
            last_seen: new Date().toISOString()
          }, {
            onConflict: 'store_id'
          })
          .select()
          .single();

        if (sessionError) throw sessionError;

        return new Response(JSON.stringify({ 
          success: true, 
          message: 'WhatsApp connected successfully',
          session
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'disconnect':
        // Update session status to disconnected
        const { error: disconnectError } = await supabase
          .from('wa_sessions')
          .update({ 
            status: 'disconnected',
            session_json: null,
            last_seen: new Date().toISOString()
          })
          .eq('store_id', storeId);

        if (disconnectError) throw disconnectError;

        return new Response(JSON.stringify({ 
          success: true, 
          message: 'WhatsApp disconnected successfully'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'status':
        // Get current connection status
        const { data: statusData, error: statusError } = await supabase
          .from('wa_sessions')
          .select('status, last_seen')
          .eq('store_id', storeId)
          .single();

        if (statusError && statusError.code !== 'PGRST116') {
          throw statusError;
        }

        const status = statusData ? statusData.status : 'disconnected';
        const lastSeen = statusData ? statusData.last_seen : null;

        return new Response(JSON.stringify({ 
          status,
          lastSeen,
          isConnected: status === 'connected'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      default:
        throw new Error('Invalid action');
    }

  } catch (error) {
    console.error('Error in whatsapp-connection function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

serve(handler);