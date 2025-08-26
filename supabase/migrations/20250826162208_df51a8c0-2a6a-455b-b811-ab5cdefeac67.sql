-- Fix security warning: Function Search Path Mutable
-- Drop trigger first, then function, then recreate both

DROP TRIGGER IF EXISTS update_manual_payment_confirmations_updated_at ON public.manual_payment_confirmations;
DROP FUNCTION IF EXISTS update_updated_at_column_manual_payments();

CREATE OR REPLACE FUNCTION update_updated_at_column_manual_payments()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_manual_payment_confirmations_updated_at
BEFORE UPDATE ON public.manual_payment_confirmations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column_manual_payments();