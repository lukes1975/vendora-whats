import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { usePaystackSubaccount } from '@/hooks/usePaystackSubaccount';
import { useBankResolution } from '@/hooks/useBankResolution';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface BankAccountFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

export default function BankAccountForm({ open, onOpenChange, onComplete }: BankAccountFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { createSubaccount, checkSubaccountStatus, isCreating } = usePaystackSubaccount();
  const { banks, resolveAccount, isResolvingAccount } = useBankResolution();
  
  const [formData, setFormData] = useState({
    business_name: '',
    bank_code: '',
    account_number: '',
    account_holder_name: '',
    percentage_charge: 2.0
  });
  
  const [resolvedAccount, setResolvedAccount] = useState<any>(null);
  const [subaccountStatus, setSubaccountStatus] = useState<'none' | 'pending' | 'active' | 'failed'>('none');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (open) {
      checkExistingSubaccount();
    }
  }, [open]);

  const checkExistingSubaccount = async () => {
    setIsLoading(true);
    const status = await checkSubaccountStatus();
    setSubaccountStatus(status);
    
    if (status !== 'none') {
      // Load existing bank account details
      try {
        const { data } = await supabase
          .from('bank_accounts')
          .select('*')
          .eq('user_id', user?.id)
          .single();
        
        if (data) {
          setFormData({
            business_name: data.account_holder_name || '',
            bank_code: data.bank_code || '',
            account_number: data.account_number || '',
            account_holder_name: data.account_holder_name || '',
            percentage_charge: 2.0
          });
        }
      } catch (error) {
        console.error('Error loading bank account:', error);
      }
    }
    setIsLoading(false);
  };

  const handleAccountNumberChange = async (value: string) => {
    setFormData(prev => ({ ...prev, account_number: value }));
    setResolvedAccount(null);
    
    if (value.length === 10 && formData.bank_code) {
      try {
        const result = await resolveAccount(value, formData.bank_code);
        if (result.success && result.account_name) {
          setResolvedAccount(result);
          setFormData(prev => ({ ...prev, account_holder_name: result.account_name }));
        }
      } catch (error) {
        console.error('Account resolution error:', error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resolvedAccount) {
      toast({
        title: 'Invalid Account',
        description: 'Please enter a valid account number.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const result = await createSubaccount({
        business_name: formData.business_name,
        settlement_bank: formData.bank_code,
        account_number: formData.account_number,
        percentage_charge: formData.percentage_charge
      });

      if (result.success) {
        toast({
          title: 'Success!',
          description: 'Bank account connected successfully. You can now receive payments.'
        });
        
        onComplete?.();
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Bank account setup error:', error);
    }
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (subaccountStatus === 'active') {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Bank Account Connected
            </DialogTitle>
          </DialogHeader>
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Your bank account is successfully connected and active. You can now receive payments from customers.
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Connect Bank Account</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="business_name">Business Name</Label>
            <Input
              id="business_name"
              value={formData.business_name}
              onChange={(e) => setFormData(prev => ({ ...prev, business_name: e.target.value }))}
              placeholder="Enter your business name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bank">Bank</Label>
            <Select
              value={formData.bank_code}
              onValueChange={(value) => setFormData(prev => ({ ...prev, bank_code: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your bank" />
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
            <Input
              id="account_number"
              value={formData.account_number}
              onChange={(e) => handleAccountNumberChange(e.target.value)}
              placeholder="Enter 10-digit account number"
              maxLength={10}
              required
            />
            {isResolvingAccount && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Verifying account...
              </div>
            )}
            {resolvedAccount && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                Account verified: {resolvedAccount.account_name}
              </div>
            )}
          </div>

          <Alert>
            <AlertDescription>
              We charge a small transaction fee of {formData.percentage_charge}% to maintain the platform and provide support.
            </AlertDescription>
          </Alert>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating || !resolvedAccount}>
              {isCreating ? 'Connecting...' : 'Connect Account'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}