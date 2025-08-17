import { useState, useCallback } from 'react';
import { whatsappApiClient } from '@/services/whatsappApiClient';
import { useToast } from '@/hooks/use-toast';

export const useBackendHealth = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<{
    success: boolean;
    error?: string;
    latency?: number;
    timestamp: number;
  } | null>(null);
  const { toast } = useToast();

  const checkHealth = useCallback(async () => {
    setIsChecking(true);
    
    try {
      const result = await whatsappApiClient.testConnection();
      const checkResult = {
        ...result,
        timestamp: Date.now(),
      };
      
      setLastCheck(checkResult);
      
      if (result.success) {
        toast({
          title: 'Backend Connected',
          description: `WhatsApp backend is reachable (${result.latency}ms)`,
        });
      } else {
        toast({
          title: 'Backend Connection Failed',
          description: result.error || 'Unknown error',
          variant: 'destructive',
        });
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const checkResult = {
        success: false,
        error: errorMessage,
        timestamp: Date.now(),
      };
      
      setLastCheck(checkResult);
      
      toast({
        title: 'Health Check Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      
      return { success: false, error: errorMessage };
    } finally {
      setIsChecking(false);
    }
  }, [toast]);

  return {
    checkHealth,
    isChecking,
    lastCheck,
  };
};