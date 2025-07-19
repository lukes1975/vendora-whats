-- Fix user_metrics initialization trigger to handle existing users
-- Update the trigger function to handle null signup_date properly
CREATE OR REPLACE FUNCTION initialize_user_metrics()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.user_metrics (
        user_id, 
        signup_date, 
        referral_code
    ) VALUES (
        NEW.id,
        COALESCE(NEW.created_at::date, CURRENT_DATE),
        generate_referral_code(NEW.email)
    ) ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$;

-- Also add a manual initialization for existing users without metrics
INSERT INTO public.user_metrics (user_id, signup_date, referral_code)
SELECT 
    id,
    created_at::date,
    generate_referral_code(email)
FROM auth.users 
WHERE id NOT IN (SELECT user_id FROM public.user_metrics WHERE user_id IS NOT NULL)
ON CONFLICT (user_id) DO NOTHING;