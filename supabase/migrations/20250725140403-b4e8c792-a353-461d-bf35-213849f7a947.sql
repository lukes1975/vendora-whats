-- Fix remaining function search path issues
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