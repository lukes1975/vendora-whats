
-- Add first_login_done field to profiles table to track if welcome email has been sent
ALTER TABLE public.profiles 
ADD COLUMN first_login_done BOOLEAN DEFAULT false;
