import { useState, useEffect, useCallback, useRef } from 'react';
import { whatsappSocketService, WhatsAppConnectionStatus, WhatsAppMessage } from '@/services/whatsappSocketService';
import { useToast } from '@/hooks/use-toast';

export const useWhatsAppSocket = () => {
  const { toast } = useToast();
  const [connectionStatus, setConnectionStatus] = useState<WhatsAppConnectionStatus>({
    isConnected: false,
    isConnecting: false,
    qrCode: undefined,
    error: undefined,
    lastConnected: undefined,
  });
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const messageIdCounter = useRef(0);

  const generateMessageId = useCallback(() => {
    return `msg_${Date.now()}_${++messageIdCounter.current}`;
  }, []);

  const addMessage = useCallback((message: Omit<WhatsAppMessage, 'id'>) => {
    const newMessage: WhatsAppMessage = {
      ...message,
      id: generateMessageId(),
    };
    
    setMessages(prev => {
      // Prevent duplicate messages
      const exists = prev.some(m => 
        m.from === newMessage.from && 
        m.message === newMessage.message && 
        Math.abs(m.timestamp - newMessage.timestamp) < 1000
      );
      
      if (exists) return prev;
      
      return [...prev, newMessage].sort((a, b) => a.timestamp - b.timestamp);
    });
    
    return newMessage.id;
  }, [generateMessageId]);

  const updateMessageStatus = useCallback((messageId: string, status: WhatsAppMessage['status']) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, status } : msg
    ));
  }, []);

  const connect = useCallback(async () => {
    console.log('🔗 WhatsApp Connect called:', { 
      isConnecting: connectionStatus.isConnecting, 
      isConnected: connectionStatus.isConnected 
    });
    
    if (connectionStatus.isConnecting || connectionStatus.isConnected) {
      console.log('⚠️ Connection attempt skipped - already connecting or connected');
      return;
    }

    console.log('🚀 Starting WhatsApp connection...');
    setConnectionStatus(prev => ({ ...prev, isConnecting: true, error: undefined }));

    try {
      await whatsappSocketService.connect();
      console.log('✅ WhatsApp connection successful');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect';
      console.error('❌ WhatsApp connection failed:', errorMessage);
      
      setConnectionStatus(prev => ({ 
        ...prev, 
        isConnecting: false, 
        error: errorMessage 
      }));
      
      toast({
        title: 'Connection Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [connectionStatus.isConnecting, connectionStatus.isConnected, toast]);

  const disconnect = useCallback(() => {
    whatsappSocketService.disconnect();
    setConnectionStatus({
      isConnected: false,
      isConnecting: false,
      qrCode: undefined,
      error: undefined,
      lastConnected: undefined,
    });
  }, []);

  const refreshQR = useCallback(() => {
    whatsappSocketService.refreshQR();
  }, []);

  // Initialize socket event listeners
  useEffect(() => {
    if (isInitialized) return;

    const handleConnected = () => {
      setConnectionStatus(prev => ({
        ...prev,
        isConnected: true,
        isConnecting: false,
        error: undefined,
        lastConnected: new Date(),
      }));
      
      toast({
        title: 'WhatsApp Connected',
        description: 'Successfully connected to WhatsApp',
      });
    };

    const handleDisconnected = () => {
      setConnectionStatus(prev => ({
        ...prev,
        isConnected: false,
        isConnecting: false,
        error: 'Disconnected',
      }));
      
      toast({
        title: 'WhatsApp Disconnected',
        description: 'Connection lost',
        variant: 'destructive',
      });
    };

    const handleQR = (qrCode: string) => {
      setConnectionStatus(prev => ({
        ...prev,
        qrCode,
        isConnecting: true,
        error: undefined,
      }));
    };

    const handleError = (error: string) => {
      setConnectionStatus(prev => ({
        ...prev,
        error,
        isConnecting: false,
      }));
    };

    const handleReconnecting = () => {
      setConnectionStatus(prev => ({
        ...prev,
        isConnecting: true,
        error: 'Reconnecting...',
      }));
    };

    const handleMessageReceived = (data: { from: string; message: string; timestamp?: number }) => {
      addMessage({
        from: data.from,
        to: 'me', // Current user
        message: data.message,
        timestamp: data.timestamp || Date.now(),
        type: 'incoming',
        status: 'delivered',
      });
    };

    whatsappSocketService.on('connected', handleConnected);
    whatsappSocketService.on('disconnected', handleDisconnected);
    whatsappSocketService.on('qr', handleQR);
    whatsappSocketService.on('error', handleError);
    whatsappSocketService.on('reconnecting', handleReconnecting);
    whatsappSocketService.on('msg-received', handleMessageReceived);

    setIsInitialized(true);

    return () => {
      whatsappSocketService.off('connected', handleConnected);
      whatsappSocketService.off('disconnected', handleDisconnected);
      whatsappSocketService.off('qr', handleQR);
      whatsappSocketService.off('error', handleError);
      whatsappSocketService.off('reconnecting', handleReconnecting);
      whatsappSocketService.off('msg-received', handleMessageReceived);
    };
  }, [isInitialized, toast, addMessage]);

  // Auto-connect on mount if not connected
  useEffect(() => {
    if (!connectionStatus.isConnected && !connectionStatus.isConnecting) {
      const timer = setTimeout(() => {
        connect().catch((error) => {
          console.error('Auto-connect failed:', error);
        });
      }, 1000); // Delay auto-connect to avoid immediate connection pressure
      
      return () => clearTimeout(timer);
    }
  }, [connectionStatus.isConnected, connectionStatus.isConnecting, connect]);

  return {
    connectionStatus,
    messages,
    connect,
    disconnect,
    refreshQR,
    addMessage,
    updateMessageStatus,
    isConnected: connectionStatus.isConnected,
    isConnecting: connectionStatus.isConnecting,
  };
};