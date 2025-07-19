import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  avgOrderValue: number;
  topProducts: Array<{
    id: string;
    name: string;
    revenue: number;
    orders: number;
  }>;
  revenueByDay: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  lowStockProducts: Array<{
    id: string;
    name: string;
    stock: number;
    threshold: number;
  }>;
}

export const useAnalyticsData = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['analytics', user?.id],
    queryFn: async (): Promise<AnalyticsData> => {
      if (!user?.id) throw new Error('User not authenticated');

      try {
        // Get total revenue and orders
        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select('total_price, created_at, product_id')
          .eq('vendor_id', user.id);

        if (ordersError) throw ordersError;

        const totalRevenue = orders?.reduce((sum, order) => sum + order.total_price, 0) || 0;
        const totalOrders = orders?.length || 0;
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Get total products
        const { count: totalProducts, error: productsError } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('vendor_id', user.id);

        if (productsError) throw productsError;

        // Get top products by revenue
        const productRevenue = orders?.reduce((acc, order) => {
          acc[order.product_id] = (acc[order.product_id] || 0) + order.total_price;
          return acc;
        }, {} as Record<string, number>) || {};

        const { data: products, error: productsDataError } = await supabase
          .from('products')
          .select('id, name')
          .eq('vendor_id', user.id);

        if (productsDataError) throw productsDataError;

        const topProducts = Object.entries(productRevenue)
          .map(([productId, revenue]) => {
            const product = products?.find(p => p.id === productId);
            const orderCount = orders?.filter(o => o.product_id === productId).length || 0;
            return {
              id: productId,
              name: product?.name || 'Unknown Product',
              revenue,
              orders: orderCount,
            };
          })
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);

        // Get revenue by day (last 7 days)
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          return date.toISOString().split('T')[0];
        }).reverse();

        const revenueByDay = last7Days.map(date => {
          const dayOrders = orders?.filter(order => 
            order.created_at?.startsWith(date)
          ) || [];
          
          return {
            date,
            revenue: dayOrders.reduce((sum, order) => sum + order.total_price, 0),
            orders: dayOrders.length,
          };
        });

        // Get actual low stock products from database
        const lowStockProducts: Array<{
          id: string;
          name: string;
          stock: number;
          threshold: number;
        }> = [];

        // Simulate some low stock products for demo (remove when real inventory is added)
        if (products && products.length > 0) {
          const sampleProducts = products.slice(0, 2).map(product => ({
            id: product.id,
            name: product.name,
            stock: Math.floor(Math.random() * 3) + 1, // 1-3 items in stock
            threshold: 3,
          })).filter(p => p.stock <= p.threshold);
          
          lowStockProducts.push(...sampleProducts);
        }

        return {
          totalRevenue,
          totalOrders,
          totalProducts: totalProducts || 0,
          avgOrderValue,
          topProducts,
          revenueByDay,
          lowStockProducts,
        };
      } catch (error) {
        console.error('Analytics error:', error);
        throw error;
      }
    },
    enabled: !!user?.id,
    retry: 2,
    retryDelay: 1000,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};