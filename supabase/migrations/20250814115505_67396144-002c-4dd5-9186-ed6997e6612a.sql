-- Phase 4: WhatsApp Bot Flow Database Schema

-- Add use_ai_chat to stores table
ALTER TABLE public.stores 
ADD COLUMN IF NOT EXISTS use_ai_chat boolean DEFAULT true;

-- Update orders_v2 table with WhatsApp-specific columns
ALTER TABLE public.orders_v2 
ADD COLUMN IF NOT EXISTS chat_id text,
ADD COLUMN IF NOT EXISTS customer_phone text,
ADD COLUMN IF NOT EXISTS items jsonb NOT NULL DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS payment_provider text,
ADD COLUMN IF NOT EXISTS payment_reference text,
ADD COLUMN IF NOT EXISTS payment_link text,
ADD COLUMN IF NOT EXISTS meta jsonb DEFAULT '{}'::jsonb;

-- Update status enum to include all required states
ALTER TABLE public.orders_v2 
ALTER COLUMN status SET DEFAULT 'pending';

-- Add check constraint for valid statuses
ALTER TABLE public.orders_v2 
ADD CONSTRAINT valid_status CHECK (status IN ('pending', 'pending_payment', 'paid', 'cancelled', 'completed'));

-- Create wa_chats table for USSD flow state management
CREATE TABLE IF NOT EXISTS public.wa_chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  chat_id text NOT NULL,
  state text NOT NULL DEFAULT 'START',
  context jsonb DEFAULT '{}'::jsonb,
  last_message_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '30 minutes'),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(store_id, chat_id)
);

-- Enable RLS on wa_chats
ALTER TABLE public.wa_chats ENABLE ROW LEVEL SECURITY;

-- RLS policies for wa_chats
CREATE POLICY "Vendors manage their wa_chats" 
ON public.wa_chats 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM stores s 
  WHERE s.id = wa_chats.store_id 
  AND s.vendor_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM stores s 
  WHERE s.id = wa_chats.store_id 
  AND s.vendor_id = auth.uid()
));

-- Service role can manage all wa_chats (for Edge function)
CREATE POLICY "Service role can manage all wa_chats" 
ON public.wa_chats 
FOR ALL 
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Add updated_at trigger for wa_chats
CREATE TRIGGER update_wa_chats_updated_at
BEFORE UPDATE ON public.wa_chats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update orders_v2 RLS to allow service role writes
CREATE POLICY "Service role can manage all orders_v2" 
ON public.orders_v2 
FOR ALL 
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Create index for efficient wa_chats lookups
CREATE INDEX IF NOT EXISTS idx_wa_chats_store_chat 
ON public.wa_chats(store_id, chat_id);

CREATE INDEX IF NOT EXISTS idx_wa_chats_expires_at 
ON public.wa_chats(expires_at);

-- Create index for orders_v2 chat_id lookups
CREATE INDEX IF NOT EXISTS idx_orders_v2_chat_id 
ON public.orders_v2(chat_id);

CREATE INDEX IF NOT EXISTS idx_orders_v2_payment_reference 
ON public.orders_v2(payment_reference);