-- Fix security issues in database functions by setting proper search_path

-- Update handle_new_user function with secure search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  full_name_value TEXT;
BEGIN
  -- Extract full name from metadata
  full_name_value := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '');
  
  -- Insert into profiles table
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    full_name_value
  );
  
  -- Only send onboarding email for confirmed users (email_confirmed_at is not null)
  IF NEW.email_confirmed_at IS NOT NULL THEN
    -- Send onboarding email asynchronously for confirmed new users
    PERFORM
      net.http_post(
        url := 'https://ncetgnojwfrnsxpytcia.supabase.co/functions/v1/send-onboarding-followup',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key', true) || '"}',
        body := json_build_object(
          'email', NEW.email,
          'fullName', full_name_value,
          'userId', NEW.id
        )::text
      );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Update log_security_event function with secure search_path
CREATE OR REPLACE FUNCTION public.log_security_event(event_type text, event_details jsonb DEFAULT NULL::jsonb, target_user_id uuid DEFAULT NULL::uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.security_audit_log (
    user_id,
    event_type,
    event_details,
    created_at
  ) VALUES (
    COALESCE(target_user_id, auth.uid()),
    event_type,
    event_details,
    now()
  );
END;
$function$;

-- Create login_attempts table for rate limiting
CREATE TABLE IF NOT EXISTS public.login_attempts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  ip_address inet,
  attempt_time timestamp with time zone NOT NULL DEFAULT now(),
  success boolean NOT NULL DEFAULT false,
  user_agent text
);

-- Enable RLS on login_attempts
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- Create policy for login_attempts (admins only)
CREATE POLICY "Admins can view login attempts" 
ON public.login_attempts 
FOR SELECT 
USING (get_current_user_role() = 'admin');

-- Create policy for inserting login attempts (system only)
CREATE POLICY "System can insert login attempts" 
ON public.login_attempts 
FOR INSERT 
WITH CHECK (true);

-- Create index for efficient rate limiting queries
CREATE INDEX IF NOT EXISTS idx_login_attempts_email_time ON public.login_attempts(email, attempt_time);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_time ON public.login_attempts(ip_address, attempt_time);

-- Create function to check rate limits
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  user_email text,
  client_ip inet,
  max_attempts integer DEFAULT 5,
  window_minutes integer DEFAULT 15
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  email_attempts integer;
  ip_attempts integer;
BEGIN
  -- Count failed attempts by email in the time window
  SELECT COUNT(*) INTO email_attempts
  FROM public.login_attempts
  WHERE email = user_email
    AND success = false
    AND attempt_time > now() - (window_minutes || ' minutes')::interval;
  
  -- Count failed attempts by IP in the time window
  SELECT COUNT(*) INTO ip_attempts
  FROM public.login_attempts
  WHERE ip_address = client_ip
    AND success = false
    AND attempt_time > now() - (window_minutes || ' minutes')::interval;
  
  -- Return false if either limit is exceeded
  RETURN (email_attempts < max_attempts AND ip_attempts < max_attempts);
END;
$function$;