-- Fix the generate_referral_code function that's causing signup failures
CREATE OR REPLACE FUNCTION generate_referral_code(user_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    base_code TEXT;
    final_code TEXT;
    counter INTEGER := 0;
BEGIN
    -- Create base code from email (first part before @)
    base_code := UPPER(LEFT(SPLIT_PART(user_email, '@', 1), 6));
    
    -- Remove any non-alphanumeric characters
    base_code := REGEXP_REPLACE(base_code, '[^A-Z0-9]', '', 'g');
    
    -- Ensure minimum length
    IF LENGTH(base_code) < 3 THEN
        base_code := base_code || 'USR';
    END IF;
    
    -- Try to find unique code
    final_code := base_code;
    WHILE EXISTS (SELECT 1 FROM public.user_metrics WHERE referral_code = final_code) LOOP
        counter := counter + 1;
        final_code := base_code || counter::TEXT;
    END LOOP;
    
    RETURN final_code;
EXCEPTION
    WHEN OTHERS THEN
        -- Fallback to a simple random code if anything fails
        RETURN 'USER' || EXTRACT(EPOCH FROM NOW())::INTEGER::TEXT;
END;
$$;

-- Update the create_user_metrics function to be more robust
CREATE OR REPLACE FUNCTION create_user_metrics()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.user_metrics (
        user_id, 
        signup_date, 
        referral_code
    ) VALUES (
        NEW.id,
        COALESCE(NEW.created_at::date, CURRENT_DATE),
        generate_referral_code(COALESCE(NEW.email, NEW.id::text))
    ) ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but don't fail the user creation
        RAISE WARNING 'Failed to create user metrics for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$;

-- Ensure the trigger exists and is properly configured
DROP TRIGGER IF EXISTS on_user_signup_create_metrics ON auth.users;
CREATE TRIGGER on_user_signup_create_metrics
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION create_user_metrics();