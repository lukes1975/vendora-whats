import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

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

  // Auto-detect task completion based on existing data
  const detectTaskCompletion = async () => {
    if (!user?.id) return;

    try {
      // Check products for first product
      const { data: products } = await supabase
        .from('products')
        .select('id')
        .eq('vendor_id', user.id)
        .limit(1);

      if (products && products.length > 0) {
        updateTaskProgress.mutate({
          taskId: 'add_first_product',
          sectionId: 'store_setup',
          completed: true
        });
      }

      // Check store customization
      const { data: store } = await supabase
        .from('stores')
        .select('name, description, logo_url, slug, whatsapp_number')
        .eq('vendor_id', user.id)
        .single();

      if (store && (store.name || store.description || store.logo_url)) {
        updateTaskProgress.mutate({
          taskId: 'customize_storefront',
          sectionId: 'store_setup',
          completed: true
        });
      }

      if (store && store.slug) {
        updateTaskProgress.mutate({
          taskId: 'set_store_link',
          sectionId: 'store_setup',
          completed: true
        });
      }

      if (store && store.whatsapp_number) {
        updateTaskProgress.mutate({
          taskId: 'connect_whatsapp',
          sectionId: 'order_messaging',
          completed: true
        });
      }

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

  return {
    setupProgress,
    isLoading,
    error,
    markTaskCompleted,
    markTaskIncomplete,
    detectTaskCompletion,
    isUpdating: updateTaskProgress.isPending,
    TASK_DEFINITIONS,
    ALL_REQUIRED_TASKS
  };
};