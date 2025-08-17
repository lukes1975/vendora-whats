import { useState, useEffect, useCallback, useRef } from 'react';
import { whatsappSocketService, WhatsAppConnectionStatus, WhatsAppMessage } from '@/services/whatsappSocketService';
import { useToast } from '@/hooks/use-toast';

export const useWhatsAppSocket = () => {
  const { toast } = useToast();
  const [connectionStatus, setConnectionStatus] = useState<WhatsAppConnectionStatus>({
    status: 'unknown',
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
      
      // Check if we need a QR code after connection
      setTimeout(async () => {
        if (whatsappSocketService.isConnected() && !connectionStatus.qrCode) {
          console.log('🔍 No QR code received, requesting one...');
          whatsappSocketService.refreshQR();
          
          // Fallback: Try to fetch QR via HTTP if socket doesn't provide one
          setTimeout(async () => {
            if (!connectionStatus.qrCode) {
              console.log('🔄 Attempting fallback QR fetch via HTTP...');
              try {
                const { whatsappApiClient } = await import('@/services/whatsappApiClient');
                const qrResponse = await whatsappApiClient.getQRCode();
                if (qrResponse?.qr) {
                  console.log('✅ QR code fetched via HTTP');
                  setConnectionStatus(prev => ({
                    ...prev,
                    qrCode: qrResponse.qr,
                    status: 'connecting',
                  }));
                }
              } catch (error) {
                console.error('❌ Failed to fetch QR code via HTTP:', error);
              }
            }
          }, 2000);
        }
      }, 1000);
      
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
  }, [connectionStatus.isConnecting, connectionStatus.isConnected, connectionStatus.qrCode, toast]);

  const disconnect = useCallback(() => {
    whatsappSocketService.disconnect();
    setConnectionStatus({
      status: 'logged_out',
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

  const resetSession = useCallback(async () => {
    console.log('🔄 Resetting WhatsApp session...');
    setConnectionStatus(prev => ({ ...prev, isConnecting: true, error: undefined }));
    
    try {
      const { whatsappApiClient } = await import('@/services/whatsappApiClient');
      const result = await whatsappApiClient.resetSession();
      
      if (result.success) {
        // Reset socket connection
        whatsappSocketService.resetSession();
        
        // Clear current state
        setConnectionStatus(prev => ({
          ...prev,
          status: 'unknown',
          isConnected: false,
          isConnecting: false,
          qrCode: undefined,
          error: undefined,
        }));
        
        // Reconnect to get fresh QR
        setTimeout(() => {
          connect();
        }, 1000);
        
        toast({
          title: 'Session Reset',
          description: result.message,
        });
      } else {
        throw new Error(result.message || 'Failed to reset session');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reset session';
      console.error('❌ Session reset failed:', errorMessage);
      setConnectionStatus(prev => ({
        ...prev,
        isConnecting: false,
        error: errorMessage,
      }));
      
      toast({
        title: 'Reset Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [connect, toast]);

  // Initialize socket event listeners (run once)
  useEffect(() => {
    if (isInitialized) return;

    console.log('🎧 Setting up WhatsApp socket listeners...');

    const handleConnected = () => {
      console.log('🟢 WhatsApp connected event received');
      setConnectionStatus(prev => ({
        ...prev,
        status: 'connected',
        isConnected: true,
        isConnecting: false,
        qrCode: undefined,
        error: undefined,
        lastConnected: new Date().toISOString(),
      }));
      toast({ title: 'WhatsApp Connected', description: 'Ready to send and receive messages' });
    };

    const handleDisconnected = () => {
      console.log('🔴 WhatsApp disconnected event received');
      setConnectionStatus(prev => ({
        ...prev,
        status: 'logged_out',
        isConnected: false,
        qrCode: undefined,
      }));
      toast({ title: 'WhatsApp Disconnected', description: 'Connection lost' });
    };

    const handleQR = (qrCode: string) => {
      console.log('📱 WhatsApp QR code received');
      setConnectionStatus(prev => ({
        ...prev,
        qrCode,
        status: 'connecting',
        isConnecting: true,
        isConnected: false,
        error: undefined,
      }));
    };

    const handleConnectionState = (state: WhatsAppConnectionStatus) => {
      console.log('🔄 WhatsApp connection state update:', state);
      setConnectionStatus(prev => ({
        ...prev,
        ...state,
        lastConnected: state.lastConnected || prev.lastConnected,
      }));
    };

    const handleError = (error: string) => {
      console.log('❌ WhatsApp error received:', error);
      setConnectionStatus(prev => ({
        ...prev,
        error,
        status: 'unknown',
        isConnecting: false,
      }));
      toast({ title: 'WhatsApp Error', description: error, variant: 'destructive' });
    };

    const handleReconnecting = () => {
      console.log('🔄 WhatsApp reconnecting...');
      setConnectionStatus(prev => ({
        ...prev,
        status: 'reconnecting',
        isConnecting: true,
        error: undefined,
      }));
    };

    const handleSessionLoggedOut = () => {
      console.log('🔒 WhatsApp session logged out');
      setConnectionStatus(prev => ({
        ...prev,
        status: 'logged_out',
        isConnected: false,
        isConnecting: false,
        qrCode: undefined,
        error: 'Session logged out - please reconnect',
      }));
      toast({ title: 'WhatsApp Session Expired', description: 'Please reconnect to WhatsApp', variant: 'destructive' });
    };

    const handleMessage = (data: { from: string; message: string }) => {
      console.log('💬 WhatsApp message received:', data);
      const messageWithId = {
        id: generateMessageId(),
        from: data.from,
        to: 'me',
        message: data.message,
        timestamp: Date.now(),
        type: 'incoming' as const,
        status: 'delivered' as const,
      };
      
      setMessages(prev => {
        const exists = prev.some(m => 
          m.from === messageWithId.from && 
          m.message === messageWithId.message && 
          Math.abs(m.timestamp - messageWithId.timestamp) < 5000
        );
        
        if (exists) return prev;
        
        const updated = [...prev, messageWithId].sort((a, b) => a.timestamp - b.timestamp);
        return updated;
      });
    };

    // Register all event listeners
    whatsappSocketService.on('connected', handleConnected);
    whatsappSocketService.on('disconnected', handleDisconnected);
    whatsappSocketService.on('qr', handleQR);
    whatsappSocketService.on('connection_state', handleConnectionState);
    whatsappSocketService.on('error', handleError);
    whatsappSocketService.on('reconnecting', handleReconnecting);
    whatsappSocketService.on('session_logged_out', handleSessionLoggedOut);
    whatsappSocketService.on('msg-received', handleMessage);

    setIsInitialized(true);

    return () => {
      console.log('🧹 Cleaning up WhatsApp socket listeners');
      whatsappSocketService.off('connected', handleConnected);
      whatsappSocketService.off('disconnected', handleDisconnected);
      whatsappSocketService.off('qr', handleQR);
      whatsappSocketService.off('connection_state', handleConnectionState);
      whatsappSocketService.off('error', handleError);
      whatsappSocketService.off('reconnecting', handleReconnecting);
      whatsappSocketService.off('session_logged_out', handleSessionLoggedOut);
      whatsappSocketService.off('msg-received', handleMessage);
    };
  }, [isInitialized, toast, addMessage, generateMessageId]);

  return {
    connectionStatus,
    messages,
    connect,
    disconnect,
    refreshQR,
    resetSession,
    addMessage,
    updateMessageStatus,
    isConnected: connectionStatus.isConnected,
    isConnecting: connectionStatus.isConnecting,
  };
};