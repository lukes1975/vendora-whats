import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { WhatsAppConnection } from '@/components/whatsapp/WhatsAppConnection';
import { WhatsAppMessaging } from '@/components/whatsapp/WhatsAppMessaging';
import { WhatsAppOrderManagement } from '@/components/whatsapp/WhatsAppOrderManagement';
import { BulkMessaging } from '@/components/whatsapp/BulkMessaging';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Send, Settings, ShoppingCart, Megaphone } from 'lucide-react';

const WhatsApp: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Please log in to access WhatsApp features.</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">WhatsApp Business</h1>
        <p className="text-muted-foreground">
          Manage your WhatsApp business communications and orders
        </p>
      </div>

      <Tabs defaultValue="connection" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="connection" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Connection
          </TabsTrigger>
          <TabsTrigger value="messaging" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="bulk" className="flex items-center gap-2">
            <Megaphone className="h-4 w-4" />
            Bulk Messaging
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Automation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="connection" className="space-y-6">
          <WhatsAppConnection />
        </TabsContent>

        <TabsContent value="messaging" className="space-y-6">
          <WhatsAppMessaging />
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <WhatsAppOrderManagement />
        </TabsContent>

        <TabsContent value="bulk" className="space-y-6">
          <BulkMessaging />
        </TabsContent>
        
        <TabsContent value="automation" className="space-y-6">
          <div className="text-center py-12">
            <Send className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">WhatsApp Automation</h3>
            <p className="text-muted-foreground">
              Set up automated responses and workflows for your WhatsApp business.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WhatsApp;