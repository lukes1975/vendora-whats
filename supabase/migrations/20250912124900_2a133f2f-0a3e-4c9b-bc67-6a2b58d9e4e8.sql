-- Fix critical security issues identified in security scan

-- Fix customer_sessions RLS - currently only admins can view, need to add proper policies for owners
DROP POLICY IF EXISTS "Admins can view customer sessions" ON public.customer_sessions;

-- Customer sessions should only be accessible via edge functions with proper validation
CREATE POLICY "Service role manages customer sessions" ON public.customer_sessions
FOR ALL USING (auth.role() = 'service_role');

-- Fix customer_authorizations - add proper RLS policies
ALTER TABLE public.customer_authorizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages customer authorizations" ON public.customer_authorizations
FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can view their own authorizations" ON public.customer_authorizations
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.email = customer_authorizations.customer_email 
    AND auth.users.id = auth.uid()
  )
);

-- Fix pro_interest table - make it more restrictive
DROP POLICY IF EXISTS "Users can submit their own interest" ON public.pro_interest;
DROP POLICY IF EXISTS "Users can view their own submissions" ON public.pro_interest;

CREATE POLICY "Users can submit their own interest" ON public.pro_interest
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own submissions" ON public.pro_interest
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all pro interest submissions" ON public.pro_interest
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Fix login_attempts - make more restrictive
DROP POLICY IF EXISTS "Admins can view login attempts" ON public.login_attempts;
DROP POLICY IF EXISTS "System can insert login attempts" ON public.login_attempts;

CREATE POLICY "Service role manages login attempts" ON public.login_attempts
FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Admins can view login attempts" ON public.login_attempts
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);