import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { usePaystackSubscription } from '@/hooks/usePaystackSubscription';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Crown, 
  CreditCard, 
  Calendar, 
  TrendingUp,
  Check,
  X,
  Loader2,
  Star
} from 'lucide-react';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billing_cycle: 'monthly' | 'quarterly' | 'yearly';
  features: string[];
  limits: {
    products: number;
    whatsapp_messages: number;
    ai_credits: number;
    bulk_messages: number;
  };
}

const plans: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 3000,
    billing_cycle: 'monthly',
    features: [
      'Unlimited products',
      'Custom branding',
      'WhatsApp integration',
      'Basic analytics',
      '500 AI credits/month'
    ],
    limits: {
      products: -1, // unlimited
      whatsapp_messages: 1000,
      ai_credits: 500,
      bulk_messages: 100
    }
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 7500,
    billing_cycle: 'monthly',
    features: [
      'Everything in Starter',
      'Advanced analytics',
      'Bulk messaging',
      'Priority support',
      '2000 AI credits/month',
      'API access'
    ],
    limits: {
      products: -1, // unlimited
      whatsapp_messages: 5000,
      ai_credits: 2000,
      bulk_messages: 1000
    }
  }
];

export const SubscriptionManagement: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { 
    processSubscription, 
    verifySubscription, 
    cancelSubscription,
    formatSubscriptionAmount,
    isLoading,
    isVerifying,
    isCancelling
  } = usePaystackSubscription();

  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [usage, setUsage] = useState({
    ai_credits_used: 245,
    whatsapp_messages_sent: 156,
    bulk_messages_sent: 23
  });
  const [loadingSubscription, setLoadingSubscription] = useState(true);

  useEffect(() => {
    loadCurrentSubscription();
    loadUsageData();
  }, [user]);

  const loadCurrentSubscription = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('subscription_status, plan, billing_cycle, next_billing_date, paystack_subscription_code')
        .eq('id', user.id)
        .single();

      if (data && !error) {
        setCurrentSubscription(data);
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoadingSubscription(false);
    }
  };

  const loadUsageData = async () => {
    // Load usage data from analytics or usage tracking tables
    // This is placeholder data
    setUsage({
      ai_credits_used: 245,
      whatsapp_messages_sent: 156,
      bulk_messages_sent: 23
    });
  };

  const handleSubscribe = async (planId: string, billingCycle: 'monthly' | 'quarterly' | 'yearly') => {
    try {
      const success = await processSubscription({
        plan_name: planId as 'starter' | 'pro',
        billing_cycle: billingCycle
      });

      if (success) {
        toast({
          title: 'Subscription Started',
          description: 'Please complete payment in the new tab that opened',
        });
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: 'Error',
        description: 'Failed to start subscription process',
        variant: 'destructive'
      });
    }
  };

  const handleCancelSubscription = async () => {
    if (!currentSubscription?.paystack_subscription_code) return;

    try {
      const result = await cancelSubscription();
      if (result.success) {
        toast({
          title: 'Subscription Cancelled',
          description: 'Your subscription will remain active until the end of the current billing period',
        });
        loadCurrentSubscription();
      }
    } catch (error) {
      console.error('Cancel subscription error:', error);
    }
  };

  const getCurrentPlan = () => {
    if (!currentSubscription || currentSubscription.subscription_status === 'inactive') {
      return null;
    }
    return plans.find(p => p.id === currentSubscription.plan);
  };

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0; // unlimited
    return Math.min((used / limit) * 100, 100);
  };

  if (loadingSubscription) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const currentPlan = getCurrentPlan();
  const isActive = currentSubscription?.subscription_status === 'active';

  return (
    <div className="space-y-6">
      {/* Current Subscription Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Current Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isActive && currentPlan ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    {currentPlan.name} Plan
                    <Badge variant="default">Active</Badge>
                  </h3>
                  <p className="text-muted-foreground">
                    ₦{currentPlan.price.toLocaleString()}/{currentSubscription.billing_cycle}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Next billing</p>
                  <p className="font-medium">
                    {new Date(currentSubscription.next_billing_date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Usage Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>AI Credits</span>
                    <span>{usage.ai_credits_used}/{currentPlan.limits.ai_credits}</span>
                  </div>
                  <Progress 
                    value={getUsagePercentage(usage.ai_credits_used, currentPlan.limits.ai_credits)} 
                    className="h-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>WhatsApp Messages</span>
                    <span>{usage.whatsapp_messages_sent}/{currentPlan.limits.whatsapp_messages}</span>
                  </div>
                  <Progress 
                    value={getUsagePercentage(usage.whatsapp_messages_sent, currentPlan.limits.whatsapp_messages)} 
                    className="h-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Bulk Messages</span>
                    <span>{usage.bulk_messages_sent}/{currentPlan.limits.bulk_messages}</span>
                  </div>
                  <Progress 
                    value={getUsagePercentage(usage.bulk_messages_sent, currentPlan.limits.bulk_messages)} 
                    className="h-2"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <CreditCard className="h-4 w-4 mr-2" />
                  View Billing History
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleCancelSubscription}
                  disabled={isCancelling}
                >
                  {isCancelling ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <X className="h-4 w-4 mr-2" />
                  )}
                  Cancel Subscription
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="bg-muted rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Crown className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Active Subscription</h3>
              <p className="text-muted-foreground mb-4">
                You're currently on the free plan with limited features.
              </p>
              <Button>
                <TrendingUp className="h-4 w-4 mr-2" />
                Upgrade to Pro
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = currentPlan?.id === plan.id;
          
          return (
            <Card key={plan.id} className={`relative ${isCurrentPlan ? 'ring-2 ring-primary' : ''}`}>
              {plan.id === 'pro' && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    <Star className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="space-y-2">
                  <div className="text-3xl font-bold">
                    ₦{plan.price.toLocaleString()}
                  </div>
                  <p className="text-muted-foreground">per {plan.billing_cycle}</p>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="space-y-2 pt-4 border-t">
                  <h4 className="font-medium text-sm">Monthly Limits:</h4>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div>• AI Credits: {plan.limits.ai_credits.toLocaleString()}</div>
                    <div>• WhatsApp Messages: {plan.limits.whatsapp_messages.toLocaleString()}</div>
                    <div>• Bulk Messages: {plan.limits.bulk_messages.toLocaleString()}</div>
                  </div>
                </div>

                {isCurrentPlan ? (
                  <Button className="w-full" disabled>
                    Current Plan
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Button 
                      className="w-full"
                      onClick={() => handleSubscribe(plan.id, 'monthly')}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CreditCard className="h-4 w-4 mr-2" />
                      )}
                      Subscribe Monthly
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleSubscribe(plan.id, 'yearly')}
                      disabled={isLoading}
                    >
                      Subscribe Yearly (Save 15%)
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Billing Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Billing Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Payment Method</h4>
                <p className="text-sm text-muted-foreground">Paystack (Card ending in ****)</p>
              </div>
              <Button variant="outline" size="sm">
                Update
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Next Payment</h4>
                <p className="text-2xl font-bold">₦{currentPlan?.price.toLocaleString() || '0'}</p>
                <p className="text-sm text-muted-foreground">
                  Due {currentSubscription?.next_billing_date 
                    ? new Date(currentSubscription.next_billing_date).toLocaleDateString()
                    : 'N/A'
                  }
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Total Paid</h4>
                <p className="text-2xl font-bold">₦45,000</p>
                <p className="text-sm text-muted-foreground">
                  Since January 2024
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};