-- Create wa_sessions table for WhatsApp session management
CREATE TABLE public.wa_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES public.stores(id),
  session_json jsonb,
  status text DEFAULT 'pending',
  last_seen timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.wa_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for service role only access
CREATE POLICY "Service role can manage wa_sessions"
ON public.wa_sessions
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Create indexes for performance
CREATE INDEX idx_wa_sessions_store_id ON public.wa_sessions(store_id);
CREATE INDEX idx_wa_sessions_status ON public.wa_sessions(status);
CREATE INDEX idx_wa_sessions_last_seen ON public.wa_sessions(last_seen);

-- Add updated_at trigger
CREATE TRIGGER update_wa_sessions_updated_at
    BEFORE UPDATE ON public.wa_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();