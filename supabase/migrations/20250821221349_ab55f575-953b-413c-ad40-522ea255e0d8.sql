-- Create function to get customer authorization (workaround for TypeScript types)
CREATE OR REPLACE FUNCTION public.get_customer_authorization(email TEXT)
RETURNS TABLE (
  customer_email TEXT,
  authorization_code TEXT,
  card_type TEXT,
  last_4 TEXT,
  exp_month TEXT,
  exp_year TEXT,
  bank TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ca.customer_email,
    ca.authorization_code,
    ca.card_type,
    ca.last_4,
    ca.exp_month,
    ca.exp_year,
    ca.bank
  FROM customer_authorizations ca
  WHERE ca.customer_email = email;
END;
$$;