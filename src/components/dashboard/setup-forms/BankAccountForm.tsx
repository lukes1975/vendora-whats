import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { CreditCard, Building, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useBankResolution } from '@/hooks/useBankResolution';

interface BankAccountFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

const BankAccountForm: React.FC<BankAccountFormProps> = ({
  open,
  onOpenChange,
  onComplete
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [creatingSubaccount, setCreatingSubaccount] = useState(false);
  const [subaccountStatus, setSubaccountStatus] = useState<'none' | 'pending' | 'active' | 'failed'>('none');
  const [bankAccount, setBankAccount] = useState({
    account_number: '',
    bank_name: '',
    bank_code: '',
    account_holder_name: ''
  });
  const [isVerified, setIsVerified] = useState(false);
  const { banks, fetchBanks, resolveAccount, isLoadingBanks, isResolvingAccount } = useBankResolution();

  useEffect(() => {
    if (open && user) {
      loadExistingBankAccount();
      fetchBanks();
    }
  }, [open, user]);

  const loadExistingBankAccount = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data && !error) {
        setBankAccount({
          account_number: data.account_number,
          bank_name: data.bank_name,
          bank_code: data.bank_code || '',
          account_holder_name: data.account_holder_name
        });
        setSubaccountStatus(data.subaccount_code ? 'active' : 'none');
        setIsVerified(!!data.account_holder_name);
      }
    } catch (error) {
      // No existing bank account, which is fine
      console.log('No existing bank account found');
    }
  };

  const createSubaccount = async () => {
    if (!user) return;

    setCreatingSubaccount(true);
    setSubaccountStatus('pending');
    
    try {
      // Get store name for business name
      const { data: storeData } = await supabase
        .from('stores')
        .select('name')
        .eq('vendor_id', user.id)
        .single();

      const businessName = storeData?.name || bankAccount.account_holder_name;

      const { data, error } = await supabase.functions.invoke('create-paystack-subaccount', {
        body: {
          business_name: businessName,
          settlement_bank: bankAccount.bank_name,
          account_number: bankAccount.account_number,
          percentage_charge: 0.5 // 0.5% charge
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      setSubaccountStatus('active');
      toast.success('Payment account created successfully! You can now receive payments directly.');
    } catch (error) {
      console.error('Error creating subaccount:', error);
      setSubaccountStatus('failed');
      toast.error('Failed to create payment account. Please try again.');
    } finally {
      setCreatingSubaccount(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Verify account before saving
      if (!isVerified) {
        toast.error('Please verify your account details first');
        return;
      }

      const { error } = await supabase
        .from('bank_accounts')
        .upsert({
          user_id: user.id,
          account_number: bankAccount.account_number,
          bank_name: bankAccount.bank_name,
          bank_code: bankAccount.bank_code,
          account_holder_name: bankAccount.account_holder_name,
          is_active: true
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast.success('Bank account details saved successfully!');
      
      // Auto-create subaccount if not exists
      if (subaccountStatus === 'none') {
        await createSubaccount();
      }
      
      onComplete?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving bank account:', error);
      toast.error('Failed to save bank account details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Bank Account Details
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Subaccount Status Alert */}
          {subaccountStatus === 'active' && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Payment account is active. Customers can pay directly to your bank account.
              </AlertDescription>
            </Alert>
          )}
          
          {subaccountStatus === 'failed' && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                Failed to create payment account. Save your details and try again.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="bank_name">Select Bank</Label>
            <Select 
              value={bankAccount.bank_code} 
              onValueChange={(value) => {
                const selectedBank = banks.find(bank => bank.code === value);
                setBankAccount(prev => ({
                  ...prev,
                  bank_code: value,
                  bank_name: selectedBank?.name || ''
                }));
                setIsVerified(false);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={isLoadingBanks ? "Loading banks..." : "Select your bank"} />
              </SelectTrigger>
              <SelectContent>
                {banks.map((bank) => (
                  <SelectItem key={bank.code} value={bank.code}>
                    {bank.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="account_number">Account Number</Label>
            <div className="flex gap-2">
              <Input
                id="account_number"
                value={bankAccount.account_number}
                onChange={(e) => {
                  setBankAccount(prev => ({
                    ...prev,
                    account_number: e.target.value
                  }));
                  setIsVerified(false);
                }}
                placeholder="Enter your account number"
                required
              />
              <Button 
                type="button"
                variant="outline"
                onClick={async () => {
                  if (!bankAccount.account_number || !bankAccount.bank_code) {
                    toast.error('Please enter account number and select bank');
                    return;
                  }
                  
                  const resolved = await resolveAccount(bankAccount.account_number, bankAccount.bank_code);
                  if (resolved) {
                    setBankAccount(prev => ({
                      ...prev,
                      account_holder_name: resolved.account_name
                    }));
                    setIsVerified(true);
                    toast.success('Account verified successfully!');
                  }
                }}
                disabled={isResolvingAccount || !bankAccount.account_number || !bankAccount.bank_code}
              >
                {isResolvingAccount ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify'}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="account_holder_name">Account Holder Name</Label>
            <Input
              id="account_holder_name"
              value={bankAccount.account_holder_name}
              onChange={(e) => setBankAccount(prev => ({
                ...prev,
                account_holder_name: e.target.value
              }))}
              placeholder={isVerified ? "Verified account name" : "Enter account holder's full name"}
              required
              disabled={isVerified}
              className={isVerified ? "bg-green-50 border-green-200" : ""}
            />
            {isVerified && (
              <div className="flex items-center gap-1 text-green-600 text-sm">
                <CheckCircle2 className="h-3 w-3" />
                Account verified
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || creatingSubaccount || !isVerified}
              className="flex-1"
            >
              {loading ? 'Saving...' : 
               creatingSubaccount ? 'Setting up payments...' : 
               isVerified ? 'Save & Setup Payments' : 'Verify Account First'}
            </Button>
          </div>
          
          {/* Retry subaccount creation if failed */}
          {subaccountStatus === 'failed' && (
            <Button 
              type="button"
              variant="outline"
              onClick={createSubaccount}
              disabled={creatingSubaccount}
              className="w-full mt-2"
            >
              {creatingSubaccount ? 'Retrying...' : 'Retry Payment Setup'}
            </Button>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BankAccountForm;