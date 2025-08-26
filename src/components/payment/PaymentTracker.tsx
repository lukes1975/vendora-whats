import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CheckCircle, Clock, XCircle, CreditCard, Building2, Truck, Package } from 'lucide-react';
import { format } from 'date-fns';

interface PaymentStatus {
  id: string;
  status: string;
  payment_method?: string;
  payment_reference?: string;
  total: number;
  currency: string;
  created_at: string;
  updated_at: string;
  customer_name: string;
  customer_phone: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  manualConfirmation?: {
    status: string;
    bank_details: any;
    proof_image_url?: string;
    confirmed_at?: string;
    rejected_reason?: string;
  };
  deliveryAssignment?: {
    status: string;
    rider_name?: string;
    estimated_duration_minutes?: number;
    accepted_at?: string;
    completed_at?: string;
  };
}

interface PaymentTrackerProps {
  orderId: string;
  showDeliveryStatus?: boolean;
}

export function PaymentTracker({ orderId, showDeliveryStatus = true }: PaymentTrackerProps) {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaymentStatus();
    
    // Set up real-time subscription for order updates
    const channel = supabase
      .channel('order-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders_v2',
          filter: `id=eq.${orderId}`
        },
        () => {
          fetchPaymentStatus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  const fetchPaymentStatus = async () => {
    try {
      // Fetch order with related data
      const { data: orderData, error } = await supabase
        .from('orders_v2')
        .select(`
          *,
          manual_payment_confirmations(
            status,
            bank_details,
            proof_image_url,
            confirmed_at,
            rejected_reason
          ),
          delivery_assignments(
            status,
            estimated_duration_minutes,
            accepted_at,
            completed_at,
            rider_sessions(rider_name)
          )
        `)
        .eq('id', orderId)
        .maybeSingle();

      if (error) throw error;
      if (!orderData) throw new Error('Order not found');

      const status: PaymentStatus = {
        id: orderData.id,
        status: orderData.status,
        payment_method: orderData.payment_method,
        payment_reference: orderData.payment_reference,
        total: orderData.total,
        currency: orderData.currency,
        created_at: orderData.created_at,
        updated_at: orderData.updated_at,
        customer_name: orderData.customer_name,
        customer_phone: orderData.customer_phone,
        items: Array.isArray(orderData.items) ? orderData.items.map((item: any) => ({
          name: item.name || '',
          quantity: item.quantity || 0,
          price: item.price || 0
        })) : [],
        manualConfirmation: orderData.manual_payment_confirmations?.[0] ? {
          status: (orderData.manual_payment_confirmations[0] as any).status || 'pending',
          bank_details: (orderData.manual_payment_confirmations[0] as any).bank_details || {},
          proof_image_url: (orderData.manual_payment_confirmations[0] as any).proof_image_url || undefined,
          confirmed_at: (orderData.manual_payment_confirmations[0] as any).confirmed_at || undefined,
          rejected_reason: (orderData.manual_payment_confirmations[0] as any).rejected_reason || undefined
        } : undefined,
        deliveryAssignment: orderData.delivery_assignments?.[0] ? {
          ...orderData.delivery_assignments[0],
          rider_name: orderData.delivery_assignments[0].rider_sessions?.rider_name
        } : undefined
      };

      setPaymentStatus(status);
    } catch (error) {
      console.error('Error fetching payment status:', error);
      toast.error('Failed to load payment status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'confirmed':
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
      case 'preparing':
      case 'dispatched':
      case 'in_transit':
        return <Clock className="h-5 w-5 text-amber-500" />;
      case 'cancelled':
      case 'rejected':
      case 'delivery_cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variant = status.toLowerCase().includes('paid') || 
                   status.toLowerCase().includes('confirmed') || 
                   status.toLowerCase().includes('delivered') ? 'default' : 
                   status.toLowerCase().includes('cancelled') || 
                   status.toLowerCase().includes('rejected') ? 'destructive' : 'secondary';
    
    return <Badge variant={variant}>{status.replace('_', ' ').toUpperCase()}</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (!paymentStatus) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">Payment status not found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Order Summary
            {getStatusBadge(paymentStatus.status)}
          </CardTitle>
          <CardDescription>
            Order placed on {format(new Date(paymentStatus.created_at), 'PPP')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Customer</p>
              <p className="text-sm text-muted-foreground">{paymentStatus.customer_name}</p>
              <p className="text-sm text-muted-foreground">{paymentStatus.customer_phone}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Total Amount</p>
              <p className="text-lg font-semibold">
                {paymentStatus.currency} {(paymentStatus.total / 100).toLocaleString()}
              </p>
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-sm font-medium mb-2">Items Ordered</p>
            <div className="space-y-2">
              {paymentStatus.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{item.name} x{item.quantity}</span>
                  <span>₦{(item.price * item.quantity / 100).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            {getStatusIcon(paymentStatus.status)}
            <div>
              <p className="font-medium">
                {paymentStatus.status.replace('_', ' ').charAt(0).toUpperCase() + 
                 paymentStatus.status.replace('_', ' ').slice(1)}
              </p>
              <p className="text-sm text-muted-foreground">
                Last updated: {format(new Date(paymentStatus.updated_at), 'PPp')}
              </p>
            </div>
          </div>

          {paymentStatus.payment_reference && (
            <div>
              <p className="text-sm font-medium">Payment Reference</p>
              <p className="text-sm font-mono bg-muted p-2 rounded">
                {paymentStatus.payment_reference}
              </p>
            </div>
          )}

          {paymentStatus.manualConfirmation && (
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-4 w-4" />
                <span className="font-medium">Bank Transfer Details</span>
                {getStatusBadge(paymentStatus.manualConfirmation.status)}
              </div>
              
              {paymentStatus.manualConfirmation.proof_image_url && (
                <div className="mt-2">
                  <p className="text-sm font-medium">Payment Proof</p>
                  <img 
                    src={paymentStatus.manualConfirmation.proof_image_url} 
                    alt="Payment proof" 
                    className="mt-1 max-w-xs rounded border"
                  />
                </div>
              )}

              {paymentStatus.manualConfirmation.rejected_reason && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                  <p className="text-sm text-red-800">
                    <strong>Rejection Reason:</strong> {paymentStatus.manualConfirmation.rejected_reason}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delivery Status */}
      {showDeliveryStatus && paymentStatus.deliveryAssignment && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Delivery Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              {getStatusIcon(paymentStatus.deliveryAssignment.status)}
              <div>
                <p className="font-medium">
                  {paymentStatus.deliveryAssignment.status.replace('_', ' ').charAt(0).toUpperCase() + 
                   paymentStatus.deliveryAssignment.status.replace('_', ' ').slice(1)}
                </p>
                {paymentStatus.deliveryAssignment.rider_name && (
                  <p className="text-sm text-muted-foreground">
                    Rider: {paymentStatus.deliveryAssignment.rider_name}
                  </p>
                )}
              </div>
            </div>

            {paymentStatus.deliveryAssignment.estimated_duration_minutes && (
              <p className="text-sm text-muted-foreground">
                Estimated delivery time: {paymentStatus.deliveryAssignment.estimated_duration_minutes} minutes
              </p>
            )}

            <div className="grid grid-cols-1 gap-2 text-sm">
              {paymentStatus.deliveryAssignment.accepted_at && (
                <div className="flex items-center gap-2">
                  <Package className="h-3 w-3" />
                  <span>Accepted: {format(new Date(paymentStatus.deliveryAssignment.accepted_at), 'PPp')}</span>
                </div>
              )}
              {paymentStatus.deliveryAssignment.completed_at && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>Delivered: {format(new Date(paymentStatus.deliveryAssignment.completed_at), 'PPp')}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}