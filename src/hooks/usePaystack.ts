import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PaymentData {
  amount: number; // Amount in naira (will be converted to kobo)
  email: string;
  currency?: string;
  productId?: string;
  productName?: string;
  storeId?: string;
  customerName?: string;
  customerPhone?: string;
  orderId?: string;
  metadata?: Record<string, any>;
}

interface PaymentResponse {
  success: boolean;
  payment_url?: string;
  reference?: string;
  access_code?: string;
  order_id?: string;
  error?: string;
}

interface VerificationResponse {
  success: boolean;
  verified: boolean;
  payment_status?: string;
  amount?: number;
  currency?: string;
  customer_email?: string;
  reference?: string;
  error?: string;
}

export function usePaystack() {
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const initializePayment = async (paymentData: PaymentData): Promise<PaymentResponse> => {
    setIsLoading(true);
    
    try {
      // Convert amount from naira to kobo (multiply by 100)
      const amountInKobo = Math.round(paymentData.amount * 100);
      
      const { data, error } = await supabase.functions.invoke('paystack-payment', {
        body: {
          amount: amountInKobo,
          email: paymentData.email,
          currency: paymentData.currency || 'NGN',
          callback_url: `${window.location.origin}/payment-success`,
          metadata: {
            product_id: paymentData.productId,
            product_name: paymentData.productName,
            store_id: paymentData.storeId,
            customer_name: paymentData.customerName,
            customer_phone: paymentData.customerPhone,
            order_id: paymentData.orderId,
            ...paymentData.metadata
          }
        }
      });

      if (error) {
        console.error('Payment initialization error:', error);
        // Extract more specific error information
        const errorMsg = error.message || 'Failed to initialize payment';
        const details = error.details || error.message;
        
        // Log detailed error for debugging
        console.error('Payment error details:', { error, details });
        
        throw new Error(errorMsg);
      }

      if (!data.success) {
        const errorMsg = data.error || 'Payment initialization failed';
        console.error('Payment failed with error:', errorMsg);
        throw new Error(errorMsg);
      }

      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment initialization failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyPayment = async (reference: string): Promise<VerificationResponse> => {
    setIsVerifying(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { reference }
      });

      if (error) {
        console.error('Payment verification error:', error);
        throw new Error(error.message || 'Failed to verify payment');
      }

      if (!data.success) {
        throw new Error(data.error || 'Payment verification failed');
      }

      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment verification failed';
      toast.error(errorMessage);
      return { success: false, verified: false, error: errorMessage };
    } finally {
      setIsVerifying(false);
    }
  };

  const processPayment = async (paymentData: PaymentData): Promise<boolean> => {
    try {
      // Initialize payment
      const initResult = await initializePayment(paymentData);
      
      if (!initResult.success || !initResult.payment_url) {
        return false;
      }

      // Redirect to Paystack payment page
      window.open(initResult.payment_url, '_blank');
      
      // Store reference for later verification
      if (initResult.reference) {
        localStorage.setItem('vendora_payment_reference', initResult.reference);
        localStorage.setItem('vendora_order_id', initResult.order_id || '');
      }

      return true;
    } catch (error) {
      console.error('Payment processing error:', error);
      toast.error('Failed to process payment');
      return false;
    }
  };

  // Helper function to format amount for display
  const formatAmount = (amount: number, currency: string = 'NGN'): string => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Helper function to get stored payment reference
  const getStoredPaymentReference = (): string | null => {
    return localStorage.getItem('vendora_payment_reference');
  };

  // Helper function to clear stored payment data
  const clearStoredPaymentData = (): void => {
    localStorage.removeItem('vendora_payment_reference');
    localStorage.removeItem('vendora_order_id');
  };

  return {
    initializePayment,
    verifyPayment,
    processPayment,
    formatAmount,
    getStoredPaymentReference,
    clearStoredPaymentData,
    isLoading,
    isVerifying
  };
}