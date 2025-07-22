import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, CreditCard, Shield, Clock } from 'lucide-react';
import { usePaystack } from '@/hooks/usePaystack';
import { validatePhoneNumber } from '@/utils/security';
import { toast } from 'sonner';

interface PaymentButtonProps {
  productId: string;
  productName: string;
  price: number;
  storeId: string;
  storeName?: string;
  currency?: string;
  disabled?: boolean;
  className?: string;
}

export default function PaymentButton({
  productId,
  productName,
  price,
  storeId,
  storeName,
  currency = 'NGN',
  disabled = false,
  className
}: PaymentButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [quantity] = useState(1); // For now, keep quantity as 1
  
  const { processPayment, formatAmount, isLoading } = usePaystack();

  const totalAmount = price * quantity;

  const handlePayment = async () => {
    // Validate form
    if (!customerName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (!customerEmail.trim() || !customerEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (customerPhone && !validatePhoneNumber(customerPhone)) {
      toast.error('Please enter a valid phone number with country code (e.g., +234)');
      return;
    }

    const paymentData = {
      amount: totalAmount,
      email: customerEmail.trim(),
      currency,
      productId,
      productName,
      storeId,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim() || undefined
    };

    const success = await processPayment(paymentData);
    
    if (success) {
      setIsOpen(false);
      toast.success('Redirecting to payment page...');
      
      // Reset form
      setCustomerName('');
      setCustomerEmail('');
      setCustomerPhone('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          className={className}
          disabled={disabled}
          size="lg"
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Buy Now - {formatAmount(price, currency)}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Complete Your Purchase
          </DialogTitle>
          <DialogDescription>
            Fill in your details to proceed with secure payment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium">{productName}</p>
                  {storeName && (
                    <p className="text-sm text-muted-foreground">from {storeName}</p>
                  )}
                </div>
                <Badge variant="outline">Qty: {quantity}</Badge>
              </div>
              
              <Separator />
              
              <div className="flex justify-between items-center">
                <span className="font-medium">Total</span>
                <span className="font-bold text-lg">{formatAmount(totalAmount, currency)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Customer Details Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customer-name">Full Name *</Label>
              <Input
                id="customer-name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer-email">Email Address *</Label>
              <Input
                id="customer-email"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="john@example.com"
                required
              />
              <p className="text-xs text-muted-foreground">
                Payment receipt will be sent to this email
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer-phone">Phone Number (Optional)</Label>
              <Input
                id="customer-phone"
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+234 8012 345 6789"
              />
              <p className="text-xs text-muted-foreground">
                Include country code for international numbers
              </p>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-800">
              <Shield className="h-4 w-4" />
              <span className="text-sm font-medium">Secure Payment</span>
            </div>
            <p className="text-xs text-green-700 mt-1">
              Powered by Paystack. Your payment information is encrypted and secure.
            </p>
          </div>

          {/* Payment Button */}
          <Button 
            onClick={handlePayment}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Pay {formatAmount(totalAmount, currency)} Now
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            By clicking "Pay Now", you agree to proceed with the purchase. 
            You will be redirected to Paystack for secure payment processing.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}