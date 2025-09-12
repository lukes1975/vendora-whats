-- Fix the check_rate_limit function to accept text instead of inet for IP addresses
-- This resolves the "structure of query does not match function result type" error

DROP FUNCTION IF EXISTS public.check_rate_limit(text, inet, integer, integer);

CREATE OR REPLACE FUNCTION public.check_rate_limit(user_email text, client_ip text, max_attempts integer DEFAULT 5, window_minutes integer DEFAULT 15)
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
  WHERE ip_address::text = client_ip
    AND success = false
    AND attempt_time > now() - (window_minutes || ' minutes')::interval;
  
  -- Return false if either limit is exceeded
  RETURN (email_attempts < max_attempts AND ip_attempts < max_attempts);
END;
$function$;