-- Add bank_code column to bank_accounts table
ALTER TABLE public.bank_accounts 
ADD COLUMN bank_code TEXT;