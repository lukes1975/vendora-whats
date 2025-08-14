import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NearestAssignmentResponse {
  assignment?: {
    id: string;
    order_id: string;
    pickup_lat: number;
    pickup_lng: number;
    delivery_lat: number;
    delivery_lng: number;
    distance_km: number;
    estimated_duration_minutes: number;
    customer_name: string;
    customer_phone: string;
    total: number;
    store_name: string;
  };
  message?: string;
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
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

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    const deviceFingerprint = generateDeviceFingerprint(req);

    // Get rider's current location
    const { data: rider, error: riderError } = await supabase
      .from("rider_sessions")
      .select("id, current_lat, current_lng, is_available")
      .eq("device_fingerprint", deviceFingerprint)
      .eq("is_available", true)
      .maybeSingle();

    if (riderError) {
      console.error("Error fetching rider:", riderError);
      return new Response(JSON.stringify({ error: "Failed to fetch rider" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (!rider || !rider.current_lat || !rider.current_lng) {
      return new Response(JSON.stringify({ 
        message: "No active rider found or location not available" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Find available delivery assignments (orders that need delivery)
    const { data: availableOrders, error: ordersError } = await supabase
      .from("orders_v2")
      .select(`
        id, 
        customer_name, 
        customer_phone, 
        customer_lat, 
        customer_lng, 
        total,
        store_id,
        stores!inner(name, vendor_id, store_settings!inner(base_location_lat, base_location_lng))
      `)
      .eq("status", "paid")
      .not("customer_lat", "is", null)
      .not("customer_lng", "is", null);

    if (ordersError) {
      console.error("Error fetching orders:", ordersError);
      return new Response(JSON.stringify({ error: "Failed to fetch orders" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (!availableOrders || availableOrders.length === 0) {
      return new Response(JSON.stringify({ 
        message: "No delivery assignments available" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Find nearest order based on pickup location
    let nearestOrder = null;
    let minDistance = Infinity;

    for (const order of availableOrders) {
      const store = (order as any).stores;
      const storeSettings = store?.store_settings?.[0];
      
      if (storeSettings?.base_location_lat && storeSettings?.base_location_lng) {
        const distance = calculateDistance(
          rider.current_lat,
          rider.current_lng,
          storeSettings.base_location_lat,
          storeSettings.base_location_lng
        );
        
        if (distance < minDistance) {
          minDistance = distance;
          nearestOrder = {
            order,
            pickupLat: storeSettings.base_location_lat,
            pickupLng: storeSettings.base_location_lng,
            storeName: store.name,
            distance
          };
        }
      }
    }

    if (!nearestOrder) {
      return new Response(JSON.stringify({ 
        message: "No orders with valid pickup locations found" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Calculate delivery distance and estimated time
    const deliveryDistance = calculateDistance(
      nearestOrder.pickupLat,
      nearestOrder.pickupLng,
      nearestOrder.order.customer_lat,
      nearestOrder.order.customer_lng
    );

    const totalDistance = minDistance + deliveryDistance;
    const estimatedDuration = Math.ceil(totalDistance * 3); // ~3 minutes per km

    // Create or update delivery assignment
    const { data: assignment, error: assignmentError } = await supabase
      .from("delivery_assignments")
      .upsert({
        order_id: nearestOrder.order.id,
        rider_session_id: rider.id,
        pickup_lat: nearestOrder.pickupLat,
        pickup_lng: nearestOrder.pickupLng,
        delivery_lat: nearestOrder.order.customer_lat,
        delivery_lng: nearestOrder.order.customer_lng,
        distance_km: totalDistance,
        estimated_duration_minutes: estimatedDuration,
        status: "offered",
        offered_at: new Date().toISOString()
      }, { onConflict: "order_id" })
      .select()
      .single();

    if (assignmentError) {
      console.error("Error creating assignment:", assignmentError);
      return new Response(JSON.stringify({ error: "Failed to create assignment" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const response: NearestAssignmentResponse = {
      assignment: {
        id: assignment.id,
        order_id: nearestOrder.order.id,
        pickup_lat: nearestOrder.pickupLat,
        pickup_lng: nearestOrder.pickupLng,
        delivery_lat: nearestOrder.order.customer_lat,
        delivery_lng: nearestOrder.order.customer_lng,
        distance_km: totalDistance,
        estimated_duration_minutes: estimatedDuration,
        customer_name: nearestOrder.order.customer_name,
        customer_phone: nearestOrder.order.customer_phone,
        total: nearestOrder.order.total,
        store_name: nearestOrder.storeName
      }
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("rider-nearest-assignment error:", err);
    return new Response(
      JSON.stringify({ error: "ServerError", message: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});