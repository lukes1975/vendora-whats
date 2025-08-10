-- Safety: add column only if missing
ALTER TABLE public.store_settings
ADD COLUMN IF NOT EXISTS base_location_address TEXT;
