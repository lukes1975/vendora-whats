import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ImageUpload from '@/components/ImageUpload';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';

interface ManualPaymentUploadProps {
  orderId: string;
  totalAmount: number;
  vendorBankDetails?: {
    accountName: string;
    accountNumber: string;
    bankName: string;
  };
  onPaymentSubmitted?: () => void;
}

export function ManualPaymentUpload({ 
  orderId, 
  totalAmount, 
  vendorBankDetails,
  onPaymentSubmitted 
}: ManualPaymentUploadProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    accountName: '',
    accountNumber: '',
    bankName: '',
    transferDate: new Date().toISOString().split('T')[0],
    customerReference: '',
    proofImageUrl: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.accountName || !formData.accountNumber || !formData.bankName) {
      toast.error('Please fill in all bank transfer details');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('manual-payment-confirmation', {
        body: {
          order_id: orderId,
          amount_kobo: totalAmount,
          customer_reference: formData.customerReference,
          proof_image_url: formData.proofImageUrl,
          bank_details: {
            account_name: formData.accountName,
            account_number: formData.accountNumber,
            bank_name: formData.bankName,
            transfer_date: formData.transferDate
          }
        }
      });

      if (error) throw error;

      toast.success('Payment proof submitted successfully!');
      setSubmitted(true);
      onPaymentSubmitted?.();
    } catch (error) {
      console.error('Error submitting payment proof:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit payment proof');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Payment Proof Submitted</h3>
          <p className="text-muted-foreground text-center">
            Your payment proof has been submitted successfully. The vendor will review and confirm your payment.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Bank Transfer Proof
        </CardTitle>
        <CardDescription>
          Submit proof of your bank transfer payment for verification
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {vendorBankDetails && (
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Transfer to this account:</h4>
            <div className="text-sm space-y-1">
              <p><strong>Account Name:</strong> {vendorBankDetails.accountName}</p>
              <p><strong>Account Number:</strong> {vendorBankDetails.accountNumber}</p>
              <p><strong>Bank:</strong> {vendorBankDetails.bankName}</p>
              <p><strong>Amount:</strong> ₦{(totalAmount / 100).toLocaleString()}</p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            Please ensure you transfer the exact amount and upload clear proof of payment
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="accountName">Your Account Name</Label>
              <Input
                id="accountName"
                placeholder="Account name you transferred from"
                value={formData.accountName}
                onChange={(e) => setFormData(prev => ({ ...prev, accountName: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="accountNumber">Your Account Number</Label>
              <Input
                id="accountNumber"
                placeholder="Account number you transferred from"
                value={formData.accountNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bankName">Your Bank</Label>
              <Input
                id="bankName"
                placeholder="Name of your bank"
                value={formData.bankName}
                onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="transferDate">Transfer Date</Label>
              <Input
                id="transferDate"
                type="date"
                value={formData.transferDate}
                onChange={(e) => setFormData(prev => ({ ...prev, transferDate: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="customerReference">Reference/Description (Optional)</Label>
            <Input
              id="customerReference"
              placeholder="Any reference or note from your transfer"
              value={formData.customerReference}
              onChange={(e) => setFormData(prev => ({ ...prev, customerReference: e.target.value }))}
            />
          </div>

          <div>
            <Label>Upload Payment Proof</Label>
            <ImageUpload
              onImageUpload={(url) => setFormData(prev => ({ ...prev, proofImageUrl: url }))}
              onImageRemove={() => setFormData(prev => ({ ...prev, proofImageUrl: '' }))}
              currentImageUrl={formData.proofImageUrl}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Upload a screenshot or photo of your bank transfer receipt
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Payment Proof'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}