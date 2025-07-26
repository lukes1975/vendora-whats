-- Fix security warnings by setting search_path for functions
CREATE OR REPLACE FUNCTION validate_subdomain(subdomain_input text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Check if subdomain is valid (alphanumeric, hyphens, 3-50 chars)
  RETURN subdomain_input ~ '^[a-z0-9]([a-z0-9-]*[a-z0-9])?$' 
    AND length(subdomain_input) >= 3 
    AND length(subdomain_input) <= 50
    AND subdomain_input NOT IN ('www', 'api', 'admin', 'app', 'mail', 'ftp', 'support', 'help', 'blog');
END;
$$;

CREATE OR REPLACE FUNCTION check_subdomain_validity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.subdomain IS NOT NULL AND NOT public.validate_subdomain(NEW.subdomain) THEN
    RAISE EXCEPTION 'Invalid subdomain format or reserved name';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION send_email_reminders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Send reminder emails to users who haven't confirmed their email in 24 hours
  PERFORM net.http_post(
    url := 'https://ncetgnojwfrnsxpytcia.supabase.co/functions/v1/send-email-reminder',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key', true) || '"}',
    body := json_build_object(
      'type', 'unconfirmed_reminder'
    )::text
  ) 
  FROM auth.users 
  WHERE email_confirmed_at IS NULL 
    AND created_at < now() - interval '24 hours'
    AND created_at > now() - interval '7 days';
END;
$$;