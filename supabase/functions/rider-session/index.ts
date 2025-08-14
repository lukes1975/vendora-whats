import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RiderRegisterRequest {
  rider_name: string;
  phone: string;
  lat?: number;
  lng?: number;
}

interface RiderUpdateLocationRequest {
  lat: number;
  lng: number;
  is_available?: boolean;
}

function generateDeviceFingerprint(req: Request): string {
  const userAgent = req.headers.get("user-agent") || "unknown";
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
            req.headers.get("x-real-ip") || 
            req.headers.get("cf-connecting-ip") || 
            "0.0.0.0";
  
  // Simple fingerprint based on IP + User Agent
  return btoa(`${ip}:${userAgent}`).slice(0, 32);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    const deviceFingerprint = generateDeviceFingerprint(req);
    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "status";

    if (req.method === "GET" && action === "status") {
      // Get rider status
      const { data: rider, error } = await supabase
        .from("rider_sessions")
        .select("id, rider_name, phone, current_lat, current_lng, is_available, last_seen_at")
        .eq("device_fingerprint", deviceFingerprint)
        .maybeSingle();

      if (error) {
        console.error("Error fetching rider:", error);
        return new Response(JSON.stringify({ error: "Failed to fetch rider" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      return new Response(JSON.stringify({ rider }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (req.method === "POST") {
      if (action === "register") {
        const body: RiderRegisterRequest = await req.json();
        
        if (!body.rider_name || !body.phone) {
          return new Response(JSON.stringify({ error: "rider_name and phone are required" }), {
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }

        const { data: rider, error } = await supabase
          .from("rider_sessions")
          .upsert({
            rider_name: body.rider_name,
            phone: body.phone,
            current_lat: body.lat,
            current_lng: body.lng,
            device_fingerprint: deviceFingerprint,
            is_available: true,
            last_seen_at: new Date().toISOString(),
          }, { onConflict: "device_fingerprint" })
          .select()
          .single();

        if (error) {
          console.error("Error registering rider:", error);
          return new Response(JSON.stringify({ error: "Failed to register rider" }), {
            status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }

        return new Response(JSON.stringify({ rider }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      if (action === "update_location") {
        const body: RiderUpdateLocationRequest = await req.json();
        
        if (typeof body.lat !== "number" || typeof body.lng !== "number") {
          return new Response(JSON.stringify({ error: "lat and lng are required" }), {
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }

        const updates: any = {
          current_lat: body.lat,
          current_lng: body.lng,
          last_seen_at: new Date().toISOString(),
        };

        if (typeof body.is_available === "boolean") {
          updates.is_available = body.is_available;
        }

        const { data: rider, error } = await supabase
          .from("rider_sessions")
          .update(updates)
          .eq("device_fingerprint", deviceFingerprint)
          .select()
          .single();

        if (error) {
          console.error("Error updating rider location:", error);
          return new Response(JSON.stringify({ error: "Failed to update location" }), {
            status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }

        return new Response(JSON.stringify({ rider }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }

    return new Response(JSON.stringify({ error: "Invalid action or method" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("rider-session error:", err);
    return new Response(
      JSON.stringify({ error: "ServerError", message: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});