import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Eye, Building2, Calendar, User, Phone } from 'lucide-react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface ManualPaymentConfirmation {
  id: string;
  order_id: string;
  amount_kobo: number;
  currency: string;
  customer_reference?: string;
  proof_image_url?: string;
  bank_details: any;
  status: 'pending' | 'confirmed' | 'rejected';
  created_at: string;
  rejected_reason?: string;
  orders_v2: {
    customer_name: string;
    customer_phone: string;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
  };
}

export function ManualPaymentConfirmations() {
  const [confirmations, setConfirmations] = useState<ManualPaymentConfirmation[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [selectedConfirmation, setSelectedConfirmation] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchConfirmations();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('manual-payment-confirmations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'manual_payment_confirmations'
        },
        () => {
          fetchConfirmations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchConfirmations = async () => {
    try {
      const { data, error } = await supabase
        .from('manual_payment_confirmations')
        .select(`
          *,
          orders_v2!inner(
            customer_name,
            customer_phone,
            items
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConfirmations(data as any || []);
    } catch (error) {
      console.error('Error fetching confirmations:', error);
      toast({
        title: "Error",
        description: "Failed to load payment confirmations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async (confirmationId: string) => {
    setProcessingId(confirmationId);
    try {
      const { data, error } = await supabase.functions.invoke('manual-payment-confirmation', {
        body: {
          confirmation_id: confirmationId,
          action: 'confirm'
        }
      });

      if (error) throw error;

      toast({
        title: "Payment Confirmed",
        description: "Payment has been confirmed successfully",
      });
      
      fetchConfirmations();
    } catch (error) {
      console.error('Error confirming payment:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to confirm payment",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectPayment = async () => {
    if (!selectedConfirmation || !rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      });
      return;
    }

    setProcessingId(selectedConfirmation);
    try {
      const { data, error } = await supabase.functions.invoke('manual-payment-confirmation', {
        body: {
          confirmation_id: selectedConfirmation,
          action: 'reject',
          rejection_reason: rejectionReason
        }
      });

      if (error) throw error;

      toast({
        title: "Payment Rejected",
        description: "Payment has been rejected with reason provided",
      });
      
      setShowRejectionDialog(false);
      setRejectionReason('');
      setSelectedConfirmation(null);
      fetchConfirmations();
    } catch (error) {
      console.error('Error rejecting payment:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reject payment",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
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

  const pendingConfirmations = confirmations.filter(c => c.status === 'pending');
  const processedConfirmations = confirmations.filter(c => c.status !== 'pending');

  return (
    <div className="space-y-6">
      {/* Pending Confirmations */}
      {pendingConfirmations.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Pending Payment Confirmations ({pendingConfirmations.length})</h3>
          <div className="grid grid-cols-1 gap-4">
            {pendingConfirmations.map((confirmation) => (
              <Card key={confirmation.id} className="border-amber-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Bank Transfer - ₦{(confirmation.amount_kobo / 100).toLocaleString()}
                    </CardTitle>
                    {getStatusBadge(confirmation.status)}
                  </div>
                  <CardDescription>
                    Submitted {format(new Date(confirmation.created_at), 'PPp')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Customer Details</p>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3" />
                          {confirmation.orders_v2.customer_name}
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          {confirmation.orders_v2.customer_phone}
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Transfer Details</p>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>From: {confirmation.bank_details.account_name}</p>
                        <p>Bank: {confirmation.bank_details.bank_name}</p>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          {confirmation.bank_details.transfer_date}
                        </div>
                      </div>
                    </div>
                  </div>

                  {confirmation.customer_reference && (
                    <div>
                      <p className="text-sm font-medium">Customer Reference</p>
                      <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                        {confirmation.customer_reference}
                      </p>
                    </div>
                  )}

                  {confirmation.proof_image_url && (
                    <div>
                      <p className="text-sm font-medium mb-2">Payment Proof</p>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            View Proof
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Payment Proof</DialogTitle>
                            <DialogDescription>
                              Bank transfer receipt submitted by customer
                            </DialogDescription>
                          </DialogHeader>
                          <div className="flex justify-center">
                            <img 
                              src={confirmation.proof_image_url} 
                              alt="Payment proof" 
                              className="max-w-full max-h-96 object-contain rounded border"
                            />
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-medium mb-2">Items Ordered</p>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      {confirmation.orders_v2.items.map((item, index) => (
                        <div key={index} className="flex justify-between">
                          <span>{item.name} x{item.quantity}</span>
                          <span>₦{(item.price * item.quantity / 100).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() => handleConfirmPayment(confirmation.id)}
                      disabled={processingId === confirmation.id}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      {processingId === confirmation.id ? 'Confirming...' : 'Confirm Payment'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedConfirmation(confirmation.id);
                        setShowRejectionDialog(true);
                      }}
                      disabled={processingId === confirmation.id}
                      className="flex items-center gap-2"
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Recent Processed Confirmations */}
      {processedConfirmations.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Recent Processed Payments</h3>
          <div className="grid grid-cols-1 gap-4">
            {processedConfirmations.slice(0, 10).map((confirmation) => (
              <Card key={confirmation.id} className="opacity-75">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      ₦{(confirmation.amount_kobo / 100).toLocaleString()} - {confirmation.orders_v2.customer_name}
                    </CardTitle>
                    {getStatusBadge(confirmation.status)}
                  </div>
                  <CardDescription>
                    {format(new Date(confirmation.created_at), 'PPp')}
                  </CardDescription>
                </CardHeader>
                {confirmation.status === 'rejected' && confirmation.rejected_reason && (
                  <CardContent>
                    <div className="bg-red-50 border border-red-200 rounded p-3">
                      <p className="text-sm text-red-800">
                        <strong>Rejection Reason:</strong> {confirmation.rejected_reason}
                      </p>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {confirmations.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No manual payment confirmations yet</p>
          </CardContent>
        </Card>
      )}

      {/* Rejection Dialog */}
      <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Payment</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this payment confirmation
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejection-reason">Rejection Reason</Label>
              <Textarea
                id="rejection-reason"
                placeholder="Explain why this payment is being rejected..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectionDialog(false);
                  setRejectionReason('');
                  setSelectedConfirmation(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleRejectPayment}
                disabled={processingId !== null || !rejectionReason.trim()}
              >
                {processingId ? 'Rejecting...' : 'Reject Payment'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}