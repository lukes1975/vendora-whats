
-- Update the handle_new_user function to also send welcome email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
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
  
  -- Send welcome email asynchronously
  PERFORM
    net.http_post(
      url := 'https://ncetgnojwfrnsxpytcia.supabase.co/functions/v1/send-welcome-email',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key', true) || '"}',
      body := json_build_object(
        'email', NEW.email,
        'fullName', full_name_value
      )::text
    );
  
  RETURN NEW;
END;
$$;
