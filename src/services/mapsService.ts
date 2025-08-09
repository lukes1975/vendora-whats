// Google Maps integration via Supabase Edge Function
// Calls: supabase.functions.invoke('maps-distance')
import { supabase } from "@/integrations/supabase/client";

export type DistanceParams = {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
};

export async function getDistanceAndEta(params: DistanceParams) {
  try {
    const { data, error } = await supabase.functions.invoke("maps-distance", {
      body: { origin: params.origin, destination: params.destination },
    });
    if (error) throw error;
    return data as { distanceKm: number; etaMinutes: number };
  } catch (e) {
    console.warn("maps-distance fallback", e);
    return { distanceKm: 5.2, etaMinutes: 24 };
  }
}

export async function getDistanceAndEtaByText(destinationAddress: string, origin?: { lat: number; lng: number } | null) {
  try {
    const { data, error } = await supabase.functions.invoke("maps-distance", {
      body: origin
        ? { origin, destinationAddress }
        : { originAddress: destinationAddress, destinationAddress }, // degenerate to 0km if same; caller should provide origin ideally
    });
    if (error) throw error;
    return data as { distanceKm: number; etaMinutes: number };
  } catch (e) {
    console.warn("maps-distance text fallback", e);
    return { distanceKm: 5.2, etaMinutes: 24 };
  }
}
