-- Add subscription fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'trialing')),
ADD COLUMN plan TEXT DEFAULT 'starter' CHECK (plan IN ('starter', 'pro')),
ADD COLUMN billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'quarterly', 'yearly')),
ADD COLUMN paystack_customer_code TEXT,
ADD COLUMN paystack_subscription_code TEXT,
ADD COLUMN next_billing_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN subscription_created_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN subscription_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create subscription plans table for plan management
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_name TEXT NOT NULL,
  billing_cycle TEXT NOT NULL,
  amount INTEGER NOT NULL, -- Amount in kobo
  paystack_plan_code TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(plan_name, billing_cycle)
);

-- Enable RLS on subscription_plans
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Anyone can view active plans
CREATE POLICY "Anyone can view active subscription plans" 
ON public.subscription_plans 
FOR SELECT 
USING (is_active = true);

-- Insert initial subscription plans
INSERT INTO public.subscription_plans (plan_name, billing_cycle, amount, paystack_plan_code) VALUES
('starter', 'monthly', 300000, 'PLN_starter_monthly'), -- ₦3,000 in kobo
('starter', 'quarterly', 900000, 'PLN_starter_quarterly'), -- ₦9,000 in kobo  
('starter', 'yearly', 3060000, 'PLN_starter_yearly'), -- ₦30,600 in kobo
('pro', 'monthly', 750000, 'PLN_pro_monthly'), -- ₦7,500 in kobo
('pro', 'quarterly', 2250000, 'PLN_pro_quarterly'), -- ₦22,500 in kobo
('pro', 'yearly', 7650000, 'PLN_pro_yearly'); -- ₦76,500 in kobo

-- Create trigger to update subscription_updated_at
CREATE OR REPLACE FUNCTION public.update_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.subscription_updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_subscription_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_subscription_updated_at();