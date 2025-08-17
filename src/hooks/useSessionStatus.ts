import { useState, useCallback } from 'react';
import { whatsappApiClient, ConnectionStatus } from '@/services/whatsappApiClient';
import { useToast } from '@/hooks/use-toast';

export const useSessionStatus = () => {
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const checkStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await whatsappApiClient.getConnectionStatus();
      setStatus(response);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check status';
      setError(errorMessage);
      toast({
        title: 'Status Check Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    status,
    isLoading,
    error,
    checkStatus,
  };
};