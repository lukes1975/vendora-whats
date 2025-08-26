-- Fix security warning: Function Search Path Mutable
-- Set search_path for the function we just created

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