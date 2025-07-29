import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Bank {
  name: string;
  code: string;
  slug: string;
}

interface ResolvedAccount {
  account_number: string;
  account_name: string;
  bank_id: number;
}

export function useBankResolution() {
  const [isLoadingBanks, setIsLoadingBanks] = useState(false);
  const [isResolvingAccount, setIsResolvingAccount] = useState(false);
  const [banks, setBanks] = useState<Bank[]>([]);

  const fetchBanks = async (): Promise<Bank[]> => {
    if (banks.length > 0) return banks;

    setIsLoadingBanks(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-banks');
      
      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      setBanks(data.data);
      return data.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch banks';
      toast.error(errorMessage);
      return [];
    } finally {
      setIsLoadingBanks(false);
    }
  };

  const resolveAccount = async (accountNumber: string, bankCode: string): Promise<ResolvedAccount | null> => {
    if (!accountNumber || !bankCode) {
      toast.error('Please provide account number and select a bank');
      return null;
    }

    setIsResolvingAccount(true);
    try {
      const { data, error } = await supabase.functions.invoke('resolve-bank-account', {
        body: { account_number: accountNumber, bank_code: bankCode }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      return data.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to verify account';
      toast.error(errorMessage);
      return null;
    } finally {
      setIsResolvingAccount(false);
    }
  };

  return {
    banks,
    fetchBanks,
    resolveAccount,
    isLoadingBanks,
    isResolvingAccount
  };
}