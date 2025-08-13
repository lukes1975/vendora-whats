-- Phase 2: Zero-login by IP - customer_sessions table
-- Create table to persist pseudo-anonymous sessions keyed by salted hashes of IP and User-Agent
CREATE TABLE IF NOT EXISTS public.customer_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash TEXT NOT NULL,
  user_agent_hash TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  address TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT customer_sessions_unique_hash UNIQUE (ip_hash, user_agent_hash)
);

-- Enable Row Level Security; no public policies on purpose (edge functions will use service role)
ALTER TABLE public.customer_sessions ENABLE ROW LEVEL SECURITY;

-- Updated_at trigger
DROP TRIGGER IF EXISTS update_customer_sessions_updated_at ON public.customer_sessions;
CREATE TRIGGER update_customer_sessions_updated_at
BEFORE UPDATE ON public.customer_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Helpful index for recent lookups
CREATE INDEX IF NOT EXISTS idx_customer_sessions_last_seen ON public.customer_sessions (last_seen_at DESC);
