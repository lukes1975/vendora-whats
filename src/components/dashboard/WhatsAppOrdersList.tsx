import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { MessageCircle, ExternalLink, Phone } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface WhatsAppOrder {
  id: string;
  chat_id: string;
  customer_phone: string;
  customer_name: string;
  items: any; // Will be parsed as JSON
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: string;
  payment_link: string | null;
  payment_reference: string | null;
  created_at: string;
  updated_at: string;
}

export const WhatsAppOrdersList: React.FC = () => {
  const [orders, setOrders] = useState<WhatsAppOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders_v2'
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders_v2')
        .select('*')
        .not('chat_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching WhatsApp orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string): "destructive" | "secondary" | "default" | "outline" => {
    switch (status) {
      case 'paid': return 'default';
      case 'pending_payment': return 'outline';
      case 'completed': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          WhatsApp Orders
        </CardTitle>
        <CardDescription>
          Orders placed through WhatsApp chat
        </CardDescription>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No WhatsApp orders yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Orders placed through WhatsApp will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{order.customer_name || 'Unknown'}</span>
                      <span className="text-sm text-muted-foreground">
                        {order.customer_phone}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusColor(order.status)}>
                      {order.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Items:</h4>
                  {Array.isArray(order.items) ? order.items.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.quantity}x {item.name}</span>
                      <span>{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  )) : (
                    <div className="text-sm text-muted-foreground">No items</div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-2 border-t">
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(order.subtotal)}</span>
                    </div>
                    {order.delivery_fee > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Delivery:</span>
                        <span>{formatCurrency(order.delivery_fee)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-medium">
                      <span>Total:</span>
                      <span>{formatCurrency(order.total)}</span>
                    </div>
                  </div>

                  {order.payment_link && order.status === 'pending_payment' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(order.payment_link!, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Payment Link
                    </Button>
                  )}
                </div>

                {order.payment_reference && (
                  <div className="text-xs text-muted-foreground">
                    Reference: {order.payment_reference}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};