import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CustomerAuthorization {
  customer_email: string;
  authorization_code: string;
  card_type: string;
  last_4: string;
  exp_month: string;
  exp_year: string;
  bank: string;
}

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

  const getCustomerAuthorization = async (email: string): Promise<CustomerAuthorization | null> => {
    try {
      const { data, error } = await supabase
        .from('customer_authorizations')
        .select('*')
        .eq('customer_email', email)
        .single();

      if (error || !data) {
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching customer authorization:', error);
      return null;
    }
  };

  const chargeReturningCustomer = async (chargeData: RecurringChargeData): Promise<ChargeResponse> => {
    setIsLoading(true);
    
    try {
      // Get customer's saved authorization
      const authorization = await getCustomerAuthorization(chargeData.email);
      if (!authorization) {
        throw new Error('No saved payment method found for this customer');
      }

      // Convert amount from naira to kobo
      const amountInKobo = Math.round(chargeData.amount * 100);

      const { data, error } = await supabase.functions.invoke('charge-returning-customer', {
        body: {
          authorization_code: authorization.authorization_code,
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

  const hasPaymentMethod = async (email: string): Promise<boolean> => {
    const authorization = await getCustomerAuthorization(email);
    return authorization !== null;
  };

  const getPaymentMethodInfo = async (email: string): Promise<{
    cardType: string;
    last4: string;
    bank: string;
  } | null> => {
    const authorization = await getCustomerAuthorization(email);
    if (!authorization) return null;

    return {
      cardType: authorization.card_type,
      last4: authorization.last_4,
      bank: authorization.bank
    };
  };

  return {
    chargeReturningCustomer,
    hasPaymentMethod,
    getPaymentMethodInfo,
    isLoading
  };
}