import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, ArrowLeft, Download, Share2, MessageCircle } from 'lucide-react';
import { usePaystack } from '@/hooks/usePaystack';
import { LoadingPage } from '@/components/ui/loading-spinner';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { verifyPayment, formatAmount, clearStoredPaymentData } = usePaystack();

  const reference = searchParams.get('reference') || searchParams.get('trxref');

  useEffect(() => {
    const verifyTransaction = async () => {
      if (!reference) {
        setError('No payment reference found');
        setIsLoading(false);
        return;
      }

      try {
        const result = await verifyPayment(reference);
        setVerificationResult(result);
        
        if (result.verified) {
          // Clear stored payment data on successful verification
          clearStoredPaymentData();
        }
      } catch (err) {
        console.error('Verification error:', err);
        setError('Failed to verify payment');
      } finally {
        setIsLoading(false);
      }
    };

    verifyTransaction();
  }, [reference, verifyPayment, clearStoredPaymentData]);

  if (isLoading) {
    return <LoadingPage />;
  }

  if (error || !verificationResult) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-destructive">Payment Verification Failed</CardTitle>
            <CardDescription>
              {error || 'Unable to verify your payment status'}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link to="/">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Return to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isSuccessful = verificationResult.verified && verificationResult.payment_status === 'success';

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
            isSuccessful 
              ? 'bg-green-100 text-green-600' 
              : 'bg-orange-100 text-orange-600'
          }`}>
            <CheckCircle2 className="h-8 w-8" />
          </div>
          
          <CardTitle className={`text-2xl ${
            isSuccessful ? 'text-green-600' : 'text-orange-600'
          }`}>
            {isSuccessful ? 'Payment Successful!' : 'Payment Status Pending'}
          </CardTitle>
          
          <CardDescription className="text-base">
            {isSuccessful 
              ? 'Your order has been confirmed and will be processed shortly.'
              : 'Your payment is being processed. Please wait a moment or contact support if issues persist.'
            }
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Payment Details */}
          <div className="space-y-4">
            <h3 className="font-semibold">Payment Details</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount Paid</span>
                <span className="font-medium">
                  {formatAmount(verificationResult.amount || 0, verificationResult.currency)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reference</span>
                <span className="font-mono text-sm">{reference}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={isSuccessful ? 'default' : 'secondary'}>
                  {verificationResult.payment_status || 'Pending'}
                </Badge>
              </div>
              
              {verificationResult.customer_email && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="text-sm">{verificationResult.customer_email}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="space-y-3">
            {isSuccessful && (
              <>
                <Button className="w-full" size="lg">
                  <Download className="mr-2 h-4 w-4" />
                  Download Receipt
                </Button>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" size="sm">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                  <Button variant="outline" size="sm">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Contact Seller
                  </Button>
                </div>
              </>
            )}
            
            <Link to="/" className="block">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Return to Home
              </Button>
            </Link>
          </div>

          {/* Support Note */}
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Need help with your order? Contact support with reference: 
              <span className="font-mono font-medium"> {reference}</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}