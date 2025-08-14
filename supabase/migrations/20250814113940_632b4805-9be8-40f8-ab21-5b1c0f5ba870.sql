-- Fix database function security paths to prevent function hijacking attacks
-- Update all existing functions to include proper security definer settings

CREATE OR REPLACE FUNCTION public.update_categories_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.initialize_user_metrics()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    INSERT INTO public.user_metrics (
        user_id, 
        signup_date, 
        referral_code
    ) VALUES (
        NEW.id,
        COALESCE(NEW.created_at::date, CURRENT_DATE),
        generate_referral_code(NEW.email)
    ) ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
 RETURNS user_role
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$function$;

CREATE OR REPLACE FUNCTION public.update_user_role(target_user_id uuid, new_role user_role)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Only admins can update roles
  IF public.get_current_user_role() != 'admin' THEN
    RAISE EXCEPTION 'Insufficient privileges to update user roles';
  END IF;
  
  -- Prevent users from removing the last admin
  IF new_role != 'admin' AND (
    SELECT COUNT(*) FROM public.profiles 
    WHERE role = 'admin' AND id != target_user_id
  ) = 0 THEN
    RAISE EXCEPTION 'Cannot remove the last admin user';
  END IF;
  
  UPDATE public.profiles 
  SET role = new_role, updated_at = now()
  WHERE id = target_user_id;
  
  RETURN TRUE;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_referral_code(user_email text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    base_code TEXT;
    final_code TEXT;
    counter INTEGER := 0;
BEGIN
    -- Create base code from email (first part before @)
    base_code := UPPER(LEFT(SPLIT_PART(user_email, '@', 1), 6));
    
    -- Remove any non-alphanumeric characters
    base_code := REGEXP_REPLACE(base_code, '[^A-Z0-9]', '', 'g');
    
    -- Ensure minimum length
    IF LENGTH(base_code) < 3 THEN
        base_code := base_code || 'USR';
    END IF;
    
    -- Try to find unique code
    final_code := base_code;
    WHILE EXISTS (SELECT 1 FROM public.user_metrics WHERE referral_code = final_code) LOOP
        counter := counter + 1;
        final_code := base_code || counter::TEXT;
    END LOOP;
    
    RETURN final_code;
EXCEPTION
    WHEN OTHERS THEN
        -- Fallback to a simple random code if anything fails
        RETURN 'USER' || EXTRACT(EPOCH FROM NOW())::INTEGER::TEXT;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_user_metrics()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    INSERT INTO public.user_metrics (
        user_id, 
        signup_date, 
        referral_code
    ) VALUES (
        NEW.id,
        COALESCE(NEW.created_at::date, CURRENT_DATE),
        generate_referral_code(COALESCE(NEW.email, NEW.id::text))
    ) ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but don't fail the user creation
        RAISE WARNING 'Failed to create user metrics for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$function$;

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

CREATE OR REPLACE FUNCTION public.check_rate_limit(user_email text, client_ip inet, max_attempts integer DEFAULT 5, window_minutes integer DEFAULT 15)
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

CREATE OR REPLACE FUNCTION public.update_setup_completion()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if all required tasks are completed
  WITH required_tasks AS (
    SELECT unnest(ARRAY[
      'add_first_product',
      'customize_storefront', 
      'set_store_link',
      'connect_whatsapp',
      'add_business_info',
      'choose_selling_method',
      'preview_store',
      'launch_store'
    ]) as task_id
  ),
  user_completed_tasks AS (
    SELECT task_id
    FROM user_setup_progress 
    WHERE user_id = NEW.user_id AND completed = true
  ),
  completion_status AS (
    SELECT 
      COUNT(required_tasks.task_id) as total_required,
      COUNT(user_completed_tasks.task_id) as completed_count
    FROM required_tasks
    LEFT JOIN user_completed_tasks ON required_tasks.task_id = user_completed_tasks.task_id
  )
  UPDATE profiles 
  SET 
    setup_completed = (SELECT completed_count >= total_required FROM completion_status),
    setup_completed_at = CASE 
      WHEN (SELECT completed_count >= total_required FROM completion_status) 
        AND setup_completed_at IS NULL 
      THEN now() 
      ELSE setup_completed_at 
    END,
    updated_at = now()
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_subscription_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.subscription_updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_subdomain(subdomain_input text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if subdomain is valid (alphanumeric, hyphens, 3-50 chars)
  RETURN subdomain_input ~ '^[a-z0-9]([a-z0-9-]*[a-z0-9])?$' 
    AND length(subdomain_input) >= 3 
    AND length(subdomain_input) <= 50
    AND subdomain_input NOT IN ('www', 'api', 'admin', 'app', 'mail', 'ftp', 'support', 'help', 'blog');
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_subdomain_validity()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.subdomain IS NOT NULL AND NOT public.validate_subdomain(NEW.subdomain) THEN
    RAISE EXCEPTION 'Invalid subdomain format or reserved name';
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.send_email_reminders()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

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

-- Create bootstrap admin function for initial setup
CREATE OR REPLACE FUNCTION public.bootstrap_admin_user(user_email text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  admin_count integer;
  user_record record;
BEGIN
  -- Check if any admin users already exist
  SELECT COUNT(*) INTO admin_count
  FROM public.profiles 
  WHERE role = 'admin';
  
  -- Only allow bootstrap if no admins exist
  IF admin_count > 0 THEN
    RAISE EXCEPTION 'Admin users already exist. Bootstrap not allowed.';
  END IF;
  
  -- Find user by email and make them admin
  SELECT * INTO user_record
  FROM public.profiles 
  WHERE email = user_email;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;
  
  -- Update user to admin role
  UPDATE public.profiles 
  SET role = 'admin', updated_at = now()
  WHERE email = user_email;
  
  -- Log the security event
  PERFORM public.log_security_event(
    'admin_bootstrap',
    jsonb_build_object('email', user_email, 'user_id', user_record.id),
    user_record.id
  );
  
  RETURN TRUE;
END;
$function$;