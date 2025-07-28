import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SubaccountData {
  business_name: string;
  settlement_bank: string;
  account_number: string;
  percentage_charge?: number;
}

interface SubaccountResponse {
  success: boolean;
  subaccount_code?: string;
  error?: string;
}

export function usePaystackSubaccount() {
  const [isCreating, setIsCreating] = useState(false);

  const createSubaccount = async (data: SubaccountData): Promise<SubaccountResponse> => {
    setIsCreating(true);
    
    try {
      const { data: result, error } = await supabase.functions.invoke('create-paystack-subaccount', {
        body: {
          business_name: data.business_name,
          settlement_bank: data.settlement_bank,
          account_number: data.account_number,
          percentage_charge: data.percentage_charge || 0.5
        }
      });

      if (error) {
        console.error('Subaccount creation error:', error);
        throw new Error(error.message || 'Failed to create payment account');
      }

      if (!result.success) {
        throw new Error(result.error || 'Failed to create payment account');
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create payment account';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsCreating(false);
    }
  };

  const checkSubaccountStatus = async (): Promise<'none' | 'pending' | 'active' | 'failed'> => {
    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('subaccount_code, subaccount_status')
        .single();

      if (error || !data) return 'none';
      
      if (data.subaccount_code && data.subaccount_status === 'active') {
        return 'active';
      } else if (data.subaccount_status === 'pending') {
        return 'pending';
      } else if (data.subaccount_status === 'failed') {
        return 'failed';
      }
      
      return 'none';
    } catch (error) {
      console.error('Error checking subaccount status:', error);
      return 'none';
    }
  };

  return {
    createSubaccount,
    checkSubaccountStatus,
    isCreating
  };
}