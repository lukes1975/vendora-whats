
-- Create user_events table to track all critical user actions
CREATE TABLE public.user_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add index for faster queries
CREATE INDEX idx_user_events_user_id ON public.user_events(user_id);
CREATE INDEX idx_user_events_type ON public.user_events(event_type);
CREATE INDEX idx_user_events_created_at ON public.user_events(created_at);

-- Enable RLS
ALTER TABLE public.user_events ENABLE ROW LEVEL SECURITY;

-- Users can view their own events
CREATE POLICY "Users can view their own events" 
  ON public.user_events 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- System can insert events for users
CREATE POLICY "System can insert user events" 
  ON public.user_events 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create user_metrics table for aggregated retention data
CREATE TABLE public.user_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  signup_date DATE NOT NULL,
  store_created_at TIMESTAMP WITH TIME ZONE,
  first_product_added_at TIMESTAMP WITH TIME ZONE,
  first_sale_at TIMESTAMP WITH TIME ZONE,
  first_share_at TIMESTAMP WITH TIME ZONE,
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  total_orders INTEGER DEFAULT 0,
  total_products INTEGER DEFAULT 0,
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add unique constraint and indexes
ALTER TABLE public.user_metrics ADD CONSTRAINT unique_user_metrics UNIQUE (user_id);
CREATE INDEX idx_user_metrics_user_id ON public.user_metrics(user_id);
CREATE INDEX idx_user_metrics_referral_code ON public.user_metrics(referral_code);

-- Enable RLS
ALTER TABLE public.user_metrics ENABLE ROW LEVEL SECURITY;

-- Users can view and update their own metrics
CREATE POLICY "Users can manage their own metrics" 
  ON public.user_metrics 
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to generate unique referral codes
CREATE OR REPLACE FUNCTION generate_referral_code(user_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    base_code TEXT;
    final_code TEXT;
    counter INTEGER := 0;
BEGIN
    -- Create base code from email (first part before @)
    base_code := UPPER(LEFT(SPLIT_PART(user_email, '@', 1), 6));
    final_code := base_code;
    
    -- Check if code exists and add numbers if needed
    WHILE EXISTS (SELECT 1 FROM user_metrics WHERE referral_code = final_code) LOOP
        counter := counter + 1;
        final_code := base_code || counter::TEXT;
    END LOOP;
    
    RETURN final_code;
END;
$$;

-- Function to initialize user metrics on signup
CREATE OR REPLACE FUNCTION initialize_user_metrics()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.user_metrics (
        user_id, 
        signup_date, 
        referral_code
    ) VALUES (
        NEW.id,
        CURRENT_DATE,
        generate_referral_code(NEW.email)
    );
    RETURN NEW;
END;
$$;

-- Trigger to auto-create metrics for new users
CREATE TRIGGER on_user_signup_create_metrics
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION initialize_user_metrics();
