// Placeholder for future Google Maps integration via Supabase Edge Function
// We'll later call: supabase.functions.invoke('maps-distance')
export type DistanceParams = {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
};

export async function getDistanceAndEta(_params: DistanceParams) {
  // TODO: Replace with real edge function call once GOOGLE_MAPS_API_KEY is configured
  // For now, return a mock structure for development
  return {
    distanceKm: 5.2,
    etaMinutes: 24,
  };
}
