
-- Fix storage policies for product-images bucket to ensure proper user isolation
DROP POLICY IF EXISTS "Users can upload their own product images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own product images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own product images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own product images" ON storage.objects;

-- Create more secure storage policies
CREATE POLICY "Users can upload to their own folder" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can view their own files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'product-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'product-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their own files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'product-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND auth.role() = 'authenticated'
);

-- Add server-side validation function for phone numbers
CREATE OR REPLACE FUNCTION public.validate_phone_number(phone_number text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if phone number matches international format (+country code followed by digits)
  RETURN phone_number ~ '^\+[1-9]\d{6,14}$';
END;
$$;

-- Add server-side validation function for sanitizing text input
CREATE OR REPLACE FUNCTION public.sanitize_text_input(input_text text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Remove potential XSS characters and trim whitespace
  RETURN trim(regexp_replace(input_text, '[<>"\''&]', '', 'g'));
END;
$$;

-- Add constraint to stores table for phone number validation
ALTER TABLE public.stores 
ADD CONSTRAINT valid_whatsapp_number 
CHECK (whatsapp_number IS NULL OR public.validate_phone_number(whatsapp_number));
