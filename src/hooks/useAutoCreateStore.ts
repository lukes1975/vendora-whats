
import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

export const useAutoCreateStore = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isCreatingStore = useRef(false);

  useEffect(() => {
    const createStoreIfNeeded = async () => {
      if (!user?.id || isCreatingStore.current) return;

      try {
        isCreatingStore.current = true;
        
        // Check if user already has a store
        const { data: existingStore, error: checkError } = await supabase
          .from('stores')
          .select('id')
          .eq('vendor_id', user.id)
          .maybeSingle();

        if (checkError) {
          console.log('Error checking for existing store:', checkError);
          return;
        }

        // If no store exists, create a default one
        if (!existingStore) {
          const defaultStoreName = user.email?.split('@')[0] || 'My Store';
          
          const { error: createError } = await supabase
            .from('stores')
            .insert({
              vendor_id: user.id,
              name: defaultStoreName,
              slug: `${defaultStoreName.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now()}`,
              description: '',
              whatsapp_number: '',
              is_active: true
            });

          if (createError) {
            console.log('Error creating default store:', createError);
          } else {
            console.log('Default store created successfully');
            // Invalidate store-related queries to refetch with new data
            queryClient.invalidateQueries({ queryKey: ['store', user.id] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats', user.id] });
          }
        }
      } catch (error) {
        console.log('Error in auto-create store process:', error);
      } finally {
        isCreatingStore.current = false;
      }
    };

    createStoreIfNeeded();
  }, [user?.id, queryClient]);
};
