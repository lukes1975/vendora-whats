import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RecurringChargeData {
  email: string;
  amount: number; // Amount in naira (will be converted to kobo)
  currency?: string;
  reference?: string;
  subaccount?: string;
  metadata?: Record<string, any>;
}

interface ChargeResponse {
  success: boolean;
  reference?: string;
  status?: string;
  gateway_response?: string;
  amount?: number;
  currency?: string;
  transaction_date?: string;
  channel?: string;
  error?: string;
}

export function usePaystackRecurring() {
  const [isLoading, setIsLoading] = useState(false);

  const chargeReturningCustomer = async (
    authorizationCode: string, 
    chargeData: RecurringChargeData
  ): Promise<ChargeResponse> => {
    setIsLoading(true);
    
    try {
      // Convert amount from naira to kobo
      const amountInKobo = Math.round(chargeData.amount * 100);

      const { data, error } = await supabase.functions.invoke('charge-returning-customer', {
        body: {
          authorization_code: authorizationCode,
          email: chargeData.email,
          amount: amountInKobo,
          currency: chargeData.currency || 'NGN',
          reference: chargeData.reference,
          subaccount: chargeData.subaccount,
          metadata: chargeData.metadata
        }
      });

      if (error) {
        console.error('Recurring charge error:', error);
        throw new Error(error.message || 'Failed to charge customer');
      }

      if (!data.success) {
        throw new Error(data.error || 'Charge failed');
      }

      toast.success('Payment charged successfully!');
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to charge customer';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    chargeReturningCustomer,
    isLoading
  };
}