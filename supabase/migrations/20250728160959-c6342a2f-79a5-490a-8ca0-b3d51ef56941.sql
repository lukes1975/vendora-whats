-- Add subaccount_code to bank_accounts table
ALTER TABLE bank_accounts 
ADD COLUMN subaccount_code TEXT,
ADD COLUMN subaccount_status TEXT DEFAULT 'pending';