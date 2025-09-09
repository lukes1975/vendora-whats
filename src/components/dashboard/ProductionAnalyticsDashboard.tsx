import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Activity,
  RefreshCw,
  Calendar,
  Clock
} from 'lucide-react';
import { VendorAnalytics } from '@/hooks/useProductionDashboardData';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface ProductionAnalyticsDashboardProps {
  analytics: VendorAnalytics | null;
  totalProducts: number;
  refreshAnalytics: () => Promise<void>;
  isLoading?: boolean;
}

export const ProductionAnalyticsDashboard: React.FC<ProductionAnalyticsDashboardProps> = ({
  analytics,
  totalProducts,
  refreshAnalytics,
  isLoading = false
}) => {
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshAnalytics();
      toast({
        title: "Analytics Updated",
        description: "Your analytics data has been refreshed successfully.",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Unable to refresh analytics. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const weeklyGrowth = analytics ? calculateGrowth(
    analytics.orders_last_7d,
    analytics.orders_last_30d - analytics.orders_last_7d
  ) : 0;

  const revenueGrowth = analytics ? calculateGrowth(
    analytics.revenue_last_7d,
    analytics.revenue_last_30d - analytics.revenue_last_7d
  ) : 0;

  if (!analytics && !isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Activity className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">No Analytics Data</h3>
          <p className="text-sm text-muted-foreground text-center mt-2">
            Start receiving orders to see your analytics dashboard
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Real-time insights into your business performance
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing || isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics ? formatCurrency(analytics.total_revenue) : '₦0'}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics?.revenue_last_30d ? 
                `₦${analytics.revenue_last_30d.toLocaleString()} last 30 days` : 
                'No recent revenue'
              }
            </p>
          </CardContent>
        </Card>

        {/* Total Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.total_orders || 0}
            </div>
            <p className="text-xs text-muted-foreground flex items-center">
              <span className="mr-1">
                {analytics?.orders_last_7d || 0} this week
              </span>
              {weeklyGrowth !== 0 && (
                <Badge variant={weeklyGrowth > 0 ? "default" : "secondary"} className="ml-auto">
                  {weeklyGrowth > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                  {Math.abs(weeklyGrowth)}%
                </Badge>
              )}
            </p>
          </CardContent>
        </Card>

        {/* Average Order Value */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics ? formatCurrency(analytics.avg_order_value) : '₦0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Per order average
            </p>
          </CardContent>
        </Card>

        {/* Total Products */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Products</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Products in store
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Performance */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Weekly Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Weekly Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Orders (7 days)</span>
              <span className="font-medium">{analytics?.orders_last_7d || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Revenue (7 days)</span>
              <span className="font-medium">
                {analytics ? formatCurrency(analytics.revenue_last_7d) : '₦0'}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Growth vs Previous Week</span>
              <Badge variant={revenueGrowth > 0 ? "default" : "secondary"}>
                {revenueGrowth > 0 ? '+' : ''}{revenueGrowth}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Monthly Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Orders (30 days)</span>
              <span className="font-medium">{analytics?.orders_last_30d || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Revenue (30 days)</span>
              <span className="font-medium">
                {analytics ? formatCurrency(analytics.revenue_last_30d) : '₦0'}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Last Order</span>
              <span className="text-sm">
                {analytics?.last_order_date ? 
                  format(new Date(analytics.last_order_date), 'MMM dd, yyyy') : 
                  'No orders yet'
                }
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};