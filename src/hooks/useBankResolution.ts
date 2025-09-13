import { useState, useCallback } from 'react';

// Simplified bank resolution hook  
export const useBankResolution = () => {
  const [bankName, setBankName] = useState<string>('');
  const [banks, setBanks] = useState<any[]>([]);
  const [isResolving, setIsResolving] = useState(false);
  const [isResolvingAccount, setIsResolvingAccount] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolveAccount = useCallback(async (bankCode: string, accountNumber: string) => {
    setIsResolvingAccount(true);
    setError(null);
    
    try {
      // Simplified - just set a default bank name for now
      setBankName('Account Holder');
      return { account_name: 'Account Holder', bank_name: 'Bank Account' };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to resolve bank account';
      setError(message);
      throw new Error(message);
    } finally {
      setIsResolvingAccount(false);
    }
  }, []);

  const resolveBankAccount = useCallback(async (bankCode: string, accountNumber: string) => {
    return resolveAccount(bankCode, accountNumber);
  }, [resolveAccount]);

  const clearBankName = useCallback(() => {
    setBankName('');
    setError(null);
  }, []);

  return {
    bankName,
    banks,
    isResolving,
    isResolvingAccount,
    error,
    resolveAccount,
    resolveBankAccount,
    clearBankName,
  };
};