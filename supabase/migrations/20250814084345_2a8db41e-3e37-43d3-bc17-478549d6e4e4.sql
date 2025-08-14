-- Lock down customer_sessions PII access
-- 1) Ensure no default grants for anon/authenticated
REVOKE ALL ON TABLE public.customer_sessions FROM anon, authenticated;

-- 2) RLS: allow only admins to read (service role bypasses RLS for edge functions)
DROP POLICY IF EXISTS "Admins can view customer sessions" ON public.customer_sessions;
CREATE POLICY "Admins can view customer sessions"
ON public.customer_sessions
FOR SELECT
USING (public.get_current_user_role() = 'admin'::user_role);

-- Note: No INSERT/UPDATE/DELETE policies created intentionally.
-- Customers are pseudo-anon; writes happen only via service role in Edge Functions.
