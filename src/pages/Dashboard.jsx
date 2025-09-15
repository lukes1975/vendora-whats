import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAutoCreateStore } from "@/hooks/useAutoCreateStore";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingPage } from "@/components/ui/loading-spinner";
import { AlertTriangle, RefreshCw } from "lucide-react";
import WelcomeSection from "@/components/dashboard/WelcomeSection";
import MarketplaceStatsCard from "@/components/dashboard/MarketplaceStatsCard";
import AnnouncementBanner from "@/components/dashboard/AnnouncementBanner";
import FirstProductCTA from "@/components/dashboard/FirstProductCTA";
import SimplifiedStatsGrid from "@/components/dashboard/SimplifiedStatsGrid";
import EssentialQuickActions from "@/components/dashboard/EssentialQuickActions";
import LightRecentOrders from "@/components/dashboard/LightRecentOrders";
import SetupWizard from "@/components/dashboard/SetupWizard";
import StudentVerificationBanner from "@/components/marketplace/StudentVerificationBanner";

import { ProductionErrorBoundary } from "@/components/dashboard/ErrorBoundaryDashboard";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  // Setup wizard state
  const [showSetupManually, setShowSetupManually] = useState(false);
  
  // Auto-create store if needed
  useAutoCreateStore();

  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Use dashboard data
  const { 
    storeData, 
    analytics, 
    recentOrders, 
    totalProducts, 
    isLoading, 
    error: dashboardError,
    refreshData
  } = useDashboardData();
  
  const { track } = useAnalytics();

  // Track dashboard view
  React.useEffect(() => {
    track('dashboard_viewed');
  }, [track]);

  const hasProducts = totalProducts > 0;

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
    refetchInterval: 5 * 60 * 1000, // Check every 5 minutes
    staleTime: 15 * 60 * 1000, // Cache profile data for 15 minutes
  });

  const shouldShowSetupWizard = (profileData?.setup_completed === false || profileData?.setup_completed === null) || showSetupManually;

  // Show loading state while critical data is being fetched
  if (isLoading) {
    return <LoadingPage />;
  }

  // Show error state with retry option
  if (dashboardError) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px] p-4">
          <div className="text-center space-y-4 max-w-md">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
            <h2 className="text-xl font-semibold">Unable to load dashboard</h2>
            <p className="text-muted-foreground">
              {dashboardError?.message || 'There was a problem loading your dashboard data.'}
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
    <ProductionErrorBoundary>
      <DashboardLayout>
        <div className="space-y-8 pb-24">
        {/* Student Verification Banner */}
        <StudentVerificationBanner />

        {/* Setup Wizard for new users or manual access */}
        {shouldShowSetupWizard && (
          <div className="space-y-4">
            {showSetupManually && (
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Marketplace Setup Guide</h2>
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
                 if (refreshData) refreshData();
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

            {/* Welcome Header - Updated for Marketplace Focus */}
            <div className="rounded-xl p-6 border">
              <WelcomeSection storeName={storeData?.name} />
            </div>

            {/* Simplified Stats Grid */}
            <SimplifiedStatsGrid 
              analytics={analytics}
              totalProducts={totalProducts}
              isLoading={isLoading}
            />

            {/* Recent Orders */}
            <LightRecentOrders 
              orders={recentOrders}
              isLoading={isLoading}
            />

            {/* Marketplace Stats */}
            <MarketplaceStatsCard />

            {/* Essential Quick Actions */}
            <EssentialQuickActions />

            {/* Setup Guide Access */}
            <div className="text-center">
              <Button 
                variant="outline" 
                onClick={() => setShowSetupManually(true)}
              >
                📋 Open Setup Guide
              </Button>
            </div>

            {/* First Product CTA for users with no products */}
            <FirstProductCTA hasProducts={hasProducts} />
          </>
        )}
      </div>
    </DashboardLayout>
  </ProductionErrorBoundary>
  );
};

export default Dashboard;