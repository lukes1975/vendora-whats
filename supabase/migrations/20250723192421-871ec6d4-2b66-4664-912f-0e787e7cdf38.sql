-- Fix search path security issue for update_subscription_updated_at function
CREATE OR REPLACE FUNCTION public.update_subscription_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.subscription_updated_at = now();
  RETURN NEW;
END;
$$;