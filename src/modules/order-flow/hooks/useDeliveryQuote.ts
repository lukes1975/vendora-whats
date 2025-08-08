import { useEffect, useMemo, useState } from "react";

export type Coordinates = { lat: number; lng: number };

export type DeliveryQuote = {
  distanceKm: number;
  etaMinutes: number;
  baseCost: number; // kobo
  serviceFee: number; // kobo
  surgeMultiplier: number;
  total: number; // kobo
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function pseudoDistanceFromAddress(address: string): number {
  // Deterministic mock distance 1–15km based on address text
  let hash = 0;
  for (let i = 0; i < address.length; i++) hash = (hash * 31 + address.charCodeAt(i)) >>> 0;
  const km = (hash % 1500) / 100 + 1; // 1–16
  return clamp(Math.round(km * 10) / 10, 1, 15);
}

export function useDeliveryQuote(params: { address: string; vendorLocation?: Coordinates | null }) {
  const { address } = params;
  const [quote, setQuote] = useState<DeliveryQuote | null>(null);

  useEffect(() => {
    if (!address || address.trim().length < 5) {
      setQuote(null);
      return;
    }
    const distanceKm = pseudoDistanceFromAddress(address);
    const surgeMultiplier = 1; // can be dynamic later
    const basePer3Km = 1000_00; // ₦1,000 per 3km, in kobo
    const baseCost = Math.ceil(distanceKm / 3) * basePer3Km;
    const serviceFee = 150_00; // ₦150
    const etaMinutes = clamp(Math.round(distanceKm * 6 + 8), 10, 90);
    const total = Math.round((baseCost + serviceFee) * surgeMultiplier);
    setQuote({ distanceKm, etaMinutes, baseCost, serviceFee, surgeMultiplier, total });
  }, [address]);

  const breakdown = useMemo(() => quote, [quote]);

  return { quote: breakdown };
}
