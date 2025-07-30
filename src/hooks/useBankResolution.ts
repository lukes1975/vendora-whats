import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BankAccount {
  account_number: string;
  account_name: string;
  bank_code: string;
}

interface Bank {
  name: string;
  code: string;
  slug: string;
}

export const useBankResolution = () => {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [isLoadingBanks, setIsLoadingBanks] = useState(false);
  const [isResolvingAccount, setIsResolvingAccount] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBanks = async (): Promise<void> => {
    try {
      setIsLoadingBanks(true);
      setError(null);

      const { data, error } = await supabase.functions.invoke('get-banks');

      if (error) throw error;

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to fetch banks');
      }

      setBanks(data.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch banks';
      setError(errorMessage);
      console.error('Error fetching banks:', err);
      setBanks([]); // Set empty array on error
    } finally {
      setIsLoadingBanks(false);
    }
  };

  const resolveAccount = async (accountNumber: string, bankCode: string): Promise<BankAccount | null> => {
    try {
      setIsResolvingAccount(true);
      setError(null);

      const { data, error } = await supabase.functions.invoke('resolve-bank-account', {
        body: {
          account_number: accountNumber,
          bank_code: bankCode
        }
      });

      if (error) throw error;

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to resolve account');
      }

      return {
        account_number: data.data.account_number,
        account_name: data.data.account_name,
        bank_code: bankCode
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resolve account';
      setError(errorMessage);
      console.error('Error resolving account:', err);
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
    isResolvingAccount,
    error
  };
};