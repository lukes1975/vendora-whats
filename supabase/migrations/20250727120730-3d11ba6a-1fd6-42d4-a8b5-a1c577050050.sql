-- Add setup completion tracking to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS setup_completed boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS setup_completed_at timestamp with time zone;

-- Create user setup progress tracking table
CREATE TABLE user_setup_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id text NOT NULL,
  section_id text NOT NULL,
  completed boolean DEFAULT false,
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, task_id)
);

-- Add RLS policies
ALTER TABLE user_setup_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own setup progress" ON user_setup_progress
  FOR ALL USING (auth.uid() = user_id);

-- Create function to update setup completion status
CREATE OR REPLACE FUNCTION update_setup_completion()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;