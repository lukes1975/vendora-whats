
import DashboardLayout from "@/components/DashboardLayout";
import { useAutoCreateStore } from "@/hooks/useAutoCreateStore";
import { useDashboardData } from "@/hooks/useDashboardData";
import WelcomeSection from "@/components/dashboard/WelcomeSection";
import StoreUrlCard from "@/components/dashboard/StoreUrlCard";
import StatsGrid from "@/components/dashboard/StatsGrid";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentOrders from "@/components/dashboard/RecentOrders";

const Dashboard = () => {
  // Auto-create store if needed
  useAutoCreateStore();

  const { storeData, storeLoading, stats, statsLoading } = useDashboardData();

  const storeUrl = storeData?.slug 
    ? `vendora.business/store/${storeData.slug}` 
    : `vendora.business/store/${storeData?.id || 'your-store'}`;

  if (storeLoading) {
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

        {/* Stats Grid */}
        <StatsGrid 
          totalProducts={stats?.totalProducts || 0}
          totalOrders={stats?.totalOrders || 0}
        />

        {/* Quick Actions */}
        <QuickActions />

        {/* Recent Orders */}
        <RecentOrders orders={stats?.recentOrders || []} />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
