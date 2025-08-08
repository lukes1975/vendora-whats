import { useEffect, useState } from "react";

export type GeoIPData = {
  country: string | null;
  region: string | null;
  city: string | null;
  timezone: string | null;
  language: string;
  currency: string; // ISO 4217
};

export function useGeoIP() {
  const [data, setData] = useState<GeoIPData | null>(null);

  useEffect(() => {
    // Lightweight, privacy-friendly simulation with browser hints
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? null;
    const language = navigator.language || "en-US";
    const isNG = /(^|[-_])ng($|[-_])/i.test(language);

    setData({
      country: isNG ? "NG" : null,
      region: null,
      city: null,
      timezone: tz,
      language,
      currency: isNG ? "NGN" : "USD",
    });
  }, []);

  return data;
}
