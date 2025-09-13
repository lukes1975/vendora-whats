import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Package, Truck, CheckCircle, Phone } from "lucide-react";
import { formatCurrencyKobo } from "@/modules/order-flow/hooks/useWhatsAppCheckout";

interface Order {
  id: string;
  status: string;
  customer_name: string;
  customer_phone: string;
  customer_address: any;
  items: any[];
  total: number;
  delivery_fee: number;
  subtotal: number;
  currency: string;
  eta_minutes: number | null;
  distance_km: number | null;
  created_at: string;
  meta: any;
  store: {
    name: string;
    whatsapp_number: string | null;
  };
  delivery_assignments: Array<{
    id: string;
    status: string;
    pickup_lat: number;
    pickup_lng: number;
    delivery_lat: number;
    delivery_lng: number;
    rider_session: {
      rider_name: string;
      phone: string;
      current_lat: number | null;
      current_lng: number | null;
    } | null;
  }>;
}

const statusConfig = {
  pending_payment: { label: "Awaiting Payment", color: "orange", icon: Package },
  paid: { label: "Payment Confirmed", color: "blue", icon: CheckCircle },
  assigning_rider: { label: "Finding Rider", color: "blue", icon: Truck },
  rider_assigned: { label: "Rider Assigned", color: "green", icon: Truck },
  pickup: { label: "Pickup in Progress", color: "green", icon: Truck },
  enroute: { label: "Out for Delivery", color: "green", icon: Truck },
  delivered: { label: "Delivered", color: "green", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "red", icon: Package },
};

export default function OrderTracking() {
  const { trackingCode } = useParams<{ trackingCode: string }>();
  const [refreshInterval, setRefreshInterval] = useState<number | false>(false);

  const { data: order, isLoading, error, refetch } = useQuery({
    queryKey: ['order-tracking', trackingCode],
    queryFn: async () => {
      if (!trackingCode) throw new Error('No tracking code provided');
      
      const { data, error } = await supabase
        .from('orders_v2')
        .select(`
          *,
          stores!inner(name, whatsapp_number),
          delivery_assignments(
            id,
            status,
            pickup_lat,
            pickup_lng,
            delivery_lat,
            delivery_lng,
            rider_sessions(
              rider_name,
              phone,
              current_lat,
              current_lng
            )
          )
        `)
        .eq('meta->>tracking_code', trackingCode)
        .single();

      if (error) throw error;
      return data as any as Order;
    },
    enabled: !!trackingCode,
    refetchInterval: refreshInterval,
  });

  // Set up real-time updates for active orders
  useEffect(() => {
    if (!order) return;

    const isActive = ['paid', 'assigning_rider', 'rider_assigned', 'pickup', 'enroute'].includes(order.status);
    setRefreshInterval(isActive ? 5000 : false); // Refresh every 5 seconds for active orders

    if (isActive) {
      // Subscribe to real-time updates
      const channel = supabase
        .channel('order-updates')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'orders_v2',
            filter: `id=eq.${order.id}`,
          },
          () => {
            refetch();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'delivery_assignments',
            filter: `order_id=eq.${order.id}`,
          },
          () => {
            refetch();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [order, refetch]);

  useEffect(() => {
    // SEO setup
    document.title = `Track Order ${trackingCode} - Vendora`;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Track your order in real-time with live delivery updates.");
    }
  }, [trackingCode]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center px-4">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Order Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The tracking code "{trackingCode}" doesn't match any orders.
          </p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  const currentStatus = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending_payment;
  const StatusIcon = currentStatus.icon;
  const activeDelivery = order.delivery_assignments?.[0];

  const handleContactStore = () => {
    if (order.store.whatsapp_number) {
      const message = `Hi! I'm tracking my order ${trackingCode} and wanted to check on the status.`;
      const whatsappUrl = `https://wa.me/${order.store.whatsapp_number.replace(/[^\d]/g, '')}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Track Your Order</h1>
          <p className="text-muted-foreground">Order #{trackingCode}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Order Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <StatusIcon className="h-5 w-5" />
                Order Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Current Status</span>
                <Badge variant={currentStatus.color as any}>
                  {currentStatus.label}
                </Badge>
              </div>
              
              {order.eta_minutes && order.status !== 'delivered' && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Estimated delivery: {order.eta_minutes} minutes</span>
                </div>
              )}

              {order.distance_km && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>Distance: {order.distance_km} km</span>
                </div>
              )}

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Order Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Store:</span>
                    <span className="font-medium">{order.store.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Customer:</span>
                    <span>{order.customer_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phone:</span>
                    <span>{order.customer_phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Address:</span>
                    <span className="text-right">{order.customer_address?.address}</span>
                  </div>
                </div>
              </div>

              {order.store.whatsapp_number && (
                <Button
                  onClick={handleContactStore}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Contact Store
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.items.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium">
                      {formatCurrencyKobo(item.price * item.quantity, order.currency)}
                    </p>
                  </div>
                ))}
                
                <div className="border-t pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>{formatCurrencyKobo(order.subtotal, order.currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Delivery:</span>
                    <span>{formatCurrencyKobo(order.delivery_fee, order.currency)}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>{formatCurrencyKobo(order.total, order.currency)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Delivery Map */}
        {activeDelivery && activeDelivery.rider_session && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Live Delivery Tracking
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Rider: {activeDelivery.rider_session.rider_name} ({activeDelivery.rider_session.phone})
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-96 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                <p className="text-muted-foreground">Live tracking coming soon</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Order Timeline */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Order Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div className="flex-1">
                  <p className="font-medium">Order Created</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              
              {order.status !== 'pending_payment' && (
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-medium">Payment Confirmed</p>
                    <p className="text-sm text-muted-foreground">
                      Payment processed successfully
                    </p>
                  </div>
                </div>
              )}

              {['rider_assigned', 'pickup', 'enroute', 'delivered'].includes(order.status) && (
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-medium">Rider Assigned</p>
                    <p className="text-sm text-muted-foreground">
                      {activeDelivery?.rider_session?.rider_name} is handling your delivery
                    </p>
                  </div>
                </div>
              )}

              {['pickup', 'enroute', 'delivered'].includes(order.status) && (
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-medium">Pickup Started</p>
                    <p className="text-sm text-muted-foreground">
                      Rider is collecting your order
                    </p>
                  </div>
                </div>
              )}

              {['enroute', 'delivered'].includes(order.status) && (
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-medium">Out for Delivery</p>
                    <p className="text-sm text-muted-foreground">
                      Your order is on the way
                    </p>
                  </div>
                </div>
              )}

              {order.status === 'delivered' && (
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-medium text-green-700">Delivered</p>
                    <p className="text-sm text-muted-foreground">
                      Your order has been successfully delivered
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}