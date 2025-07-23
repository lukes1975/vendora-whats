-- Fix search path security issue for handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = ''
AS $$
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
  -- This happens after email confirmation, not on initial signup
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
$$;