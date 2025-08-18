import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  MessageSquare, 
  Bot, 
  List, 
  Command, 
  Settings, 
  Zap,
  Send,
  BarChart3
} from 'lucide-react';

interface WhatsAppOrderManagementProps {
  store: any;
  onStoreUpdate: () => void;
}

export const WhatsAppOrderManagement: React.FC<WhatsAppOrderManagementProps> = ({ 
  store, 
  onStoreUpdate 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [aiInstructions, setAiInstructions] = useState(
    'You are a helpful sales assistant for my store. Help customers browse products, answer questions, and guide them through the ordering process. Be friendly and professional.'
  );

  const [ussdMenuSettings, setUssdMenuSettings] = useState({
    welcomeMessage: 'Welcome to our store! Choose an option:',
    showCategories: true,
    enableQuantitySelection: true,
    requireCustomerInfo: true
  });

  const handleOrderMethodToggle = async (method: 'ussd' | 'ai' | 'manual') => {
    if (!store) return;

    setIsUpdating(true);
    try {
      let updateData = {};
      
      switch (method) {
        case 'ussd':
          updateData = { use_ai_chat: false };
          break;
        case 'ai':
          updateData = { use_ai_chat: true };
          break;
        case 'manual':
          // For manual mode, we'll use a custom field
          updateData = { use_ai_chat: false, manual_order_mode: true };
          break;
      }

      const { error } = await supabase
        .from('stores')
        .update(updateData)
        .eq('id', store.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Order method updated to ${method.toUpperCase()} mode`,
      });

      onStoreUpdate();
    } catch (error) {
      console.error('Error updating order method:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order method',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const saveAiInstructions = async () => {
    // Save AI instructions to store metadata
    try {
      // For now, we'll store AI instructions in a separate table or local storage
      // Since ai_instructions field doesn't exist in stores table yet
      localStorage.setItem(`ai_instructions_${store.id}`, aiInstructions);

      if (error) throw error;

      toast({
        title: 'AI Instructions Saved',
        description: 'Your AI assistant instructions have been updated',
      });
    } catch (error) {
      console.error('Error saving AI instructions:', error);
      toast({
        title: 'Error',
        description: 'Failed to save AI instructions',
        variant: 'destructive',
      });
    }
  };

  if (!store) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">No store found. Please create a store first.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            WhatsApp Order Methods
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="ussd">USSD Flow</TabsTrigger>
              <TabsTrigger value="ai">AI Assistant</TabsTrigger>
              <TabsTrigger value="manual">Manual Commands</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <List className="h-5 w-5 text-blue-500" />
                        <h3 className="font-medium">USSD Flow</h3>
                      </div>
                      {!store.use_ai_chat && !store.manual_order_mode && (
                        <Badge variant="default">Active</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Menu-driven ordering system with step-by-step guidance
                    </p>
                    <ul className="text-xs space-y-1 text-muted-foreground">
                      <li>• Structured product selection</li>
                      <li>• Quantity and address collection</li>
                      <li>• Order confirmation</li>
                      <li>• Payment link generation</li>
                    </ul>
                    <Button 
                      size="sm" 
                      variant={!store.use_ai_chat && !store.manual_order_mode ? "secondary" : "outline"}
                      onClick={() => handleOrderMethodToggle('ussd')}
                      disabled={isUpdating}
                      className="w-full"
                    >
                      {!store.use_ai_chat && !store.manual_order_mode ? 'Active' : 'Activate'}
                    </Button>
                  </CardContent>
                </Card>

                <Card className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bot className="h-5 w-5 text-purple-500" />
                        <h3 className="font-medium">AI Assistant</h3>
                      </div>
                      {store.use_ai_chat && (
                        <Badge variant="default">Active</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Natural conversation with AI-powered customer service
                    </p>
                    <ul className="text-xs space-y-1 text-muted-foreground">
                      <li>• Natural conversation</li>
                      <li>• Product recommendations</li>
                      <li>• 24/7 availability</li>
                      <li>• Custom instructions</li>
                    </ul>
                    <Button 
                      size="sm" 
                      variant={store.use_ai_chat ? "secondary" : "outline"}
                      onClick={() => handleOrderMethodToggle('ai')}
                      disabled={isUpdating}
                      className="w-full"
                    >
                      {store.use_ai_chat ? 'Active' : 'Activate'}
                    </Button>
                  </CardContent>
                </Card>

                <Card className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Command className="h-5 w-5 text-green-500" />
                        <h3 className="font-medium">Manual Commands</h3>
                      </div>
                      {store.manual_order_mode && (
                        <Badge variant="default">Active</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Manual order creation using simple commands
                    </p>
                    <ul className="text-xs space-y-1 text-muted-foreground">
                      <li>• ".order success" commands</li>
                      <li>• Direct conversation</li>
                      <li>• Manual intervention</li>
                      <li>• Full control</li>
                    </ul>
                    <Button 
                      size="sm" 
                      variant={store.manual_order_mode ? "secondary" : "outline"}
                      onClick={() => handleOrderMethodToggle('manual')}
                      disabled={isUpdating}
                      className="w-full"
                    >
                      {store.manual_order_mode ? 'Active' : 'Activate'}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="ussd" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <List className="h-5 w-5" />
                    USSD Flow Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="welcome-message">Welcome Message</Label>
                      <Textarea
                        id="welcome-message"
                        value={ussdMenuSettings.welcomeMessage}
                        onChange={(e) => setUssdMenuSettings(prev => ({ 
                          ...prev, 
                          welcomeMessage: e.target.value 
                        }))}
                        placeholder="Enter welcome message for customers"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="show-categories">Show Product Categories</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow customers to browse by categories
                        </p>
                      </div>
                      <Switch
                        id="show-categories"
                        checked={ussdMenuSettings.showCategories}
                        onCheckedChange={(checked) => setUssdMenuSettings(prev => ({ 
                          ...prev, 
                          showCategories: checked 
                        }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="quantity-selection">Enable Quantity Selection</Label>
                        <p className="text-sm text-muted-foreground">
                          Let customers choose product quantities
                        </p>
                      </div>
                      <Switch
                        id="quantity-selection"
                        checked={ussdMenuSettings.enableQuantitySelection}
                        onCheckedChange={(checked) => setUssdMenuSettings(prev => ({ 
                          ...prev, 
                          enableQuantitySelection: checked 
                        }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="require-info">Require Customer Information</Label>
                        <p className="text-sm text-muted-foreground">
                          Collect name and address before order
                        </p>
                      </div>
                      <Switch
                        id="require-info"
                        checked={ussdMenuSettings.requireCustomerInfo}
                        onCheckedChange={(checked) => setUssdMenuSettings(prev => ({ 
                          ...prev, 
                          requireCustomerInfo: checked 
                        }))}
                      />
                    </div>
                  </div>

                  <Button>
                    <Settings className="h-4 w-4 mr-2" />
                    Save USSD Configuration
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ai" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    AI Assistant Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ai-instructions">AI Assistant Instructions</Label>
                    <Textarea
                      id="ai-instructions"
                      value={aiInstructions}
                      onChange={(e) => setAiInstructions(e.target.value)}
                      placeholder="Provide instructions for how the AI should behave and respond to customers"
                      rows={6}
                    />
                    <p className="text-sm text-muted-foreground">
                      These instructions will guide how your AI assistant interacts with customers.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="h-4 w-4 text-yellow-500" />
                          <span className="font-medium">Credits Used</span>
                        </div>
                        <div className="text-2xl font-bold">245</div>
                        <p className="text-sm text-muted-foreground">This month</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <BarChart3 className="h-4 w-4 text-blue-500" />
                          <span className="font-medium">Conversations</span>
                        </div>
                        <div className="text-2xl font-bold">58</div>
                        <p className="text-sm text-muted-foreground">This month</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Button onClick={saveAiInstructions}>
                    <Bot className="h-4 w-4 mr-2" />
                    Save AI Instructions
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="manual" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Command className="h-5 w-5" />
                    Manual Command System
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted rounded-lg p-4">
                    <h4 className="font-medium mb-2">Available Commands:</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <code className="bg-background px-2 py-1 rounded">.order success</code>
                        <span className="text-muted-foreground">Mark conversation as successful order</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="bg-background px-2 py-1 rounded">.order cancel</code>
                        <span className="text-muted-foreground">Cancel current order process</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="bg-background px-2 py-1 rounded">.info customer</code>
                        <span className="text-muted-foreground">Request customer information</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Quick Order Creation</h4>
                    <p className="text-sm text-muted-foreground">
                      When using manual mode, you can chat freely with customers and use commands 
                      to mark successful orders or update order status.
                    </p>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">Auto-detect successful orders</div>
                        <p className="text-sm text-muted-foreground">
                          Automatically detect when an order is completed in conversation
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>

                  <Button>
                    <Command className="h-4 w-4 mr-2" />
                    Save Manual Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};