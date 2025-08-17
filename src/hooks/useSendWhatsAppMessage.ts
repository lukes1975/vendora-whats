import { useMutation, useQueryClient } from '@tanstack/react-query';
import { whatsappApiClient, SendMessageRequest } from '@/services/whatsappApiClient';
import { useToast } from '@/hooks/use-toast';
import { useWhatsAppSocket } from './useWhatsAppSocket';

export const useSendWhatsAppMessage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { addMessage, updateMessageStatus } = useWhatsAppSocket();

  return useMutation({
    mutationFn: async (request: SendMessageRequest) => {
      // Normalize phone number (remove non-digits except +)
      const normalizedTo = request.to.replace(/[^\d+]/g, '');
      
      // Add optimistic message
      const messageId = addMessage({
        from: 'me',
        to: normalizedTo,
        message: request.message,
        timestamp: Date.now(),
        type: 'outgoing',
        status: 'sending',
      });

      try {
        const response = await whatsappApiClient.sendMessage({
          ...request,
          to: normalizedTo,
        });
        
        if (response.status === 'sent') {
          updateMessageStatus(messageId, 'sent');
          return { ...response, messageId };
        } else {
          updateMessageStatus(messageId, 'failed');
          throw new Error(response.error || 'Failed to send message');
        }
      } catch (error) {
        updateMessageStatus(messageId, 'failed');
        throw error;
      }
    },
    onSuccess: (data) => {
      toast({
        title: 'Message Sent',
        description: 'Your WhatsApp message was sent successfully',
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['whatsapp-messages'] });
    },
    onError: (error) => {
      console.error('Failed to send WhatsApp message:', error);
      
      toast({
        title: 'Message Failed',
        description: error instanceof Error ? error.message : 'Failed to send message',
        variant: 'destructive',
      });
    },
  });
};