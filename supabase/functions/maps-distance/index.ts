import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LatLng { lat: number; lng: number }

interface RequestBody {
  origin?: LatLng;
  destination?: LatLng;
  originAddress?: string;
  destinationAddress?: string;
  mode?: "driving" | "walking" | "bicycling" | "transit";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Missing GOOGLE_MAPS_API_KEY" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = (await req.json()) as RequestBody;

    const originParam = body.origin
      ? `${body.origin.lat},${body.origin.lng}`
      : (body.originAddress ?? "");
    const destParam = body.destination
      ? `${body.destination.lat},${body.destination.lng}`
      : (body.destinationAddress ?? "");

    if (!originParam || !destParam) {
      return new Response(JSON.stringify({ error: "origin/destination required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const mode = body.mode ?? "driving";

    const url = new URL("https://maps.googleapis.com/maps/api/distancematrix/json");
    url.searchParams.set("origins", originParam);
    url.searchParams.set("destinations", destParam);
    url.searchParams.set("mode", mode);
    url.searchParams.set("key", apiKey);

    const resp = await fetch(url.toString());
    const data = await resp.json();

    const status = data?.status;
    if (status !== "OK") {
      console.error("Distance Matrix API error", data);
      return new Response(JSON.stringify({ error: "DistanceMatrixError", details: data }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const element = data.rows?.[0]?.elements?.[0];
    if (!element || element.status !== "OK") {
      return new Response(JSON.stringify({ error: "NoRoute", details: element?.status }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const distanceMeters = element.distance?.value ?? 0;
    const durationSeconds = element.duration?.value ?? 0;

    const result = {
      distanceKm: Math.round((distanceMeters / 1000) * 10) / 10,
      etaMinutes: Math.max(1, Math.round(durationSeconds / 60)),
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("maps-distance error", err);
    return new Response(JSON.stringify({ error: "ServerError", message: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
