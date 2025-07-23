-- Add onboarding_email_sent column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_email_sent BOOLEAN DEFAULT FALSE;