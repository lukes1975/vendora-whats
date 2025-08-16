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

  // Initialize socket event listeners (run once)
  useEffect(() => {
    if (isInitialized) return;

    console.log('🎧 Setting up WhatsApp socket listeners...');

    const handleConnected = () => {
      console.log('🟢 Socket connected event - updating UI state');
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
      console.log('🔴 Socket disconnected event');
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
      console.log('📱 QR code received, updating UI');
      setConnectionStatus(prev => ({
        ...prev,
        qrCode,
        isConnecting: true,
        error: undefined,
      }));
    };

    const handleError = (error: string) => {
      console.log('❌ Socket error:', error);
      setConnectionStatus(prev => ({
        ...prev,
        error,
        isConnecting: false,
      }));
    };

    const handleReconnecting = () => {
      console.log('🔄 Socket reconnecting');
      setConnectionStatus(prev => ({
        ...prev,
        isConnecting: true,
        error: 'Reconnecting...',
      }));
    };

    const handleMessageReceived = (data: { from: string; message: string; timestamp?: number }) => {
      console.log('📨 Message received:', data.from);
      addMessage({
        from: data.from,
        to: 'me', // Current user
        message: data.message,
        timestamp: data.timestamp || Date.now(),
        type: 'incoming',
        status: 'delivered',
      });
    };

    // Register all event listeners - removed duplicate 'connect' handler
    whatsappSocketService.on('connected', handleConnected);
    whatsappSocketService.on('disconnected', handleDisconnected);
    whatsappSocketService.on('qr', handleQR);
    whatsappSocketService.on('error', handleError);
    whatsappSocketService.on('reconnecting', handleReconnecting);
    whatsappSocketService.on('msg-received', handleMessageReceived);

    setIsInitialized(true);

    return () => {
      console.log('🧹 Cleaning up WhatsApp socket listeners');
      whatsappSocketService.off('connected', handleConnected);
      whatsappSocketService.off('disconnected', handleDisconnected);
      whatsappSocketService.off('qr', handleQR);
      whatsappSocketService.off('error', handleError);
      whatsappSocketService.off('reconnecting', handleReconnecting);
      whatsappSocketService.off('msg-received', handleMessageReceived);
    };
  }, [isInitialized, toast, addMessage]);

  // Removed auto-connect timer to prevent connection loops and race conditions
  // Users now manually control connection via the Connect button

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