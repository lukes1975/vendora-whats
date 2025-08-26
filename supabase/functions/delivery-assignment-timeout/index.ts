import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ASSIGNMENT-TIMEOUT] ${step}${detailsStr}`);
};

// Calculate distance using Haversine formula
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Assignment timeout check started");

    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Find assignments that have been "offered" for more than 2 minutes without acceptance
    const timeoutThreshold = new Date(Date.now() - 2 * 60 * 1000).toISOString();
    
    const { data: timedOutAssignments, error: timeoutError } = await supabaseService
      .from("delivery_assignments")
      .select(`
        *,
        orders_v2!inner(
          vendor_id,
          customer_lat,
          customer_lng
        )
      `)
      .eq("status", "offered")
      .lt("offered_at", timeoutThreshold);

    if (timeoutError) {
      throw new Error(`Failed to find timed out assignments: ${timeoutError.message}`);
    }

    logStep("Found timed out assignments", { count: timedOutAssignments?.length || 0 });

    if (!timedOutAssignments || timedOutAssignments.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          processed: 0,
          message: "No timed out assignments found"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    const reassignmentResults = [];

    for (const assignment of timedOutAssignments) {
      try {
        logStep("Processing timed out assignment", { assignmentId: assignment.id });

        // Mark current rider as available again
        if (assignment.rider_session_id) {
          await supabaseService
            .from("rider_sessions")
            .update({ is_available: true })
            .eq("id", assignment.rider_session_id);
        }

        // Find next available rider (excluding the one who timed out)
        const { data: availableRiders, error: ridersError } = await supabaseService
          .from("rider_sessions")
          .select("*")
          .eq("is_available", true)
          .neq("id", assignment.rider_session_id || "")
          .gt("last_seen_at", new Date(Date.now() - 2 * 60 * 1000).toISOString())
          .not("current_lat", "is", null)
          .not("current_lng", "is", null);

        if (ridersError) {
          logStep("Error fetching riders for reassignment", ridersError);
          continue;
        }

        let newRider = null;
        if (availableRiders && availableRiders.length > 0) {
          // Find nearest rider to pickup location
          const ridersWithDistance = availableRiders.map(rider => ({
            ...rider,
            distance: calculateDistance(
              assignment.pickup_lat,
              assignment.pickup_lng,
              rider.current_lat,
              rider.current_lng
            )
          })).sort((a, b) => a.distance - b.distance);

          newRider = ridersWithDistance[0];
        }

        if (newRider) {
          // Reassign to new rider
          const { error: reassignError } = await supabaseService
            .from("delivery_assignments")
            .update({
              rider_session_id: newRider.id,
              status: "offered",
              offered_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq("id", assignment.id);

          if (reassignError) {
            logStep("Failed to reassign delivery", reassignError);
            continue;
          }

          // Mark new rider as busy
          await supabaseService
            .from("rider_sessions")
            .update({ is_available: false })
            .eq("id", newRider.id);

          reassignmentResults.push({
            assignmentId: assignment.id,
            orderId: assignment.order_id,
            previousRider: assignment.rider_session_id,
            newRider: newRider.id,
            newRiderName: newRider.rider_name,
            status: "reassigned"
          });

          logStep("Assignment successfully reassigned", {
            assignmentId: assignment.id,
            newRiderId: newRider.id,
            newRiderName: newRider.rider_name
          });

        } else {
          // No riders available, move back to queue
          const { error: queueError } = await supabaseService
            .from("delivery_assignments")
            .update({
              rider_session_id: null,
              status: "queued",
              updated_at: new Date().toISOString()
            })
            .eq("id", assignment.id);

          if (queueError) {
            logStep("Failed to requeue delivery", queueError);
            continue;
          }

          reassignmentResults.push({
            assignmentId: assignment.id,
            orderId: assignment.order_id,
            previousRider: assignment.rider_session_id,
            newRider: null,
            status: "requeued"
          });

          logStep("Assignment requeued - no available riders", {
            assignmentId: assignment.id
          });
        }

      } catch (assignmentError) {
        logStep("Error processing assignment", { 
          assignmentId: assignment.id, 
          error: assignmentError 
        });
        continue;
      }
    }

    logStep("Assignment timeout processing completed", {
      totalProcessed: reassignmentResults.length,
      reassigned: reassignmentResults.filter(r => r.status === "reassigned").length,
      requeued: reassignmentResults.filter(r => r.status === "requeued").length
    });

    return new Response(
      JSON.stringify({
        success: true,
        processed: reassignmentResults.length,
        results: reassignmentResults
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in assignment-timeout", { message: errorMessage });
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