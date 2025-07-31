import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";

interface Order {
  id: string;
  customer_name: string;
  status: string;
  total_price: number;
}

interface LightRecentOrdersProps {
  orders: Order[];
}

const LightRecentOrders = ({ orders }: LightRecentOrdersProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'processing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'delivered': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Orders</CardTitle>
        <CardDescription>Latest customer orders</CardDescription>
      </CardHeader>
      <CardContent>
        {orders && orders.length > 0 ? (
          <div className="space-y-2">
            {orders.slice(0, 3).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-2 border rounded">
                <div>
                  <div className="font-medium text-sm">{order.customer_name}</div>
                  <div className="text-xs text-muted-foreground">
                    ₦{order.total_price.toLocaleString()}
                  </div>
                </div>
                <Badge className={`text-xs ${getStatusColor(order.status || 'pending')}`}>
                  {order.status || 'pending'}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <MessageSquare className="mx-auto h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">No orders yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LightRecentOrders;