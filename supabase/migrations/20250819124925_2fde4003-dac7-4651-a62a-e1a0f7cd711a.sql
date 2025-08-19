-- Create tables for credit management system
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  amount integer NOT NULL, -- Credits in whole numbers
  transaction_type text NOT NULL CHECK (transaction_type IN ('purchase', 'usage', 'refund', 'bonus')),
  description text,
  reference_id uuid, -- Link to order, message, etc.
  created_at timestamptz NOT NULL DEFAULT now(),
  meta jsonb DEFAULT '{}'::jsonb
);

-- Create user credit balances table
CREATE TABLE IF NOT EXISTS public.user_credit_balances (
  user_id uuid NOT NULL PRIMARY KEY,
  current_balance integer NOT NULL DEFAULT 0,
  total_purchased integer NOT NULL DEFAULT 0,
  total_used integer NOT NULL DEFAULT 0,
  last_updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create bulk messaging campaigns table
CREATE TABLE IF NOT EXISTS public.bulk_messaging_campaigns (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  campaign_name text NOT NULL,
  message_template text NOT NULL,
  target_audience jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_recipients integer NOT NULL DEFAULT 0,
  messages_sent integer NOT NULL DEFAULT 0,
  messages_delivered integer NOT NULL DEFAULT 0,
  messages_failed integer NOT NULL DEFAULT 0,
  credits_used integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sending', 'completed', 'failed', 'cancelled')),
  scheduled_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_credit_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bulk_messaging_campaigns ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own credit transactions" 
ON public.credit_transactions 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own credit balance" 
ON public.user_credit_balances 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own bulk campaigns" 
ON public.bulk_messaging_campaigns 
FOR ALL 
USING (auth.uid() = user_id);

-- Function to update credit balance
CREATE OR REPLACE FUNCTION public.update_credit_balance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.user_credit_balances (user_id, current_balance, total_purchased, total_used)
  VALUES (
    NEW.user_id,
    CASE WHEN NEW.transaction_type IN ('purchase', 'bonus', 'refund') THEN NEW.amount ELSE -NEW.amount END,
    CASE WHEN NEW.transaction_type = 'purchase' THEN NEW.amount ELSE 0 END,
    CASE WHEN NEW.transaction_type = 'usage' THEN NEW.amount ELSE 0 END
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    current_balance = user_credit_balances.current_balance + 
      CASE WHEN NEW.transaction_type IN ('purchase', 'bonus', 'refund') THEN NEW.amount ELSE -NEW.amount END,
    total_purchased = user_credit_balances.total_purchased + 
      CASE WHEN NEW.transaction_type = 'purchase' THEN NEW.amount ELSE 0 END,
    total_used = user_credit_balances.total_used + 
      CASE WHEN NEW.transaction_type = 'usage' THEN NEW.amount ELSE 0 END,
    last_updated_at = now();
  
  RETURN NEW;
END;
$function$;

-- Trigger to update credit balance
CREATE TRIGGER update_credit_balance_trigger
  AFTER INSERT ON public.credit_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_credit_balance();

-- Trigger for updating timestamps
CREATE TRIGGER update_bulk_campaigns_updated_at
  BEFORE UPDATE ON public.bulk_messaging_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();