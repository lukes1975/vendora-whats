-- Create feature_suggestions table
CREATE TABLE public.feature_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL,
  suggestion_text TEXT NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.feature_suggestions ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can create their own suggestions" 
ON public.feature_suggestions 
FOR INSERT 
WITH CHECK (auth.uid() = vendor_id);

CREATE POLICY "Users can view their own suggestions" 
ON public.feature_suggestions 
FOR SELECT 
USING (auth.uid() = vendor_id);