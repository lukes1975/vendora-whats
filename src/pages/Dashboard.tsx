
import DashboardLayout from "@/components/DashboardLayout";
import { useAutoCreateStore } from "@/hooks/useAutoCreateStore";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useAnalytics } from "@/hooks/useAnalytics";
import WelcomeSection from "@/components/dashboard/WelcomeSection";
import ShareStoreCard from "@/components/dashboard/ShareStoreCard";
import AnnouncementBanner from "@/components/dashboard/AnnouncementBanner";
import FirstProductCTA from "@/components/dashboard/FirstProductCTA";
import EnhancedStatsGrid from "@/components/dashboard/EnhancedStatsGrid";
import AnalyticsChart from "@/components/dashboard/AnalyticsChart";
import TopProductsCard from "@/components/dashboard/TopProductsCard";
import LowStockAlert from "@/components/dashboard/LowStockAlert";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentOrders from "@/components/dashboard/RecentOrders";
import EarlyAccessBadge from "@/components/dashboard/EarlyAccessBadge";

const Dashboard = () => {
  // Auto-create store if needed
  useAutoCreateStore();

  const { storeData, storeLoading, stats } = useDashboardData();
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics();

  const storeUrl = storeData?.slug 
    ? `https://vendora.business/store/${storeData.slug}` 
    : `https://vendora.business/store/${storeData?.id || 'your-store'}`;

  const hasProducts = (analytics?.totalProducts || 0) > 0;

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
      <div className="space-y-6 md:space-y-8 pb-24">
        {/* Announcement Banner */}
        <AnnouncementBanner />

        {/* Early Access Badge */}
        <div className="flex justify-center sm:justify-start">
          <EarlyAccessBadge />
        </div>

        {/* Welcome Header */}
        <WelcomeSection storeName={storeData?.name} />

        {/* Share Store Card */}
        <ShareStoreCard 
          storeUrl={storeUrl}
          storeName={storeData?.name || 'My Store'}
        />

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

        {/* First Product CTA for users with no products */}
        <FirstProductCTA hasProducts={hasProducts} />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
