-- Add individual_store_enabled column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN individual_store_enabled BOOLEAN DEFAULT false;

-- Update existing users to have individual store disabled by default (marketplace focus)
UPDATE public.profiles 
SET individual_store_enabled = false 
WHERE individual_store_enabled IS NULL;

-- Add student verification columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN is_student_verified BOOLEAN DEFAULT false,
ADD COLUMN university_email TEXT,
ADD COLUMN student_verification_date TIMESTAMPTZ;

-- Create index for better performance on student verification queries
CREATE INDEX idx_profiles_student_verified ON public.profiles (is_student_verified);

-- Create function to sync student verification status
CREATE OR REPLACE FUNCTION public.sync_student_verification_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update profile when student verification status changes
  IF NEW.verification_status = 'verified' AND OLD.verification_status != 'verified' THEN
    UPDATE public.profiles 
    SET 
      is_student_verified = true,
      university_email = NEW.university_email,
      student_verification_date = now()
    WHERE id = NEW.user_id;
  ELSIF NEW.verification_status != 'verified' AND OLD.verification_status = 'verified' THEN
    UPDATE public.profiles 
    SET 
      is_student_verified = false,
      university_email = NULL,
      student_verification_date = NULL
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to sync verification status
CREATE TRIGGER sync_student_verification
  AFTER UPDATE ON public.student_verifications_enhanced
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_student_verification_status();

-- Update existing verified students in profiles table
UPDATE public.profiles 
SET 
  is_student_verified = true,
  student_verification_date = sve.verified_at,
  university_email = sve.university_email
FROM public.student_verifications_enhanced sve
WHERE profiles.id = sve.user_id 
AND sve.verification_status = 'verified';