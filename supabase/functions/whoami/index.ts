import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WhoAmIRequest {
  name?: string;
  phone?: string;
  address?: string;
  lat?: number;
  lng?: number;
}

interface WhoAmIResponse {
  session_id: string;
  ip_hash: string;
  user_agent_hash: string;
  last_seen_at: string;
  name?: string | null;
  phone?: string | null;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toHex(digest);
}

function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for") || "";
  const realIp = req.headers.get("x-real-ip") || "";
  const cfIp = req.headers.get("cf-connecting-ip") || "";
  const ip = (xff.split(",")[0] || realIp || cfIp || "0.0.0.0").trim();
  return ip;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const salt = Deno.env.get("SESSION_HASH_SALT");
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!salt) {
      return new Response(
        JSON.stringify({ error: "Missing SESSION_HASH_SALT" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    const uaRaw = req.headers.get("user-agent") || "unknown";
    const ip = getClientIp(req);

    const ip_hash = await sha256Hex(`${salt}|ip|${ip}`);
    const user_agent_hash = await sha256Hex(`${salt}|ua|${uaRaw}`);

    let body: WhoAmIRequest = {};
    try {
      if (req.method === "POST") {
        body = await req.json();
      }
    } catch (_) {
      body = {};
    }

    // Try to find existing session
    const { data: existing, error: findErr } = await supabase
      .from("customer_sessions")
      .select("id, last_seen_at, name, phone, address, lat, lng")
      .eq("ip_hash", ip_hash)
      .eq("user_agent_hash", user_agent_hash)
      .maybeSingle();

    if (findErr && findErr.code !== "PGRST116") {
      // Non-row-not-found error
      console.error("whoami find error", findErr);
    }

    // Prepare fields to update from body if provided
    const updates: Record<string, any> = { last_seen_at: new Date().toISOString() };
    if (typeof body.name === "string") updates.name = body.name;
    if (typeof body.phone === "string") updates.phone = body.phone;
    if (typeof body.address === "string") updates.address = body.address;
    if (typeof body.lat === "number") updates.lat = body.lat;
    if (typeof body.lng === "number") updates.lng = body.lng;

    let sessionRow:
      | { id: string; last_seen_at: string; name: string | null; phone: string | null; address: string | null; lat: number | null; lng: number | null }
      | null = null;

    if (existing?.id) {
      const { data: updated, error: updateErr } = await supabase
        .from("customer_sessions")
        .update(updates)
        .eq("id", existing.id)
        .select("id, last_seen_at, name, phone, address, lat, lng")
        .single();

      if (updateErr) {
        console.error("whoami update error", updateErr);
        // Fall back to existing
        sessionRow = existing as any;
      } else {
        sessionRow = updated as any;
      }
    } else {
      const insertPayload = { ip_hash, user_agent_hash, ...updates };
      const { data: inserted, error: insertErr } = await supabase
        .from("customer_sessions")
        .insert(insertPayload)
        .select("id, last_seen_at, name, phone, address, lat, lng")
        .single();

      if (insertErr) {
        console.error("whoami insert error", insertErr);
        return new Response(
          JSON.stringify({ error: "SessionCreateFailed" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      sessionRow = inserted as any;
    }

    const resp: WhoAmIResponse = {
      session_id: sessionRow!.id,
      ip_hash,
      user_agent_hash,
      last_seen_at: sessionRow!.last_seen_at,
      name: sessionRow!.name,
      phone: sessionRow!.phone,
      address: sessionRow!.address,
      lat: sessionRow!.lat,
      lng: sessionRow!.lng,
    };

    return new Response(JSON.stringify(resp), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    console.error("whoami error", err);
    return new Response(
      JSON.stringify({ error: "ServerError", message: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
