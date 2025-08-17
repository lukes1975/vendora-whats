import { useState, useCallback } from 'react';
import { whatsappApiClient } from '@/services/whatsappApiClient';
import { useToast } from '@/hooks/use-toast';

export const useQRCode = () => {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchQRCode = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await whatsappApiClient.getQRCode();
      if (response) {
        setQrCode(response.qr);
      } else {
        setError('QR code not available');
        toast({
          title: 'QR Code Unavailable',
          description: 'QR code is not available or has expired',
          variant: 'destructive',
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch QR code';
      setError(errorMessage);
      toast({
        title: 'QR Code Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const clearQRCode = useCallback(() => {
    setQrCode(null);
    setError(null);
  }, []);

  return {
    qrCode,
    isLoading,
    error,
    fetchQRCode,
    clearQRCode,
  };
};