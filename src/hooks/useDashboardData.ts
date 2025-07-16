
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface StoreData {
  id: string;
  name: string;
  slug: string;
  description: string;
  whatsapp_number: string;
}

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  recentOrders: Array<{
    id: string;
    customer_name: string;
    status: string;
    created_at: string;
    total_price: number;
  }>;
}

export const useDashboardData = () => {
  const { user } = useAuth();

  // Fetch store data
  const { data: storeData, isLoading: storeLoading, error: storeError } = useQuery({
    queryKey: ['store', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('vendor_id', user.id)
        .maybeSingle();
      
      if (error) {
        console.log('Store fetch error:', error);
        throw error;
      }
      
      return data as StoreData | null;
    },
    enabled: !!user?.id,
    retry: 2,
    retryDelay: 1000,
  });

  // Fetch dashboard statistics
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['dashboard-stats', user?.id, storeData?.id],
    queryFn: async (): Promise<DashboardStats> => {
      if (!user?.id) throw new Error('User not authenticated');

      try {
        // Get total products count
        const { count: productsCount, error: productsError } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('vendor_id', user.id);

        if (productsError) throw productsError;

        // Get total orders count
        const { count: ordersCount, error: ordersError } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('vendor_id', user.id);

        if (ordersError) throw ordersError;

        // Get recent orders
        const { data: recentOrders, error: recentOrdersError } = await supabase
          .from('orders')
          .select('id, customer_name, status, created_at, total_price')
          .eq('vendor_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (recentOrdersError) throw recentOrdersError;

        return {
          totalProducts: productsCount || 0,
          totalOrders: ordersCount || 0,
          recentOrders: recentOrders || [],
        };
      } catch (error) {
        console.error('Dashboard stats error:', error);
        throw error;
      }
    },
    enabled: !!user?.id && !storeLoading,
    retry: 2,
    retryDelay: 1000,
  });

  return {
    storeData,
    storeLoading,
    storeError,
    stats,
    statsLoading,
    statsError,
  };
};
