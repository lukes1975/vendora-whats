
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
import UsageMeter from "@/components/dashboard/UsageMeter";
import ProInterestModal from "@/components/dashboard/ProInterestModal";
import { UpcomingFeatures } from "@/components/dashboard/UpcomingFeatures";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  // Auto-create store if needed
  useAutoCreateStore();

  const { storeData, storeLoading, stats } = useDashboardData();
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics();

  const storeUrl = storeData?.slug 
    ? `https://vendora.business/${storeData.slug}` 
    : `https://vendora.business/${storeData?.id || 'your-store'}`;

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
      <div className="space-y-8 pb-24">
        {/* Announcement Banner */}
        <AnnouncementBanner />

        {/* Early Access Badge */}
        <div className="flex justify-center sm:justify-start">
          <EarlyAccessBadge />
        </div>

        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-primary/5 via-purple-500/5 to-primary/5 rounded-2xl p-8 border shadow-sm">
          <WelcomeSection storeName={storeData?.name} />
        </div>

        {/* Share Store Card */}
        <div className="bg-card rounded-2xl shadow-lg border-0">
          <ShareStoreCard 
            storeUrl={storeUrl}
            storeName={storeData?.name || 'My Store'}
          />
        </div>

        {/* Enhanced Stats Grid */}
        <div className="bg-gradient-to-r from-card to-accent/5 rounded-2xl p-6 shadow-lg border-0">
          <EnhancedStatsGrid 
            totalRevenue={analytics?.totalRevenue || 0}
            totalOrders={analytics?.totalOrders || 0}
            totalProducts={analytics?.totalProducts || 0}
            avgOrderValue={analytics?.avgOrderValue || 0}
          />
        </div>

        {/* Usage Meter */}
        <div className="bg-card rounded-2xl shadow-lg border-0 p-6">
          <UsageMeter totalProducts={analytics?.totalProducts || 0} />
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-card rounded-2xl shadow-lg border-0 p-6">
            <AnalyticsChart 
              data={analytics?.revenueByDay || []}
              type="revenue"
            />
          </div>
          <div className="bg-card rounded-2xl shadow-lg border-0 p-6">
            <AnalyticsChart 
              data={analytics?.revenueByDay || []}
              type="orders"
            />
          </div>
        </div>

        {/* Top Products and Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-card rounded-2xl shadow-lg border-0">
            <TopProductsCard products={analytics?.topProducts || []} />
          </div>
          <div className="bg-card rounded-2xl shadow-lg border-0">
            <LowStockAlert products={analytics?.lowStockProducts || []} />
          </div>
        </div>

        {/* Pro Interest Collection */}
        <div className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/10 rounded-2xl p-8 text-center border shadow-lg">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-foreground mb-3">
              Ready to scale your professional business?
            </h3>
            <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
              Get notified when Pro features with advanced automation, inventory tracking, and business insights become available.
            </p>
            <ProInterestModal>
              <Button size="lg" className="bg-primary hover:bg-primary/90 shadow-lg">
                Want Pro Business Tools?
              </Button>
            </ProInterestModal>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card rounded-2xl shadow-lg border-0">
          <QuickActions />
        </div>

        {/* Recent Orders */}
        <div className="bg-card rounded-2xl shadow-lg border-0">
          <RecentOrders orders={stats?.recentOrders || []} />
        </div>

        {/* Upcoming Features */}
        <div className="bg-gradient-to-r from-accent/30 to-secondary rounded-2xl shadow-lg border-0">
          <UpcomingFeatures />
        </div>

        {/* First Product CTA for users with no products */}
        <FirstProductCTA hasProducts={hasProducts} />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
