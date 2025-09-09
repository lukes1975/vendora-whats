import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ShoppingBag, 
  Clock, 
  User, 
  Phone,
  ExternalLink,
  Bell,
  CheckCircle2,
  XCircle,
  Package
} from 'lucide-react';
import { UnifiedOrder } from '@/hooks/useProductionDashboardData';
import { formatDistanceToNow } from 'date-fns';

interface RealTimeOrdersWidgetProps {
  orders: UnifiedOrder[];
  isLoading?: boolean;
}

export const RealTimeOrdersWidget: React.FC<RealTimeOrdersWidgetProps> = ({
  orders,
  isLoading = false
}) => {
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'confirmed':
      case 'completed':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'secondary';
      case 'confirmed':
      case 'completed':
        return 'default';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShoppingBag className="h-5 w-5 mr-2" />
            Recent Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 animate-pulse">
                <div className="w-10 h-10 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
                <div className="w-16 h-6 bg-muted rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShoppingBag className="h-5 w-5 mr-2" />
            Recent Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground">No Orders Yet</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Your recent orders will appear here when customers start buying
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <ShoppingBag className="h-5 w-5 mr-2" />
            Recent Orders
            <Badge variant="secondary" className="ml-2">
              {orders.length}
            </Badge>
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <a href="/dashboard/orders">
              <ExternalLink className="h-4 w-4 mr-1" />
              View All
            </a>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {orders.map((order) => (
              <div 
                key={order.id} 
                className="flex items-start space-x-4 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    {getStatusIcon(order.status)}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm truncate">
                        {order.customer_name}
                      </span>
                    </div>
                    <Badge variant={getStatusVariant(order.status)} className="text-xs">
                      {order.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                    <div className="flex items-center space-x-1">
                      <Phone className="h-3 w-3" />
                      <span className="truncate">{order.customer_phone}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">
                      {formatCurrency(order.total_amount)}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {order.source_table === 'orders_v1' ? 'v1' : 'v2'}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};