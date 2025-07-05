
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
  const { data: storeData, isLoading: storeLoading } = useQuery({
    queryKey: ['store', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('vendor_id', user.id)
        .single();
      
      if (error) {
        console.log('Store fetch error:', error);
        return null;
      }
      
      return data as StoreData;
    },
    enabled: !!user?.id,
  });

  // Fetch dashboard statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats', user?.id],
    queryFn: async (): Promise<DashboardStats> => {
      if (!user?.id) throw new Error('No user');

      // Get total products count
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('vendor_id', user.id);

      // Get total orders count
      const { count: ordersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('vendor_id', user.id);

      // Get recent orders
      const { data: recentOrders } = await supabase
        .from('orders')
        .select('id, customer_name, status, created_at, total_price')
        .eq('vendor_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      return {
        totalProducts: productsCount || 0,
        totalOrders: ordersCount || 0,
        recentOrders: recentOrders || [],
      };
    },
    enabled: !!user?.id,
  });

  return {
    storeData,
    storeLoading,
    stats,
    statsLoading,
  };
};
