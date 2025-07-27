import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useTaskValidation } from "./useTaskValidation";

interface TaskProgress {
  taskId: string;
  sectionId: string;
  completed: boolean;
  completedAt?: string;
}

interface SetupProgress {
  overallProgress: number;
  isSetupCompleted: boolean;
  tasks: Record<string, TaskProgress>;
  sectionsProgress: Record<string, number>;
}

const TASK_DEFINITIONS = {
  'store_setup': [
    'add_first_product',
    'customize_storefront', 
    'set_store_link'
  ],
  'store_settings': [
    'connect_payout_account',
    'set_delivery_options'
  ],
  'order_messaging': [
    'set_notification_preference',
    'connect_whatsapp'
  ],
  'business_profile': [
    'add_business_info'
  ],
  'preferences': [
    'choose_selling_method'
  ],
  'launch_checklist': [
    'preview_store',
    'share_store_link',
    'launch_store'
  ]
};

const ALL_REQUIRED_TASKS = [
  'add_first_product',
  'customize_storefront', 
  'set_store_link',
  'connect_whatsapp',
  'add_business_info',
  'choose_selling_method',
  'preview_store',
  'launch_store'
];

export const useSetupProgress = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { validateTask } = useTaskValidation();

  // Fetch setup progress from database
  const { data: setupProgress, isLoading, error } = useQuery({
    queryKey: ['setup-progress', user?.id],
    queryFn: async (): Promise<SetupProgress> => {
      if (!user?.id) throw new Error('User not authenticated');

      // Get user's setup progress
      const { data: progressData, error: progressError } = await supabase
        .from('user_setup_progress')
        .select('*')
        .eq('user_id', user.id);

      if (progressError) throw progressError;

      // Get profile setup completion status
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('setup_completed')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // Build tasks map
      const tasks: Record<string, TaskProgress> = {};
      
      // Initialize all tasks as incomplete
      Object.entries(TASK_DEFINITIONS).forEach(([sectionId, taskIds]) => {
        taskIds.forEach(taskId => {
          tasks[taskId] = {
            taskId,
            sectionId,
            completed: false
          };
        });
      });

      // Update with actual progress
      progressData?.forEach(progress => {
        tasks[progress.task_id] = {
          taskId: progress.task_id,
          sectionId: progress.section_id,
          completed: progress.completed,
          completedAt: progress.completed_at
        };
      });

      // Calculate section progress
      const sectionsProgress: Record<string, number> = {};
      Object.entries(TASK_DEFINITIONS).forEach(([sectionId, taskIds]) => {
        const completedTasks = taskIds.filter(taskId => tasks[taskId]?.completed).length;
        sectionsProgress[sectionId] = (completedTasks / taskIds.length) * 100;
      });

      // Calculate overall progress based on required tasks only
      const completedRequiredTasks = ALL_REQUIRED_TASKS.filter(taskId => tasks[taskId]?.completed).length;
      const overallProgress = (completedRequiredTasks / ALL_REQUIRED_TASKS.length) * 100;

      return {
        overallProgress,
        isSetupCompleted: profileData?.setup_completed || false,
        tasks,
        sectionsProgress
      };
    },
    enabled: !!user?.id,
    retry: 2,
    retryDelay: 1000,
  });

  // Mutation to update task progress
  const updateTaskProgress = useMutation({
    mutationFn: async ({ taskId, sectionId, completed }: { taskId: string; sectionId: string; completed: boolean }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_setup_progress')
        .upsert({
          user_id: user.id,
          task_id: taskId,
          section_id: sectionId,
          completed,
          completed_at: completed ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,task_id'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidate and refetch setup progress
      queryClient.invalidateQueries({ queryKey: ['setup-progress', user?.id] });
    },
  });

  // Comprehensive task completion detection
  const detectTaskCompletion = async () => {
    if (!user?.id) return;

    try {
      // Fetch all required data in parallel
      const [
        { data: products },
        { data: store },
        { data: profile },
        { data: orders }
      ] = await Promise.all([
        supabase.from('products').select('id').eq('vendor_id', user.id).limit(1),
        supabase.from('stores').select('*').eq('vendor_id', user.id).single(),
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('orders').select('id').eq('vendor_id', user.id).limit(1)
      ]);

      const tasksToUpdate: Array<{ taskId: string; sectionId: string; completed: boolean }> = [];

      // STORE SETUP SECTION
      // Task: Add first product
      if (products && products.length > 0) {
        tasksToUpdate.push({
          taskId: 'add_first_product',
          sectionId: 'store_setup',
          completed: true
        });
      }

      // Task: Customize storefront (name, description, or logo)
      if (store && (store.name !== 'My Store' && store.name || store.description || store.logo_url)) {
        tasksToUpdate.push({
          taskId: 'customize_storefront',
          sectionId: 'store_setup',
          completed: true
        });
      }

      // Task: Set store link (slug)
      if (store && store.slug) {
        tasksToUpdate.push({
          taskId: 'set_store_link',
          sectionId: 'store_setup',
          completed: true
        });
      }

      // STORE SETTINGS SECTION
      // Task: Connect payout account (paystack customer code indicates setup)
      if (profile && profile.paystack_customer_code) {
        tasksToUpdate.push({
          taskId: 'connect_payout_account',
          sectionId: 'store_settings',
          completed: true
        });
      }

      // Task: Set delivery options (for now, mark as completed if WhatsApp is connected)
      if (store && store.whatsapp_number) {
        tasksToUpdate.push({
          taskId: 'set_delivery_options',
          sectionId: 'store_settings',
          completed: true
        });
      }

      // ORDER MESSAGING SECTION
      // Task: Set notification preference (default to completed if user has logged in)
      tasksToUpdate.push({
        taskId: 'set_notification_preference',
        sectionId: 'order_messaging',
        completed: true
      });

      // Task: Connect WhatsApp
      if (store && store.whatsapp_number) {
        tasksToUpdate.push({
          taskId: 'connect_whatsapp',
          sectionId: 'order_messaging',
          completed: true
        });
      }

      // BUSINESS PROFILE SECTION
      // Task: Add business info (full name and store name)
      if (profile && profile.full_name && store && store.name && store.name !== 'My Store') {
        tasksToUpdate.push({
          taskId: 'add_business_info',
          sectionId: 'business_profile',
          completed: true
        });
      }

      // PREFERENCES SECTION
      // Task: Choose selling method (default to completed if has products)
      if (products && products.length > 0) {
        tasksToUpdate.push({
          taskId: 'choose_selling_method',
          sectionId: 'preferences',
          completed: true
        });
      }

      // LAUNCH CHECKLIST SECTION
      // Task: Preview store (mark completed if store has basic setup)
      if (store && store.name && products && products.length > 0) {
        tasksToUpdate.push({
          taskId: 'preview_store',
          sectionId: 'launch_checklist',
          completed: true
        });
      }

      // Task: Share store link (mark completed if has slug)
      if (store && store.slug) {
        tasksToUpdate.push({
          taskId: 'share_store_link',
          sectionId: 'launch_checklist',
          completed: true
        });
      }

      // Task: Launch store (mark completed if has received an order or manually triggered)
      if (orders && orders.length > 0) {
        tasksToUpdate.push({
          taskId: 'launch_store',
          sectionId: 'launch_checklist',
          completed: true
        });
      }

      // Batch update all detected tasks
      tasksToUpdate.forEach(task => {
        updateTaskProgress.mutate(task);
      });

    } catch (error) {
      console.error('Error detecting task completion:', error);
    }
  };

  const markTaskCompleted = (taskId: string, sectionId: string) => {
    updateTaskProgress.mutate({
      taskId,
      sectionId,
      completed: true
    });
  };

  const markTaskIncomplete = (taskId: string, sectionId: string) => {
    updateTaskProgress.mutate({
      taskId,
      sectionId,
      completed: false
    });
  };

  // Smart task validation
  const validateAndUpdateTask = async (taskId: string, sectionId: string) => {
    if (!user?.id) return;
    
    try {
      const validation = await validateTask(taskId, user.id);
      updateTaskProgress.mutate({
        taskId,
        sectionId,
        completed: validation.isCompleted
      });
      return validation;
    } catch (error) {
      console.error(`Error validating task ${taskId}:`, error);
    }
  };

  // Auto-validate all tasks
  const validateAllTasks = async () => {
    if (!user?.id) return;

    try {
      // Validate all tasks in parallel
      const validationPromises = Object.entries(TASK_DEFINITIONS).flatMap(([sectionId, taskIds]) =>
        taskIds.map(async (taskId) => {
          const validation = await validateTask(taskId, user.id);
          return { taskId, sectionId, validation };
        })
      );

      const results = await Promise.all(validationPromises);
      
      // Update all tasks based on validation results
      results.forEach(({ taskId, sectionId, validation }) => {
        updateTaskProgress.mutate({
          taskId,
          sectionId,
          completed: validation.isCompleted
        });
      });
      
      return results;
    } catch (error) {
      console.error('Error validating all tasks:', error);
    }
  };

  return {
    setupProgress,
    isLoading,
    error,
    markTaskCompleted,
    markTaskIncomplete,
    detectTaskCompletion,
    validateAndUpdateTask,
    validateAllTasks,
    isUpdating: updateTaskProgress.isPending,
    TASK_DEFINITIONS,
    ALL_REQUIRED_TASKS
  };
};