-- Fix security warning: Add search_path to function
CREATE OR REPLACE FUNCTION update_setup_completion()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Check if all required tasks are completed
  WITH required_tasks AS (
    SELECT unnest(ARRAY[
      'add_first_product',
      'customize_storefront', 
      'set_store_link',
      'connect_whatsapp',
      'add_business_info',
      'choose_selling_method',
      'preview_store',
      'launch_store'
    ]) as task_id
  ),
  user_completed_tasks AS (
    SELECT task_id
    FROM user_setup_progress 
    WHERE user_id = NEW.user_id AND completed = true
  ),
  completion_status AS (
    SELECT 
      COUNT(required_tasks.task_id) as total_required,
      COUNT(user_completed_tasks.task_id) as completed_count
    FROM required_tasks
    LEFT JOIN user_completed_tasks ON required_tasks.task_id = user_completed_tasks.task_id
  )
  UPDATE profiles 
  SET 
    setup_completed = (SELECT completed_count >= total_required FROM completion_status),
    setup_completed_at = CASE 
      WHEN (SELECT completed_count >= total_required FROM completion_status) 
        AND setup_completed_at IS NULL 
      THEN now() 
      ELSE setup_completed_at 
    END
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$;

-- Create trigger to update setup completion
CREATE TRIGGER trigger_update_setup_completion
  AFTER INSERT OR UPDATE ON user_setup_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_setup_completion();