
-- Create pro_interest table for collecting upgrade interest
CREATE TABLE public.pro_interest (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID REFERENCES auth.users
);

-- Add Row Level Security
ALTER TABLE public.pro_interest ENABLE ROW LEVEL SECURITY;

-- Create policy for users to insert their own interest
CREATE POLICY "Users can submit their own interest" 
  ON public.pro_interest 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy for users to view their own submissions
CREATE POLICY "Users can view their own submissions" 
  ON public.pro_interest 
  FOR SELECT 
  USING (auth.uid() = user_id);
