import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";

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
      case 'confirmed': return 'status-success';
      case 'processing': return 'status-info';
      case 'delivered': return 'status-success';
      default: return 'status-warning';
    }
  };

  return (
    <Card className="glass-card border-border/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Recent Orders</CardTitle>
        <CardDescription>Latest customer orders from your store</CardDescription>
      </CardHeader>
      <CardContent>
        {orders && orders.length > 0 ? (
          <div className="space-y-3">
            {orders.slice(0, 3).map((order, index) => (
              <div key={order.id} className="flex items-center justify-between p-4 border border-border/50 rounded-xl hover:border-primary/20 hover:bg-primary/5 transition-all group animate-fade-in" style={{animationDelay: `${index * 100}ms`}}>
                <div className="flex-1 space-y-1">
                  <div className="font-medium text-foreground group-hover:text-primary transition-colors">{order.customer_name}</div>
                  <div className="text-sm text-muted-foreground">₦{order.total_price.toLocaleString()}</div>
                </div>
                <Badge className={`${getStatusColor(order.status || 'pending')} px-3 py-1 text-xs font-medium rounded-full border transition-all`}>
                  {order.status || 'pending'}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 animate-fade-in">
            <div className="h-16 w-16 mx-auto rounded-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center mb-4">
              <ShoppingCart className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-base">No orders yet</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Your first order will appear here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LightRecentOrders;