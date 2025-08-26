import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface StatusUpdateRequest {
  assignment_id: string;
  status: "accepted" | "picked_up" | "en_route" | "delivered" | "cancelled";
  rider_lat?: number;
  rider_lng?: number;
  proof_of_delivery_url?: string;
  delivery_notes?: string;
  customer_rating?: number;
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[DELIVERY-STATUS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Delivery status update started");

    // Create service role client for database operations
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { 
      assignment_id, 
      status,
      rider_lat,
      rider_lng,
      proof_of_delivery_url,
      delivery_notes,
      customer_rating
    }: StatusUpdateRequest = await req.json();

    if (!assignment_id || !status) {
      throw new Error("Assignment ID and status are required");
    }

    logStep("Processing status update", { assignment_id, status });

    // Get current assignment details
    const { data: assignmentData, error: assignmentError } = await supabaseService
      .from("delivery_assignments")
      .select(`
        *,
        orders_v2!inner(
          id,
          vendor_id,
          customer_name,
          customer_phone
        ),
        rider_sessions!inner(
          id,
          rider_name,
          phone
        )
      `)
      .eq("id", assignment_id)
      .maybeSingle();

    if (assignmentError || !assignmentData) {
      throw new Error("Delivery assignment not found");
    }

    logStep("Assignment data retrieved", {
      currentStatus: assignmentData.status,
      newStatus: status,
      riderId: assignmentData.rider_session_id
    });

    // Validate status transition
    const validTransitions: Record<string, string[]> = {
      "offered": ["accepted", "cancelled"],
      "queued": ["offered", "cancelled"],
      "accepted": ["picked_up", "cancelled"],
      "picked_up": ["en_route", "cancelled"],
      "en_route": ["delivered", "cancelled"],
      "delivered": [], // Terminal state
      "cancelled": [] // Terminal state
    };

    const currentStatus = assignmentData.status;
    if (!validTransitions[currentStatus] || !validTransitions[currentStatus].includes(status)) {
      throw new Error(`Invalid status transition from ${currentStatus} to ${status}`);
    }

    // Prepare update data
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };

    // Set timestamps based on status
    switch (status) {
      case "accepted":
        updateData.accepted_at = new Date().toISOString();
        break;
      case "delivered":
        updateData.completed_at = new Date().toISOString();
        if (proof_of_delivery_url) updateData.proof_of_delivery_url = proof_of_delivery_url;
        if (delivery_notes) updateData.delivery_notes = delivery_notes;
        if (customer_rating) updateData.customer_rating = customer_rating;
        break;
    }

    // Update delivery assignment
    const { error: updateError } = await supabaseService
      .from("delivery_assignments")
      .update(updateData)
      .eq("id", assignment_id);

    if (updateError) {
      throw new Error(`Failed to update delivery assignment: ${updateError.message}`);
    }

    // Update rider location if provided
    if (rider_lat && rider_lng && assignmentData.rider_session_id) {
      const { error: locationError } = await supabaseService
        .from("rider_sessions")
        .update({
          current_lat: rider_lat,
          current_lng: rider_lng,
          last_seen_at: new Date().toISOString()
        })
        .eq("id", assignmentData.rider_session_id);

      if (locationError) {
        logStep("Failed to update rider location", locationError);
      }
    }

    // Update related order status based on delivery status
    let orderStatus = null;
    switch (status) {
      case "accepted":
        orderStatus = "preparing";
        break;
      case "picked_up":
        orderStatus = "dispatched";
        break;
      case "en_route":
        orderStatus = "in_transit";
        break;
      case "delivered":
        orderStatus = "delivered";
        break;
      case "cancelled":
        orderStatus = "delivery_cancelled";
        break;
    }

    if (orderStatus) {
      const { error: orderUpdateError } = await supabaseService
        .from("orders_v2")
        .update({
          status: orderStatus,
          updated_at: new Date().toISOString()
        })
        .eq("id", assignmentData.orders_v2.id);

      if (orderUpdateError) {
        logStep("Failed to update order status", orderUpdateError);
      }
    }

    // Make rider available again if delivery completed or cancelled
    if (["delivered", "cancelled"].includes(status) && assignmentData.rider_session_id) {
      const { error: riderAvailabilityError } = await supabaseService
        .from("rider_sessions")
        .update({
          is_available: true,
          last_seen_at: new Date().toISOString()
        })
        .eq("id", assignmentData.rider_session_id);

      if (riderAvailabilityError) {
        logStep("Failed to update rider availability", riderAvailabilityError);
      }
    }

    logStep("Delivery status updated successfully", {
      assignment_id,
      newStatus: status,
      orderStatus
    });

    // TODO: Send notifications to customer and vendor
    logStep("Notifications should be sent", {
      customerPhone: assignmentData.orders_v2.customer_phone,
      vendorId: assignmentData.orders_v2.vendor_id,
      status
    });

    return new Response(
      JSON.stringify({
        success: true,
        assignment_id,
        status,
        order_status: orderStatus,
        updated_at: updateData.updated_at
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in delivery-status-update", { message: errorMessage });
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