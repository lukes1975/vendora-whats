-- Create bank account details table
CREATE TABLE public.bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_number TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  account_holder_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create delivery options table
CREATE TABLE public.delivery_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  location_name TEXT NOT NULL,
  delivery_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_free_shipping BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create notification preferences table
CREATE TABLE public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  whatsapp_notifications BOOLEAN DEFAULT true,
  dashboard_notifications BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create selling methods table
CREATE TABLE public.selling_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  method TEXT NOT NULL CHECK (method IN ('whatsapp_only', 'website_only', 'both')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.selling_methods ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for bank_accounts
CREATE POLICY "Users can manage their own bank accounts" 
ON public.bank_accounts 
FOR ALL 
USING (auth.uid() = user_id);

-- Create RLS policies for delivery_options
CREATE POLICY "Users can manage their own delivery options" 
ON public.delivery_options 
FOR ALL 
USING (auth.uid() = user_id);

-- Create RLS policies for notification_preferences
CREATE POLICY "Users can manage their own notification preferences" 
ON public.notification_preferences 
FOR ALL 
USING (auth.uid() = user_id);

-- Create RLS policies for selling_methods
CREATE POLICY "Users can manage their own selling methods" 
ON public.selling_methods 
FOR ALL 
USING (auth.uid() = user_id);

-- Create unique constraints to ensure one record per user
ALTER TABLE public.bank_accounts ADD CONSTRAINT unique_user_bank_account UNIQUE (user_id);
ALTER TABLE public.notification_preferences ADD CONSTRAINT unique_user_notification_prefs UNIQUE (user_id);
ALTER TABLE public.selling_methods ADD CONSTRAINT unique_user_selling_method UNIQUE (user_id);

-- Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_bank_accounts_updated_at
  BEFORE UPDATE ON public.bank_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_delivery_options_updated_at
  BEFORE UPDATE ON public.delivery_options
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_selling_methods_updated_at
  BEFORE UPDATE ON public.selling_methods
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();