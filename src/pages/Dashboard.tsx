
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Store, MessageSquare, Users, ArrowUp, Copy, QrCode, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import { toast } from "sonner";
import QRCodeGenerator from "@/components/QRCodeGenerator";

interface StoreData {
  id: string;
  name: string;
  slug: string;
  description: string;
  whatsapp_number: string;
}

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  recentOrders: Array<{
    id: string;
    customer_name: string;
    status: string;
    created_at: string;
    total_price: number;
  }>;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [showQR, setShowQR] = useState(false);

  // Fetch store data
  const { data: storeData, isLoading: storeLoading } = useQuery({
    queryKey: ['store', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('vendor_id', user.id)
        .single();
      
      if (error) {
        console.log('Store fetch error:', error);
        return null;
      }
      
      return data as StoreData;
    },
    enabled: !!user?.id,
  });

  // Fetch dashboard statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats', user?.id],
    queryFn: async (): Promise<DashboardStats> => {
      if (!user?.id) throw new Error('No user');

      // Get total products count
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('vendor_id', user.id);

      // Get total orders count
      const { count: ordersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('vendor_id', user.id);

      // Get recent orders
      const { data: recentOrders } = await supabase
        .from('orders')
        .select('id, customer_name, status, created_at, total_price')
        .eq('vendor_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      return {
        totalProducts: productsCount || 0,
        totalOrders: ordersCount || 0,
        recentOrders: recentOrders || [],
      };
    },
    enabled: !!user?.id,
  });

  const storeUrl = storeData?.slug 
    ? `vendora.business/store/${storeData.slug}` 
    : `vendora.business/store/${storeData?.id || 'your-store'}`;

  const copyStoreUrl = () => {
    navigator.clipboard.writeText(`https://${storeUrl}`);
    toast.success("Store URL copied to clipboard!");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-emerald-100 text-emerald-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (storeLoading || statsLoading) {
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Welcome back{storeData?.name ? `, ${storeData.name}!` : '!'}
              </h1>
              <p className="text-gray-600 mt-1">Here's what's happening with your store today.</p>
            </div>
            <Link to="/dashboard/products/new">
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </Link>
          </div>

          {/* Store URL Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Your Store URL</CardTitle>
              <CardDescription>Share this link with your customers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 p-3 bg-gray-50 rounded-lg font-mono text-sm break-all">
                  https://{storeUrl}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyStoreUrl}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowQR(!showQR)}
                  >
                    <QrCode className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href={`https://${storeUrl}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
              {showQR && (
                <div className="flex justify-center pt-4 border-t">
                  <QRCodeGenerator url={`https://${storeUrl}`} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalProducts || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Products in your store
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Orders received
              </p>
            </CardContent>
          </Card>

          <Card className="sm:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Store Status</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Active</div>
              <p className="text-xs text-muted-foreground mt-1">
                Your store is live
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to manage your store</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <Link to="/dashboard/products/new">
                <Button variant="outline" className="w-full justify-start h-auto py-3">
                  <Plus className="mr-2 h-4 w-4" />
                  <span>Add New Product</span>
                </Button>
              </Link>
              <Link to="/dashboard/storefront">
                <Button variant="outline" className="w-full justify-start h-auto py-3">
                  <Store className="mr-2 h-4 w-4" />
                  <span>View Your Store</span>
                </Button>
              </Link>
              <Link to="/dashboard/settings">
                <Button variant="outline" className="w-full justify-start h-auto py-3">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  <span>WhatsApp Settings</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest customer orders</CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.recentOrders && stats.recentOrders.length > 0 ? (
              <div className="space-y-3">
                {stats.recentOrders.map((order) => (
                  <div key={order.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 border rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium">{order.customer_name}</div>
                      <div className="text-sm text-gray-600">
                        ${order.total_price.toFixed(2)} • {formatDate(order.created_at)}
                      </div>
                    </div>
                    <Badge className={`w-fit ${getStatusColor(order.status || 'pending')}`}>
                      {order.status || 'pending'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="mx-auto h-12 w-12 mb-3 opacity-50" />
                <p>No orders yet</p>
                <p className="text-sm">Orders will appear here when customers place them</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
