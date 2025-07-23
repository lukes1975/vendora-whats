import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SubscriptionPlan {
  plan_name: 'starter' | 'pro';
  billing_cycle: 'monthly' | 'quarterly' | 'yearly';
}

interface CreateSubscriptionResponse {
  success: boolean;
  payment_url?: string;
  reference?: string;
  access_code?: string;
  error?: string;
}

interface VerifySubscriptionResponse {
  success: boolean;
  verified: boolean;
  payment_status?: string;
  subscription_code?: string;
  plan_name?: string;
  billing_cycle?: string;
  next_billing_date?: string;
  error?: string;
}

interface CancelSubscriptionResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export function usePaystackSubscription() {
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const createSubscription = async (subscriptionPlan: SubscriptionPlan): Promise<CreateSubscriptionResponse> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-subscription', {
        body: subscriptionPlan
      });

      if (error) {
        console.error('Subscription creation error:', error);
        throw new Error(error.message || 'Failed to create subscription');
      }

      if (!data.success) {
        throw new Error(data.error || 'Subscription creation failed');
      }

      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Subscription creation failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const verifySubscription = async (reference: string): Promise<VerifySubscriptionResponse> => {
    setIsVerifying(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('verify-subscription', {
        body: { reference }
      });

      if (error) {
        console.error('Subscription verification error:', error);
        throw new Error(error.message || 'Failed to verify subscription');
      }

      if (!data.success) {
        throw new Error(data.error || 'Subscription verification failed');
      }

      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Subscription verification failed';
      toast.error(errorMessage);
      return { success: false, verified: false, error: errorMessage };
    } finally {
      setIsVerifying(false);
    }
  };

  const cancelSubscription = async (): Promise<CancelSubscriptionResponse> => {
    setIsCancelling(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('cancel-subscription');

      if (error) {
        console.error('Subscription cancellation error:', error);
        throw new Error(error.message || 'Failed to cancel subscription');
      }

      if (!data.success) {
        throw new Error(data.error || 'Subscription cancellation failed');
      }

      toast.success(data.message || 'Subscription cancelled successfully');
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Subscription cancellation failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsCancelling(false);
    }
  };

  const processSubscription = async (subscriptionPlan: SubscriptionPlan): Promise<boolean> => {
    try {
      // Create subscription
      const createResult = await createSubscription(subscriptionPlan);
      
      if (!createResult.success || !createResult.payment_url) {
        return false;
      }

      // Redirect to Paystack payment page
      window.open(createResult.payment_url, '_blank');
      
      // Store reference for later verification
      if (createResult.reference) {
        localStorage.setItem('vendora_subscription_reference', createResult.reference);
        localStorage.setItem('vendora_subscription_plan', JSON.stringify(subscriptionPlan));
      }

      return true;
    } catch (error) {
      console.error('Subscription processing error:', error);
      toast.error('Failed to process subscription');
      return false;
    }
  };

  // Helper function to get stored subscription reference
  const getStoredSubscriptionReference = (): string | null => {
    return localStorage.getItem('vendora_subscription_reference');
  };

  // Helper function to get stored subscription plan
  const getStoredSubscriptionPlan = (): SubscriptionPlan | null => {
    const stored = localStorage.getItem('vendora_subscription_plan');
    return stored ? JSON.parse(stored) : null;
  };

  // Helper function to clear stored subscription data
  const clearStoredSubscriptionData = (): void => {
    localStorage.removeItem('vendora_subscription_reference');
    localStorage.removeItem('vendora_subscription_plan');
  };

  // Helper function to format subscription amount for display
  const formatSubscriptionAmount = (plan_name: string, billing_cycle: string): string => {
    const amounts = {
      starter: {
        monthly: 3000,
        quarterly: 9000,
        yearly: 30600
      },
      pro: {
        monthly: 7500,
        quarterly: 22500,
        yearly: 76500
      }
    };

    const amount = amounts[plan_name as keyof typeof amounts]?.[billing_cycle as keyof typeof amounts.starter];
    
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  return {
    createSubscription,
    verifySubscription,
    cancelSubscription,
    processSubscription,
    formatSubscriptionAmount,
    getStoredSubscriptionReference,
    getStoredSubscriptionPlan,
    clearStoredSubscriptionData,
    isLoading,
    isVerifying,
    isCancelling
  };
}