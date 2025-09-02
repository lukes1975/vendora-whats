-- Phase 2: Enhanced Marketplace Features Database Schema

-- Product Analytics for trending calculation
CREATE TABLE IF NOT EXISTS public.product_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'whatsapp_click', 'store_visit', 'wishlist_add')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_session_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Wishlist system
CREATE TABLE IF NOT EXISTS public.user_wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- User follows (follow vendors)
CREATE TABLE IF NOT EXISTS public.user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL,
  following_vendor_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_vendor_id)
);

-- Student verification enhanced
CREATE TABLE IF NOT EXISTS public.student_verifications_enhanced (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  university_email TEXT NOT NULL,
  student_id TEXT NOT NULL,
  department TEXT,
  level_of_study TEXT CHECK (level_of_study IN ('100', '200', '300', '400', '500', 'postgraduate')),
  verification_code TEXT,
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Product questions/inquiries
CREATE TABLE IF NOT EXISTS public.product_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL,
  inquirer_id UUID,
  question TEXT NOT NULL,
  answer TEXT,
  is_public BOOLEAN DEFAULT true,
  answered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enhanced product ratings with photos
ALTER TABLE public.product_ratings 
ADD COLUMN IF NOT EXISTS review_images JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS is_verified_purchase BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS helpful_votes INTEGER DEFAULT 0;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_analytics_product_id ON public.product_analytics(product_id);
CREATE INDEX IF NOT EXISTS idx_product_analytics_created_at ON public.product_analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_product_analytics_event_type ON public.product_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_user_wishlists_user_id ON public.user_wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_follower_id ON public.user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_product_inquiries_product_id ON public.product_inquiries(product_id);

-- Enable RLS on new tables
ALTER TABLE public.product_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_verifications_enhanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_inquiries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for product_analytics (vendors can see their own, public for trending)
CREATE POLICY "Anyone can insert product analytics" ON public.product_analytics
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Vendors can view their product analytics" ON public.product_analytics
  FOR SELECT USING (auth.uid() = vendor_id);

-- RLS Policies for user_wishlists
CREATE POLICY "Users can manage their own wishlist" ON public.user_wishlists
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for user_follows  
CREATE POLICY "Users can manage their own follows" ON public.user_follows
  FOR ALL USING (auth.uid() = follower_id);

CREATE POLICY "Vendors can see their followers" ON public.user_follows
  FOR SELECT USING (auth.uid() = following_vendor_id);

-- RLS Policies for student_verifications_enhanced
CREATE POLICY "Users can manage their own verification" ON public.student_verifications_enhanced
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for product_inquiries
CREATE POLICY "Anyone can view public inquiries" ON public.product_inquiries
  FOR SELECT USING (is_public = true);

CREATE POLICY "Vendors can manage inquiries for their products" ON public.product_inquiries
  FOR ALL USING (auth.uid() = vendor_id);

CREATE POLICY "Users can create inquiries" ON public.product_inquiries
  FOR INSERT WITH CHECK (auth.uid() = inquirer_id);

-- Function to calculate trending score
CREATE OR REPLACE FUNCTION public.calculate_trending_score(
  product_id UUID,
  days_back INTEGER DEFAULT 7
) RETURNS NUMERIC AS $$
DECLARE
  score NUMERIC := 0;
  view_count INTEGER;
  whatsapp_count INTEGER;
  wishlist_count INTEGER;
  recency_factor NUMERIC;
BEGIN
  -- Get analytics counts from last N days
  SELECT 
    COALESCE(SUM(CASE WHEN event_type = 'view' THEN 1 ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN event_type = 'whatsapp_click' THEN 1 ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN event_type = 'wishlist_add' THEN 1 ELSE 0 END), 0)
  INTO view_count, whatsapp_count, wishlist_count
  FROM public.product_analytics 
  WHERE product_id = calculate_trending_score.product_id 
    AND created_at > NOW() - INTERVAL '1 day' * days_back;
  
  -- Calculate recency factor (newer products get slight boost)
  SELECT EXTRACT(EPOCH FROM (NOW() - created_at)) / 86400 INTO recency_factor
  FROM public.products WHERE id = calculate_trending_score.product_id;
  
  -- Calculate weighted score
  score := (view_count * 1.0) + (whatsapp_count * 3.0) + (wishlist_count * 2.0);
  
  -- Apply recency decay (products lose 10% per day)
  score := score * POWER(0.9, LEAST(recency_factor, 30));
  
  RETURN score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;