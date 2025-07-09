
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

export const useAnalytics = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['analytics', user?.id],
    queryFn: async (): Promise<AnalyticsData> => {
      if (!user?.id) throw new Error('No user');

      // Get total revenue and orders
      const { data: orders } = await supabase
        .from('orders')
        .select('total_price, created_at, product_id')
        .eq('vendor_id', user.id);

      const totalRevenue = orders?.reduce((sum, order) => sum + order.total_price, 0) || 0;
      const totalOrders = orders?.length || 0;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Get total products
      const { count: totalProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('vendor_id', user.id);

      // Get top products by revenue
      const productRevenue = orders?.reduce((acc, order) => {
        acc[order.product_id] = (acc[order.product_id] || 0) + order.total_price;
        return acc;
      }, {} as Record<string, number>) || {};

      const { data: products } = await supabase
        .from('products')
        .select('id, name')
        .eq('vendor_id', user.id);

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

      // Mock low stock products (we'll implement actual stock tracking later)
      const lowStockProducts = products?.slice(0, 3).map(product => ({
        id: product.id,
        name: product.name,
        stock: Math.floor(Math.random() * 10) + 1,
        threshold: 5,
      })) || [];

      return {
        totalRevenue,
        totalOrders,
        totalProducts: totalProducts || 0,
        avgOrderValue,
        topProducts,
        revenueByDay,
        lowStockProducts,
      };
    },
    enabled: !!user?.id,
  });
};
