import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UpdateStatusRequest {
  assignment_id: string;
  status: "accepted" | "picked_up" | "en_route" | "delivered" | "cancelled";
  lat?: number;
  lng?: number;
}

function generateDeviceFingerprint(req: Request): string {
  const userAgent = req.headers.get("user-agent") || "unknown";
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
            req.headers.get("x-real-ip") || 
            req.headers.get("cf-connecting-ip") || 
            "0.0.0.0";
  
  return btoa(`${ip}:${userAgent}`).slice(0, 32);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    const deviceFingerprint = generateDeviceFingerprint(req);
    const body: UpdateStatusRequest = await req.json();

    if (!body.assignment_id || !body.status) {
      return new Response(JSON.stringify({ error: "assignment_id and status are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Verify rider owns this assignment
    const { data: assignment, error: assignmentError } = await supabase
      .from("delivery_assignments")
      .select(`
        id, 
        order_id, 
        status,
        rider_session_id,
        rider_sessions!inner(device_fingerprint)
      `)
      .eq("id", body.assignment_id)
      .single();

    if (assignmentError) {
      console.error("Error fetching assignment:", assignmentError);
      return new Response(JSON.stringify({ error: "Assignment not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const riderSession = (assignment as any).rider_sessions;
    if (riderSession.device_fingerprint !== deviceFingerprint) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Validate status transition
    const validTransitions: Record<string, string[]> = {
      "offered": ["accepted", "cancelled"],
      "accepted": ["picked_up", "cancelled"],
      "picked_up": ["en_route", "cancelled"],
      "en_route": ["delivered", "cancelled"],
      "delivered": [],
      "cancelled": []
    };

    if (!validTransitions[assignment.status]?.includes(body.status)) {
      return new Response(JSON.stringify({ 
        error: `Invalid status transition from ${assignment.status} to ${body.status}` 
      }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Update assignment status
    const updates: any = {
      status: body.status,
      updated_at: new Date().toISOString()
    };

    if (body.status === "accepted") {
      updates.accepted_at = new Date().toISOString();
    } else if (body.status === "delivered") {
      updates.completed_at = new Date().toISOString();
    }

    const { data: updatedAssignment, error: updateError } = await supabase
      .from("delivery_assignments")
      .update(updates)
      .eq("id", body.assignment_id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating assignment:", updateError);
      return new Response(JSON.stringify({ error: "Failed to update assignment" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Update order status if delivered
    if (body.status === "delivered") {
      await supabase
        .from("orders_v2")
        .update({ status: "delivered" })
        .eq("id", assignment.order_id);
    }

    // Update rider location if provided
    if (body.lat && body.lng) {
      await supabase
        .from("rider_sessions")
        .update({
          current_lat: body.lat,
          current_lng: body.lng,
          last_seen_at: new Date().toISOString()
        })
        .eq("device_fingerprint", deviceFingerprint);
    }

    return new Response(JSON.stringify({ 
      assignment: updatedAssignment,
      message: `Status updated to ${body.status}` 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("rider-update-status error:", err);
    return new Response(
      JSON.stringify({ error: "ServerError", message: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});