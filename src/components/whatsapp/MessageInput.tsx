import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useSendWhatsAppMessage } from '@/hooks/useSendWhatsAppMessage';
import { useWhatsAppSocket } from '@/hooks/useWhatsAppSocket';
import { Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const messageSchema = z.object({
  to: z.string()
    .min(1, 'Phone number is required')
    .regex(/^\+234[0-9]{10}$/, 'Phone number must be in format +234XXXXXXXXXX'),
  message: z.string()
    .min(1, 'Message cannot be empty')
    .max(1000, 'Message cannot exceed 1000 characters'),
});

type MessageFormData = z.infer<typeof messageSchema>;

interface MessageInputProps {
  defaultRecipient?: string;
  onMessageSent?: (message: string, recipient: string) => void;
  className?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({ 
  defaultRecipient = '', 
  onMessageSent,
  className 
}) => {
  const { isConnected } = useWhatsAppSocket();
  const sendMessage = useSendWhatsAppMessage();
  
  const form = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      to: defaultRecipient,
      message: '',
    },
  });

  const handleSubmit = async (data: MessageFormData) => {
    if (!isConnected) {
      return;
    }

    try {
      await sendMessage.mutateAsync({
        to: data.to,
        message: data.message,
      });
      form.setValue('message', ''); // Clear message after sending
      onMessageSent?.(data.message, data.to);
    } catch (error) {
      // Error is handled by the mutation
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      form.handleSubmit(handleSubmit)();
    }
  };

  const messageLength = form.watch('message')?.length || 0;
  const isNearLimit = messageLength > 800;
  const isAtLimit = messageLength >= 1000;

  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Recipient field */}
            <FormField
              control={form.control}
              name="to"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipient</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="+234XXXXXXXXXX"
                      disabled={sendMessage.isPending || !isConnected}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Message field */}
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    <span>Message</span>
                    <span className={cn(
                      "text-xs",
                      isNearLimit ? "text-orange-500" : "text-muted-foreground",
                      isAtLimit && "text-destructive"
                    )}>
                      {messageLength}/1000
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Type your message here... (Press Enter to send, Shift+Enter for new line)"
                      className="min-h-[100px] resize-none"
                      onKeyDown={handleKeyDown}
                      disabled={sendMessage.isPending || !isConnected}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Send button */}
            <div className="flex justify-between items-center">
              <div className="text-xs text-muted-foreground">
                {!isConnected && "Connect WhatsApp to send messages"}
              </div>
              <Button
                type="submit"
                disabled={sendMessage.isPending || !isConnected || isAtLimit}
                className="flex items-center gap-2"
              >
                {sendMessage.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {sendMessage.isPending ? 'Sending...' : 'Send Message'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};