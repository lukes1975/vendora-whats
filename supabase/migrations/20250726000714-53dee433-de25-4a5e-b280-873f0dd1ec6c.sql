-- Add subdomain field to profiles table for user store URLs
ALTER TABLE public.profiles 
ADD COLUMN subdomain text UNIQUE;

-- Add index for subdomain lookups
CREATE INDEX idx_profiles_subdomain ON public.profiles(subdomain);

-- Create function to validate subdomain format
CREATE OR REPLACE FUNCTION validate_subdomain(subdomain_input text)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if subdomain is valid (alphanumeric, hyphens, 3-50 chars)
  RETURN subdomain_input ~ '^[a-z0-9]([a-z0-9-]*[a-z0-9])?$' 
    AND length(subdomain_input) >= 3 
    AND length(subdomain_input) <= 50
    AND subdomain_input NOT IN ('www', 'api', 'admin', 'app', 'mail', 'ftp', 'support', 'help', 'blog');
END;
$$;

-- Create trigger to validate subdomain on insert/update
CREATE OR REPLACE FUNCTION check_subdomain_validity()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.subdomain IS NOT NULL AND NOT validate_subdomain(NEW.subdomain) THEN
    RAISE EXCEPTION 'Invalid subdomain format or reserved name';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_subdomain_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION check_subdomain_validity();

-- Create function for automated email reminders (cron job usage)
CREATE OR REPLACE FUNCTION send_email_reminders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
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