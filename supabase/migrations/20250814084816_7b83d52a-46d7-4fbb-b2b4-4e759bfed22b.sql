-- Phase 3: Rider dashboard MVP - database enhancements
-- Add customer location to orders_v2 for mapping
ALTER TABLE public.orders_v2 
ADD COLUMN IF NOT EXISTS customer_lat DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS customer_lng DOUBLE PRECISION;

-- Add rider proximity tracking table
CREATE TABLE IF NOT EXISTS public.rider_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  current_lat DOUBLE PRECISION,
  current_lng DOUBLE PRECISION,
  is_available BOOLEAN NOT NULL DEFAULT true,
  device_fingerprint TEXT NOT NULL,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT rider_sessions_unique_device UNIQUE (device_fingerprint)
);

-- Enable RLS for rider_sessions (Edge function only access)
ALTER TABLE public.rider_sessions ENABLE ROW LEVEL SECURITY;

-- Only admins can read rider sessions directly
CREATE POLICY "Admins can view rider sessions"
ON public.rider_sessions
FOR SELECT
USING (public.get_current_user_role() = 'admin'::user_role);

-- Updated_at trigger for rider_sessions
DROP TRIGGER IF EXISTS update_rider_sessions_updated_at ON public.rider_sessions;
CREATE TRIGGER update_rider_sessions_updated_at
BEFORE UPDATE ON public.rider_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Index for proximity queries
CREATE INDEX IF NOT EXISTS idx_rider_sessions_location_available 
ON public.rider_sessions (is_available, current_lat, current_lng, last_seen_at DESC);

-- Add delivery assignments table for tracking offers/assignments
CREATE TABLE IF NOT EXISTS public.delivery_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders_v2(id) ON DELETE CASCADE,
  rider_session_id UUID REFERENCES public.rider_sessions(id) ON DELETE SET NULL,
  pickup_lat DOUBLE PRECISION NOT NULL,
  pickup_lng DOUBLE PRECISION NOT NULL,
  delivery_lat DOUBLE PRECISION NOT NULL,
  delivery_lng DOUBLE PRECISION NOT NULL,
  distance_km NUMERIC,
  estimated_duration_minutes INTEGER,
  status TEXT CHECK (status IN ('offered', 'accepted', 'picked_up', 'en_route', 'delivered', 'cancelled')) DEFAULT 'offered',
  offered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for delivery_assignments
ALTER TABLE public.delivery_assignments ENABLE ROW LEVEL SECURITY;

-- Only admins can read delivery assignments directly
CREATE POLICY "Admins can view delivery assignments"
ON public.delivery_assignments
FOR SELECT
USING (public.get_current_user_role() = 'admin'::user_role);

-- Updated_at trigger for delivery_assignments
DROP TRIGGER IF EXISTS update_delivery_assignments_updated_at ON public.delivery_assignments;
CREATE TRIGGER update_delivery_assignments_updated_at
BEFORE UPDATE ON public.delivery_assignments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Index for assignment queries
CREATE INDEX IF NOT EXISTS idx_delivery_assignments_status_offered 
ON public.delivery_assignments (status, offered_at DESC)
WHERE status = 'offered';