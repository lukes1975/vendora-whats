
import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAutoCreateStore } from "@/hooks/useAutoCreateStore";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useAnalyticsData } from "@/hooks/useAnalyticsData";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { RetentionNudges } from "@/components/dashboard/RetentionNudges";
import NudgeScheduler from "@/components/dashboard/NudgeScheduler";
import { LoadingPage } from "@/components/ui/loading-spinner";
import { AlertTriangle, RefreshCw } from "lucide-react";
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
import EnhancedOnboarding from "@/components/dashboard/EnhancedOnboarding";
import SetupWizard from "@/components/dashboard/SetupWizard";

import { Button } from "@/components/ui/button";

const Dashboard = () => {
  // Setup wizard state
  const [showSetupManually, setShowSetupManually] = useState(false);
  
  // Auto-create store if needed
  useAutoCreateStore();

  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { storeData, storeLoading, storeError, stats, statsLoading, statsError } = useDashboardData();
  const { data: analytics, isLoading: analyticsLoading, error: analyticsError } = useAnalyticsData();
  const { track } = useAnalytics();

  // Track dashboard view
  React.useEffect(() => {
    track('dashboard_viewed');
  }, [track]);

  const storeUrl = storeData?.slug 
    ? `https://vendora.business/${storeData.slug}` 
    : `https://vendora.business/${storeData?.id || 'your-store'}`;

  const hasProducts = (analytics?.totalProducts || 0) > 0;

  // Show setup wizard logic - only show if setup is not completed
  const { data: profileData } = useQuery({
    queryKey: ['profile-setup', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('setup_completed')
        .eq('id', user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
    refetchInterval: 3000, // Check every 3 seconds for completion updates
  });

  const shouldShowSetupWizard = (profileData?.setup_completed === false || profileData?.setup_completed === null) || showSetupManually;

  // Show loading state while critical data is being fetched
  if (storeLoading) {
    return <LoadingPage />;
  }

  // Show error state with retry option
  if (storeError || (statsError && !stats) || (analyticsError && !analytics)) {
    const error = storeError || statsError || analyticsError;
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px] p-4">
          <div className="text-center space-y-4 max-w-md">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
            <h2 className="text-xl font-semibold">Unable to load dashboard</h2>
            <p className="text-muted-foreground">
              {error?.message || 'There was a problem loading your dashboard data.'}
            </p>
            <Button onClick={() => window.location.reload()} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-24">
        {/* Setup Wizard for new users or manual access */}
        {shouldShowSetupWizard && (
          <div className="space-y-4">
            {showSetupManually && (
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Store Setup Guide</h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowSetupManually(false)}
                >
                  Close Setup Guide
                </Button>
              </div>
            )}
            <SetupWizard 
              onTaskComplete={() => {
                // Refresh data when task is completed
                queryClient.invalidateQueries({ queryKey: ['store', user?.id] });
                queryClient.invalidateQueries({ queryKey: ['dashboard-stats', user?.id] });
                queryClient.invalidateQueries({ queryKey: ['profile-setup', user?.id] });
              }}
              onSetupComplete={() => {
                // Hide setup wizard when complete
                setShowSetupManually(false);
                // Refresh all data
                queryClient.invalidateQueries();
              }}
            />
          </div>
        )}

        {/* Regular dashboard content */}
        {!shouldShowSetupWizard && (
          <>
            {/* Announcement Banner */}
            <AnnouncementBanner />

            {/* Retention Nudges */}
            <RetentionNudges />

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
          <ShareStoreCard />
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
        <div className="bg-gradient-to-r from-primary/15 via-purple-500/15 to-orange-500/15 rounded-2xl p-8 text-center border shadow-xl">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-foreground mb-3">
              🏆 Ready to Join the Business Elite?
            </h3>
            <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
              <strong className="text-foreground">Serious sellers deserve serious tools.</strong> Advanced automation, predictive insights, and enterprise-level features. 
              <strong className="text-primary">Be first in line when we open the vault.</strong>
            </p>
            <ProInterestModal>
              <Button size="lg" className="bg-gradient-to-r from-primary via-purple-600 to-orange-600 hover:from-primary/90 hover:via-purple-600/90 hover:to-orange-600/90 shadow-xl text-white border-0">
                Reserve Pro Status
              </Button>
            </ProInterestModal>
          </div>
        </div>

            {/* Quick Actions */}
            <div className="bg-card rounded-2xl shadow-lg border-0">
              <QuickActions />
              <div className="p-4 border-t">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowSetupManually(true)}
                  className="w-full"
                >
                  📋 Open Setup Guide
                </Button>
              </div>
            </div>

        {/* Recent Orders */}
        <div className="bg-card rounded-2xl shadow-lg border-0">
          <RecentOrders orders={stats?.recentOrders || []} />
        </div>


            {/* First Product CTA for users with no products */}
            <FirstProductCTA hasProducts={hasProducts} />
          </>
        )}
      </div>

      {/* Lightweight nudge scheduler - invisible component */}
      <NudgeScheduler />
    </DashboardLayout>
  );
};

export default Dashboard;
