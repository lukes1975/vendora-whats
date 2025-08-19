import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Zap, 
  MessageSquare, 
  CreditCard, 
  TrendingUp,
  Calendar,
  AlertTriangle,
  Plus,
  History
} from 'lucide-react';

interface CreditUsage {
  ai_credits_used: number;
  ai_credits_limit: number;
  whatsapp_messages_sent: number;
  whatsapp_messages_limit: number;
  bulk_messages_sent: number;
  bulk_messages_limit: number;
}

interface CreditTransaction {
  id: string;
  type: 'purchase' | 'usage' | 'refund';
  category: 'ai_credits' | 'whatsapp_messages' | 'bulk_messages';
  amount: number;
  description: string;
  created_at: string;
}

export const CreditManagement: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [usage, setUsage] = useState<CreditUsage>({
    ai_credits_used: 245,
    ai_credits_limit: 1000,
    whatsapp_messages_sent: 156,
    whatsapp_messages_limit: 500,
    bulk_messages_sent: 23,
    bulk_messages_limit: 100
  });
  
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);

  useEffect(() => {
    if (user) {
      loadCreditData();
    }
  }, [user]);

  const loadCreditData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Load current usage and limits
      // For now, using mock data since credit columns don't exist yet in profiles table
      // TODO: Add these columns to profiles table in a future migration
      const mockUsage = {
        ai_credits_used: 245,
        ai_credits_limit: 1000,
        whatsapp_messages_sent: 156,
        whatsapp_messages_limit: 500,
        bulk_messages_sent: 23,
        bulk_messages_limit: 100
      };
      setUsage(mockUsage);

      // Load recent transactions (mock data for now)
      setTransactions([
        {
          id: '1',
          type: 'purchase',
          category: 'ai_credits',
          amount: 500,
          description: 'Credit purchase - 500 AI credits',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          type: 'usage',
          category: 'whatsapp_messages',
          amount: -25,
          description: 'WhatsApp bulk messaging campaign',
          created_at: new Date(Date.now() - 86400000).toISOString()
        }
      ]);
    } catch (error) {
      console.error('Error loading credit data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load credit information',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const purchaseCredits = async (type: 'ai_credits' | 'whatsapp_messages' | 'bulk_messages', amount: number) => {
    if (!user) return;

    setIsLoading(true);
    try {
      // This would integrate with Paystack for credit purchases
      // For now, simulate a purchase
      const creditPrices = {
        ai_credits: 10, // ₦10 per AI credit
        whatsapp_messages: 5, // ₦5 per WhatsApp message
        bulk_messages: 20 // ₦20 per bulk message
      };

      const totalCost = amount * creditPrices[type];
      
      toast({
        title: 'Purchase Initiated',
        description: `Redirecting to payment for ₦${totalCost.toLocaleString()} (${amount} ${type.replace('_', ' ')})`,
      });

      // Update local state optimistically
      setUsage(prev => ({
        ...prev,
        [`${type}_limit`]: prev[`${type}_limit` as keyof CreditUsage] + amount
      }));

    } catch (error) {
      console.error('Error purchasing credits:', error);
      toast({
        title: 'Purchase Failed',
        description: 'Failed to initiate credit purchase',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCreditPercentage = (used: number, limit: number) => {
    return Math.min((used / limit) * 100, 100);
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading && !usage) {
    return <div className="space-y-4">Loading credit information...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Credit Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* AI Credits */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Assistant Credits</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-2xl font-bold">
                {usage.ai_credits_used}/{usage.ai_credits_limit}
              </div>
              <Progress 
                value={getCreditPercentage(usage.ai_credits_used, usage.ai_credits_limit)} 
                className="h-2"
              />
              <div className="flex items-center justify-between text-sm">
                <span className={getStatusColor(getCreditPercentage(usage.ai_credits_used, usage.ai_credits_limit))}>
                  {Math.round(getCreditPercentage(usage.ai_credits_used, usage.ai_credits_limit))}% used
                </span>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => purchaseCredits('ai_credits', 500)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Buy More
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* WhatsApp Messages */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">WhatsApp Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-2xl font-bold">
                {usage.whatsapp_messages_sent}/{usage.whatsapp_messages_limit}
              </div>
              <Progress 
                value={getCreditPercentage(usage.whatsapp_messages_sent, usage.whatsapp_messages_limit)} 
                className="h-2"
              />
              <div className="flex items-center justify-between text-sm">
                <span className={getStatusColor(getCreditPercentage(usage.whatsapp_messages_sent, usage.whatsapp_messages_limit))}>
                  {Math.round(getCreditPercentage(usage.whatsapp_messages_sent, usage.whatsapp_messages_limit))}% used
                </span>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => purchaseCredits('whatsapp_messages', 200)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Buy More
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Messages */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bulk Campaigns</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-2xl font-bold">
                {usage.bulk_messages_sent}/{usage.bulk_messages_limit}
              </div>
              <Progress 
                value={getCreditPercentage(usage.bulk_messages_sent, usage.bulk_messages_limit)} 
                className="h-2"
              />
              <div className="flex items-center justify-between text-sm">
                <span className={getStatusColor(getCreditPercentage(usage.bulk_messages_sent, usage.bulk_messages_limit))}>
                  {Math.round(getCreditPercentage(usage.bulk_messages_sent, usage.bulk_messages_limit))}% used
                </span>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => purchaseCredits('bulk_messages', 50)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Buy More
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Credit Warnings */}
      {(getCreditPercentage(usage.ai_credits_used, usage.ai_credits_limit) >= 90 ||
        getCreditPercentage(usage.whatsapp_messages_sent, usage.whatsapp_messages_limit) >= 90 ||
        getCreditPercentage(usage.bulk_messages_sent, usage.bulk_messages_limit) >= 90) && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <CardTitle className="text-red-700">Low Credit Warning</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-red-600">
            <p>You're running low on credits. Consider purchasing more to avoid service interruption.</p>
            <Button className="mt-3" variant="destructive" size="sm">
              Purchase Credits Now
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Credit Purchase Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Purchase Credits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-3">
              <h4 className="font-medium">AI Assistant Credits</h4>
              <p className="text-sm text-muted-foreground">₦10 per credit</p>
              <Select onValueChange={(value) => purchaseCredits('ai_credits', parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select amount" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="100">100 credits - ₦1,000</SelectItem>
                  <SelectItem value="500">500 credits - ₦5,000</SelectItem>
                  <SelectItem value="1000">1,000 credits - ₦10,000</SelectItem>
                  <SelectItem value="2500">2,500 credits - ₦25,000</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">WhatsApp Messages</h4>
              <p className="text-sm text-muted-foreground">₦5 per message</p>
              <Select onValueChange={(value) => purchaseCredits('whatsapp_messages', parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select amount" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="100">100 messages - ₦500</SelectItem>
                  <SelectItem value="500">500 messages - ₦2,500</SelectItem>
                  <SelectItem value="1000">1,000 messages - ₦5,000</SelectItem>
                  <SelectItem value="2000">2,000 messages - ₦10,000</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Bulk Campaigns</h4>
              <p className="text-sm text-muted-foreground">₦20 per campaign</p>
              <Select onValueChange={(value) => purchaseCredits('bulk_messages', parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select amount" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25 campaigns - ₦500</SelectItem>
                  <SelectItem value="50">50 campaigns - ₦1,000</SelectItem>
                  <SelectItem value="100">100 campaigns - ₦2,000</SelectItem>
                  <SelectItem value="250">250 campaigns - ₦5,000</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Credit Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {transactions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No transactions yet</p>
            ) : (
              transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      transaction.type === 'purchase' ? 'bg-green-100 text-green-600' :
                      transaction.type === 'usage' ? 'bg-red-100 text-red-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {transaction.type === 'purchase' ? <Plus className="h-4 w-4" /> :
                       transaction.type === 'usage' ? <TrendingUp className="h-4 w-4" /> :
                       <Calendar className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(transaction.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={transaction.amount > 0 ? 'default' : 'secondary'}>
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};