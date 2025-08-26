import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AssignDeliveryRequest {
  order_id: string;
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ASSIGN-DELIVERY] ${step}${detailsStr}`);
};

// Calculate distance using Haversine formula (fallback)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
};

// Calculate delivery fee: ₦1,000 per 3km (ceiling)
const calculateDeliveryFee = (distanceKm: number): number => {
  return Math.ceil(distanceKm / 3) * 1000 * 100; // Convert to kobo
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Delivery assignment started");

    // Create service role client for database operations
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { order_id }: AssignDeliveryRequest = await req.json();
    if (!order_id) {
      throw new Error("Order ID is required");
    }

    logStep("Processing order", { order_id });

    // Get order details with store settings
    const { data: orderData, error: orderError } = await supabaseService
      .from("orders_v2")
      .select(`
        *,
        stores!inner(
          id,
          vendor_id,
          name
        ),
        store_settings(
          base_location_lat,
          base_location_lng,
          base_location_address
        )
      `)
      .eq("id", order_id)
      .eq("status", "paid")
      .maybeSingle();

    if (orderError || !orderData) {
      throw new Error("Paid order not found");
    }

    if (!orderData.customer_lat || !orderData.customer_lng) {
      throw new Error("Customer location not available");
    }

    const storeSettings = orderData.store_settings?.[0];
    if (!storeSettings?.base_location_lat || !storeSettings?.base_location_lng) {
      throw new Error("Store pickup location not configured");
    }

    logStep("Order and store data retrieved", {
      orderId: order_id,
      storeName: orderData.stores.name,
      hasLocation: !!(orderData.customer_lat && orderData.customer_lng)
    });

    // Check if delivery assignment already exists
    const { data: existingAssignment } = await supabaseService
      .from("delivery_assignments")
      .select("id, status")
      .eq("order_id", order_id)
      .maybeSingle();

    if (existingAssignment) {
      logStep("Delivery assignment already exists", { 
        assignmentId: existingAssignment.id, 
        status: existingAssignment.status 
      });
      return new Response(
        JSON.stringify({
          success: true,
          assignment_id: existingAssignment.id,
          status: existingAssignment.status,
          message: "Delivery assignment already exists"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Calculate distance and delivery fee
    const distance = calculateDistance(
      storeSettings.base_location_lat,
      storeSettings.base_location_lng,
      orderData.customer_lat,
      orderData.customer_lng
    );

    const deliveryFeeKobo = calculateDeliveryFee(distance);
    const estimatedDurationMinutes = Math.max(15, Math.round(distance * 3)); // 3 minutes per km, minimum 15 minutes

    logStep("Distance and fee calculated", {
      distance: distance.toFixed(2),
      deliveryFeeKobo,
      estimatedDurationMinutes
    });

    // Find available riders near the pickup location
    const { data: availableRiders, error: ridersError } = await supabaseService
      .from("rider_sessions")
      .select("*")
      .eq("is_available", true)
      .gt("last_seen_at", new Date(Date.now() - 2 * 60 * 1000).toISOString()) // Active in last 2 minutes
      .not("current_lat", "is", null)
      .not("current_lng", "is", null);

    if (ridersError) {
      logStep("Error fetching riders", ridersError);
    }

    let selectedRider = null;
    if (availableRiders && availableRiders.length > 0) {
      // Calculate distances to all riders and select the nearest
      const ridersWithDistance = availableRiders.map(rider => ({
        ...rider,
        distance: calculateDistance(
          storeSettings.base_location_lat,
          storeSettings.base_location_lng,
          rider.current_lat,
          rider.current_lng
        )
      })).sort((a, b) => a.distance - b.distance);

      selectedRider = ridersWithDistance[0];
      logStep("Selected nearest rider", {
        riderId: selectedRider.id,
        riderName: selectedRider.rider_name,
        distanceToPickup: selectedRider.distance.toFixed(2)
      });
    } else {
      logStep("No available riders found");
    }

    // Create delivery assignment
    const { data: assignmentData, error: assignmentError } = await supabaseService
      .from("delivery_assignments")
      .insert({
        order_id,
        rider_session_id: selectedRider?.id,
        vendor_id: orderData.vendor_id,
        pickup_lat: storeSettings.base_location_lat,
        pickup_lng: storeSettings.base_location_lng,
        pickup_address: storeSettings.base_location_address || "Store location",
        delivery_lat: orderData.customer_lat,
        delivery_lng: orderData.customer_lng,
        delivery_address: `${orderData.customer_name} - ${orderData.customer_address?.address || 'Customer location'}`,
        distance_km: distance,
        delivery_fee_kobo: deliveryFeeKobo,
        estimated_duration_minutes: estimatedDurationMinutes,
        status: selectedRider ? "offered" : "queued"
      })
      .select()
      .single();

    if (assignmentError) {
      throw new Error(`Failed to create delivery assignment: ${assignmentError.message}`);
    }

    logStep("Delivery assignment created", {
      assignmentId: assignmentData.id,
      status: assignmentData.status,
      riderId: selectedRider?.id
    });

    // If rider assigned, mark them as busy and notify (placeholder for notification system)
    if (selectedRider) {
      const { error: riderUpdateError } = await supabaseService
        .from("rider_sessions")
        .update({ is_available: false })
        .eq("id", selectedRider.id);

      if (riderUpdateError) {
        logStep("Failed to update rider availability", riderUpdateError);
      }

      // TODO: Send push notification to rider
      logStep("Rider notification should be sent", {
        riderId: selectedRider.id,
        riderName: selectedRider.rider_name,
        phone: selectedRider.phone
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        assignment_id: assignmentData.id,
        status: assignmentData.status,
        rider_assigned: !!selectedRider,
        rider_id: selectedRider?.id,
        distance_km: distance,
        delivery_fee_kobo: deliveryFeeKobo,
        estimated_duration_minutes: estimatedDurationMinutes
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in assign-delivery", { message: errorMessage });
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