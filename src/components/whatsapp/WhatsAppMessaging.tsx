import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { WhatsAppConnection } from './WhatsAppConnection';
import { MessageThread } from './MessageThread';
import { MessageInput } from './MessageInput';
import { useWhatsAppSocket } from '@/hooks/useWhatsAppSocket';
import { MessageCircle, Users, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export const WhatsAppMessaging: React.FC = () => {
  const { isConnected, isConnecting, messages, connectionStatus } = useWhatsAppSocket();

  const stats = React.useMemo(() => {
    const totalMessages = messages.length;
    const incomingMessages = messages.filter(m => m.type === 'incoming').length;
    const outgoingMessages = messages.filter(m => m.type === 'outgoing').length;
    const uniqueContacts = new Set(messages.map(m => m.type === 'incoming' ? m.from : m.to)).size;
    
    return {
      totalMessages,
      incomingMessages,
      outgoingMessages,
      uniqueContacts,
    };
  }, [messages]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">WhatsApp Integration</h1>
          <p className="text-muted-foreground">
            Connect and manage your WhatsApp business communications
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isConnected ? 'default' : 'outline'} className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
            {isConnected ? 'Connected' : isConnecting ? 'Connecting' : 'Disconnected'}
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      {isConnected && messages.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalMessages}</p>
                  <p className="text-xs text-muted-foreground">Total Messages</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.incomingMessages}</p>
                  <p className="text-xs text-muted-foreground">Received</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.outgoingMessages}</p>
                  <p className="text-xs text-muted-foreground">Sent</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.uniqueContacts}</p>
                  <p className="text-xs text-muted-foreground">Contacts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {!isConnected ? (
        /* Connection Screen */
        <div className="flex justify-center">
          <WhatsAppConnection />
        </div>
      ) : (
        /* Messaging Interface */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Message Thread - Takes up 2/3 on large screens */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Message Thread</CardTitle>
                <CardDescription>
                  Real-time WhatsApp conversation history
                </CardDescription>
              </CardHeader>
            </Card>
            
            <MessageThread 
              messages={messages} 
              className="min-h-[400px] lg:min-h-[500px]" 
            />
          </div>

          {/* Message Input & Connection Status - 1/3 on large screens */}
          <div className="space-y-4">
            {/* Connection Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Connection Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">WhatsApp</span>
                  <Badge variant={isConnected ? 'default' : 'outline'}>
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </Badge>
                </div>
                
                {connectionStatus.lastConnected && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Last Connected</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(connectionStatus.lastConnected).toLocaleString()}
                    </span>
                  </div>
                )}
                
                <Separator />
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-lg font-bold">{stats.incomingMessages}</p>
                    <p className="text-xs text-muted-foreground">Received</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">{stats.outgoingMessages}</p>
                    <p className="text-xs text-muted-foreground">Sent</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Message Input */}
            <MessageInput />
          </div>
        </div>
      )}
    </div>
  );
};