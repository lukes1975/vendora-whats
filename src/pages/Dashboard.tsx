
import DashboardLayout from "@/components/DashboardLayout";
import { useAutoCreateStore } from "@/hooks/useAutoCreateStore";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useAnalytics } from "@/hooks/useAnalytics";
import WelcomeSection from "@/components/dashboard/WelcomeSection";
import StoreUrlCard from "@/components/dashboard/StoreUrlCard";
import EnhancedStatsGrid from "@/components/dashboard/EnhancedStatsGrid";
import AnalyticsChart from "@/components/dashboard/AnalyticsChart";
import TopProductsCard from "@/components/dashboard/TopProductsCard";
import LowStockAlert from "@/components/dashboard/LowStockAlert";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentOrders from "@/components/dashboard/RecentOrders";

const Dashboard = () => {
  // Auto-create store if needed
  useAutoCreateStore();

  const { storeData, storeLoading, stats } = useDashboardData();
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics();

  const storeUrl = storeData?.slug 
    ? `vendora.business/store/${storeData.slug}` 
    : `vendora.business/store/${storeData?.id || 'your-store'}`;

  if (storeLoading || analyticsLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 md:space-y-8">
        {/* Welcome Header */}
        <div className="space-y-4">
          <WelcomeSection storeName={storeData?.name} />
          <StoreUrlCard storeUrl={storeUrl} />
        </div>

        {/* Enhanced Stats Grid */}
        <EnhancedStatsGrid 
          totalRevenue={analytics?.totalRevenue || 0}
          totalOrders={analytics?.totalOrders || 0}
          totalProducts={analytics?.totalProducts || 0}
          avgOrderValue={analytics?.avgOrderValue || 0}
        />

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnalyticsChart 
            data={analytics?.revenueByDay || []}
            type="revenue"
          />
          <AnalyticsChart 
            data={analytics?.revenueByDay || []}
            type="orders"
          />
        </div>

        {/* Top Products and Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopProductsCard products={analytics?.topProducts || []} />
          <LowStockAlert products={analytics?.lowStockProducts || []} />
        </div>

        {/* Quick Actions */}
        <QuickActions />

        {/* Recent Orders */}
        <RecentOrders orders={stats?.recentOrders || []} />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
