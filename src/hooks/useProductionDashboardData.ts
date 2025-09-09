import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useCallback } from "react";

export interface UnifiedOrder {
  id: string;
  vendor_id: string;
  store_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  total_amount: number;
  status: string;
  created_at: string;
  updated_at: string;
  source_table: string;
}

export interface VendorAnalytics {
  vendor_id: string;
  total_orders: number;
  total_revenue: number;
  avg_order_value: number;
  orders_last_30d: number;
  revenue_last_30d: number;
  orders_last_7d: number;
  revenue_last_7d: number;
  last_order_date: string;
}

export interface ProductionDashboardData {
  storeData: any;
  unifiedOrders: UnifiedOrder[];
  analytics: VendorAnalytics | null;
  recentOrders: UnifiedOrder[];
  totalProducts: number;
  isLoading: boolean;
  error: any;
  refreshAnalytics: () => Promise<void>;
}

export const useProductionDashboardData = (): ProductionDashboardData => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Store data query
  const { data: storeData, isLoading: storeLoading, error: storeError } = useQuery({
    queryKey: ['production-store', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('stores')
        .select('id, name, slug, description, whatsapp_number, is_active, logo_url')
        .eq('vendor_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000,
    retry: 2,
  });

  // Unified orders query using secure function
  const { data: unifiedOrders, isLoading: ordersLoading, error: ordersError } = useQuery({
    queryKey: ['production-orders', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .rpc('get_unified_orders', { vendor_id_param: user.id });
      
      if (error) throw error;
      return data as UnifiedOrder[];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  // Analytics query using secure function
  const { data: analytics, isLoading: analyticsLoading, error: analyticsError } = useQuery({
    queryKey: ['production-analytics', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .rpc('get_vendor_analytics', { vendor_id_param: user.id });
      
      if (error) throw error;
      return data && data.length > 0 ? data[0] as VendorAnalytics : null;
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000,
    retry: 2,
  });

  // Products count query
  const { data: totalProducts, isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ['production-products-count', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { count, error } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('vendor_id', user.id)
        .eq('status', 'active');
      
      if (error) throw error;
      return count || 0;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  // Real-time subscription for order changes
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('order-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `vendor_id=eq.${user.id}`
        },
        () => {
          // Invalidate and refetch orders when changes occur
          queryClient.invalidateQueries({ queryKey: ['production-orders', user.id] });
          queryClient.invalidateQueries({ queryKey: ['production-analytics', user.id] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders_v2',
          filter: `vendor_id=eq.${user.id}`
        },
        () => {
          // Invalidate and refetch orders when changes occur
          queryClient.invalidateQueries({ queryKey: ['production-orders', user.id] });
          queryClient.invalidateQueries({ queryKey: ['production-analytics', user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  // Performance logging
  useEffect(() => {
    if (!user?.id) return;

    const logPerformance = async () => {
      try {
        const loadTime = performance.now();
        await supabase.rpc('log_performance_metric', {
          metric_type_param: 'dashboard_load_time',
          metric_value_param: loadTime,
          tags_param: { user_id: user.id, timestamp: new Date().toISOString() }
        });
      } catch (error) {
        console.warn('Performance logging failed:', error);
      }
    };

    const timer = setTimeout(logPerformance, 1000);
    return () => clearTimeout(timer);
  }, [user?.id]);

  // Refresh analytics function
  const refreshAnalytics = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      // Refresh materialized view
      await supabase.rpc('refresh_vendor_analytics');
      
      // Invalidate analytics cache
      await queryClient.invalidateQueries({ queryKey: ['production-analytics', user.id] });
    } catch (error) {
      console.error('Failed to refresh analytics:', error);
      throw error;
    }
  }, [user?.id, queryClient]);

  // Derive recent orders
  const recentOrders = unifiedOrders 
    ? unifiedOrders
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)
    : [];

  const isLoading = storeLoading || ordersLoading || analyticsLoading || productsLoading;
  const error = storeError || ordersError || analyticsError || productsError;

  return {
    storeData,
    unifiedOrders: unifiedOrders || [],
    analytics,
    recentOrders,
    totalProducts: totalProducts || 0,
    isLoading,
    error,
    refreshAnalytics,
  };
};