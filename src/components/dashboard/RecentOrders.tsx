
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";

interface Order {
  id: string;
  customer_name: string;
  status: string;
  created_at: string;
  total_price: number;
}

interface RecentOrdersProps {
  orders: Order[];
}

const RecentOrders = ({ orders }: RecentOrdersProps) => {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
        <CardDescription>Latest customer orders</CardDescription>
      </CardHeader>
      <CardContent>
        {orders && orders.length > 0 ? (
          <div className="space-y-3">
            {orders.map((order) => (
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
  );
};

export default RecentOrders;
