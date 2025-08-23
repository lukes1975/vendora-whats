import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface RiderSession {
  id: string;
  rider_name: string;
  phone: string;
  current_lat?: number | null;
  current_lng?: number | null;
  is_available: boolean;
  last_seen_at: string;
}

export interface DeliveryAssignment {
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
}

export function useRiderSession() {
  const [rider, setRider] = useState<RiderSession | null>(null);
  const [assignment, setAssignment] = useState<DeliveryAssignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRiderStatus = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke("rider-session?action=status", {
        method: 'GET'
      });
      if (error) throw error;
      setRider(data?.rider || null);
    } catch (e: any) {
      console.error("Failed to fetch rider status:", e);
      setError(e?.message || "Failed to fetch rider status");
    }
  }, []);

  const registerRider = useCallback(async (name: string, phone: string, lat?: number, lng?: number) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("rider-session?action=register", {
        method: 'POST',
        body: { rider_name: name, phone, lat, lng },
      });
      if (error) throw error;
      setRider(data?.rider || null);
      setError(null);
    } catch (e: any) {
      console.error("Failed to register rider:", e);
      setError(e?.message || "Failed to register rider");
    } finally {
      setLoading(false);
    }
  }, []);

  const updateLocation = useCallback(async (lat: number, lng: number, isAvailable?: boolean) => {
    try {
      const { data, error } = await supabase.functions.invoke("rider-session?action=update_location", {
        method: 'POST',
        body: { lat, lng, is_available: isAvailable },
      });
      if (error) throw error;
      setRider(data?.rider || null);
    } catch (e: any) {
      console.error("Failed to update location:", e);
      setError(e?.message || "Failed to update location");
    }
  }, []);

  const fetchNearestAssignment = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke("rider-nearest-assignment");
      if (error) throw error;
      setAssignment(data?.assignment || null);
    } catch (e: any) {
      console.error("Failed to fetch assignment:", e);
      setError(e?.message || "Failed to fetch assignment");
    }
  }, []);

  const updateAssignmentStatus = useCallback(async (
    assignmentId: string, 
    status: "accepted" | "picked_up" | "en_route" | "delivered" | "cancelled",
    lat?: number,
    lng?: number
  ) => {
    try {
      const { data, error } = await supabase.functions.invoke("rider-update-status", {
        body: { assignment_id: assignmentId, status, lat, lng },
      });
      if (error) throw error;
      
      // Refresh assignment after status update
      if (status === "delivered" || status === "cancelled") {
        setAssignment(null);
        await fetchNearestAssignment(); // Look for next assignment
      }
      
      return data;
    } catch (e: any) {
      console.error("Failed to update assignment status:", e);
      setError(e?.message || "Failed to update assignment status");
      throw e;
    }
  }, [fetchNearestAssignment]);

  useEffect(() => {
    fetchRiderStatus().finally(() => setLoading(false));
  }, [fetchRiderStatus]);

  return {
    rider,
    assignment,
    loading,
    error,
    registerRider,
    updateLocation,
    fetchNearestAssignment,
    updateAssignmentStatus,
    refreshStatus: fetchRiderStatus,
  };
}