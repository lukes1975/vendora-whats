import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MessageSquare, Bot, List, TestTube } from 'lucide-react';

interface Store {
  id: string;
  name: string;
  use_ai_chat: boolean;
}

interface WhatsAppSettingsProps {
  store: Store | null;
  onStoreUpdate: () => void;
}

export const WhatsAppSettings: React.FC<WhatsAppSettingsProps> = ({ store, onStoreUpdate }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const { toast } = useToast();

  const handleChatModeToggle = async (useAiChat: boolean) => {
    if (!store) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('stores')
        .update({ use_ai_chat: useAiChat })
        .eq('id', store.id);

      if (error) throw error;

      toast({
        title: 'Settings Updated',
        description: `Chat mode switched to ${useAiChat ? 'AI Assistant' : 'USSD Flow'}`,
      });

      onStoreUpdate();
    } catch (error) {
      console.error('Error updating chat mode:', error);
      toast({
        title: 'Error',
        description: 'Failed to update chat mode. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTestWebhook = async () => {
    if (!store) return;

    setIsTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-webhook', {
        body: {
          tenant_id: store.id,
          chat_id: 'test@s.whatsapp.net',
          from: '+234000000000',
          text: 'Test message',
          message_id: `test_${Date.now()}`,
          timestamp: Date.now(),
        },
        headers: {
          'x-vendora-secret': 'test_secret', // This would be properly secured in production
        },
      });

      if (error) throw error;

      toast({
        title: 'Test Successful',
        description: 'WhatsApp webhook test completed successfully.',
      });
    } catch (error) {
      console.error('Error testing webhook:', error);
      toast({
        title: 'Test Failed',
        description: 'WhatsApp webhook test failed. Please check your configuration.',
        variant: 'destructive',
      });
    } finally {
      setIsTesting(false);
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
            WhatsApp Chat Mode
          </CardTitle>
          <CardDescription>
            Choose how customers interact with your store via WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                {store.use_ai_chat ? (
                  <Bot className="h-4 w-4 text-primary" />
                ) : (
                  <List className="h-4 w-4 text-primary" />
                )}
                <span className="font-medium">
                  {store.use_ai_chat ? 'AI Assistant Mode' : 'USSD Flow Mode'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {store.use_ai_chat
                  ? 'Customers chat with an AI assistant for a natural conversation experience'
                  : 'Customers follow a guided menu-based flow for structured ordering'}
              </p>
            </div>
            <Switch
              checked={store.use_ai_chat}
              onCheckedChange={handleChatModeToggle}
              disabled={isUpdating}
            />
          </div>

          {!store.use_ai_chat && (
            <div className="rounded-lg border bg-muted/50 p-4">
              <h4 className="font-medium mb-2">USSD Flow Features:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Step-by-step product selection</li>
                <li>• Automatic quantity and address collection</li>
                <li>• Order confirmation before payment</li>
                <li>• Integrated Paystack payment links</li>
              </ul>
            </div>
          )}

          {store.use_ai_chat && (
            <div className="rounded-lg border bg-muted/50 p-4">
              <h4 className="font-medium mb-2">AI Assistant Features:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Natural conversation with customers</li>
                <li>• Product recommendations</li>
                <li>• Order assistance and support</li>
                <li>• 24/7 availability</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            WhatsApp Integration Testing
          </CardTitle>
          <CardDescription>
            Test your WhatsApp webhook integration to ensure everything is working correctly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleTestWebhook}
            disabled={isTesting}
            variant="outline"
            className="w-full sm:w-auto"
          >
            {isTesting ? 'Testing...' : 'Test WhatsApp Webhook'}
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            This will send a test message to your WhatsApp webhook endpoint
          </p>
        </CardContent>
      </Card>
    </div>
  );
};