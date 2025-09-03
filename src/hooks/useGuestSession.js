import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useGuestSession() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const ensureSession = useCallback(async (payload) => {
    try {
      const { data, error } = await supabase.functions.invoke("whoami", {
        body: payload ?? {},
      });
      if (error) throw error;
      if (data?.session_id) {
        localStorage.setItem("guest_session_id", data.session_id);
        setSession(data);
      }
    } catch (e) {
      console.error("useGuestSession: whoami failed", e);
      setError(e?.message || "Failed to establish session");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Load cached id immediately for optimistic availability
    const cached = localStorage.getItem("guest_session_id");
    if (cached && !session) {
      setSession((prev) => prev ?? { session_id: cached, ip_hash: "", user_agent_hash: "", last_seen_at: new Date().toISOString() });
    }
    ensureSession();
  }, [ensureSession]);

  const updateSessionDetails = useCallback(async (details) => {
    setLoading(true);
    await ensureSession(details);
  }, [ensureSession]);

  return { session, loading, error, updateSessionDetails };
}