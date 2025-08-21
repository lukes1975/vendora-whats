-- Create table to store customer payment authorizations for recurring charges
CREATE TABLE public.customer_authorizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_email TEXT NOT NULL UNIQUE,
  authorization_code TEXT NOT NULL,
  card_type TEXT NOT NULL,
  last_4 TEXT NOT NULL,
  exp_month TEXT NOT NULL,
  exp_year TEXT NOT NULL,
  bank TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.customer_authorizations ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage all customer authorizations (for webhook processing)
CREATE POLICY "Service role can manage customer authorizations"
ON public.customer_authorizations
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Allow vendors to view customer authorizations for their own customers
CREATE POLICY "Vendors can view customer authorizations"
ON public.customer_authorizations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.customer_email = customer_authorizations.customer_email 
    AND orders.vendor_id = auth.uid()
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_customer_authorizations_updated_at
BEFORE UPDATE ON public.customer_authorizations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();