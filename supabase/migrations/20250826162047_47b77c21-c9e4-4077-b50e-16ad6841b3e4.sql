-- Phase 1: Payment System Fixes & Manual Bank Transfer Support

-- Create manual payment confirmations table
CREATE TABLE IF NOT EXISTS public.manual_payment_confirmations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL,
  vendor_id UUID NOT NULL,
  proof_image_url TEXT,
  bank_details JSONB NOT NULL DEFAULT '{}',
  amount_kobo INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NGN',
  customer_reference TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
  confirmed_by UUID,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  rejected_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payment reconciliation audit table
CREATE TABLE IF NOT EXISTS public.payment_reconciliation (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL,
  payment_method TEXT NOT NULL,
  paystack_reference TEXT,
  manual_confirmation_id UUID,
  reconciled_amount_kobo INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'reconciled' CHECK (status IN ('reconciled', 'disputed', 'refunded')),
  reconciled_by UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enhanced delivery assignments table
ALTER TABLE public.delivery_assignments 
ADD COLUMN IF NOT EXISTS pickup_address TEXT,
ADD COLUMN IF NOT EXISTS delivery_address TEXT,
ADD COLUMN IF NOT EXISTS vendor_id UUID,
ADD COLUMN IF NOT EXISTS delivery_fee_kobo INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS proof_of_delivery_url TEXT,
ADD COLUMN IF NOT EXISTS customer_rating INTEGER CHECK (customer_rating >= 1 AND customer_rating <= 5),
ADD COLUMN IF NOT EXISTS delivery_notes TEXT;

-- Enable RLS on new tables
ALTER TABLE public.manual_payment_confirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_reconciliation ENABLE ROW LEVEL SECURITY;

-- RLS policies for manual_payment_confirmations
CREATE POLICY "Vendors manage their payment confirmations" 
ON public.manual_payment_confirmations 
FOR ALL 
USING (auth.uid() = vendor_id)
WITH CHECK (auth.uid() = vendor_id);

-- RLS policies for payment_reconciliation  
CREATE POLICY "Vendors view their payment reconciliation" 
ON public.payment_reconciliation 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM orders_v2 o 
  WHERE o.id = payment_reconciliation.order_id 
  AND o.vendor_id = auth.uid()
));

CREATE POLICY "Service role manages payment reconciliation" 
ON public.payment_reconciliation 
FOR ALL 
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Update delivery_assignments RLS policies
DROP POLICY IF EXISTS "Admins can view delivery assignments" ON public.delivery_assignments;

CREATE POLICY "Vendors manage their delivery assignments" 
ON public.delivery_assignments 
FOR ALL 
USING (auth.uid() = vendor_id OR EXISTS (
  SELECT 1 FROM orders_v2 o 
  WHERE o.id = delivery_assignments.order_id 
  AND o.vendor_id = auth.uid()
))
WITH CHECK (auth.uid() = vendor_id OR EXISTS (
  SELECT 1 FROM orders_v2 o 
  WHERE o.id = delivery_assignments.order_id 
  AND o.vendor_id = auth.uid()
));

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column_manual_payments()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_manual_payment_confirmations_updated_at
BEFORE UPDATE ON public.manual_payment_confirmations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column_manual_payments();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_manual_payment_confirmations_vendor_id ON public.manual_payment_confirmations(vendor_id);
CREATE INDEX IF NOT EXISTS idx_manual_payment_confirmations_status ON public.manual_payment_confirmations(status);
CREATE INDEX IF NOT EXISTS idx_payment_reconciliation_order_id ON public.payment_reconciliation(order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_assignments_vendor_id ON public.delivery_assignments(vendor_id);
CREATE INDEX IF NOT EXISTS idx_delivery_assignments_status ON public.delivery_assignments(status);