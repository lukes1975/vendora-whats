import React, { useEffect } from "react";
import { useGuestSession } from "@/hooks/useGuestSession";

const GuestSessionInitializer = () => {
  const { updateSessionDetails } = useGuestSession();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          updateSessionDetails({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          // ignore errors silently
        },
        { enableHighAccuracy: false, maximumAge: 60_000, timeout: 5_000 }
      );
    }
  }, [updateSessionDetails]);

  return null;
};

export default GuestSessionInitializer;
