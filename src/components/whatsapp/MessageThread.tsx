import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { WhatsAppMessage } from '@/services/whatsappSocketService';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Check, CheckCheck, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageThreadProps {
  messages: WhatsAppMessage[];
  className?: string;
}

export const MessageThread: React.FC<MessageThreadProps> = ({ messages, className }) => {
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  React.useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollArea) {
        // Use requestAnimationFrame to prevent forced reflow
        const animationFrame = requestAnimationFrame(() => {
          scrollArea.scrollTop = scrollArea.scrollHeight;
        });
        
        return () => cancelAnimationFrame(animationFrame);
      }
    }
  }, [messages]);

  const getStatusIcon = (status: WhatsAppMessage['status']) => {
    switch (status) {
      case 'sending':
        return <Clock className="h-3 w-3 text-muted-foreground animate-pulse" />;
      case 'sent':
        return <Check className="h-3 w-3 text-muted-foreground" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      case 'failed':
        return <AlertCircle className="h-3 w-3 text-destructive" />;
      default:
        return null;
    }
  };

  const formatPhoneNumber = (phoneNumber: string) => {
    // Format phone number for display (e.g., +234XXXXXXXXXX -> +234 XXX XXX XXXX)
    if (phoneNumber.startsWith('+234')) {
      const number = phoneNumber.substring(4);
      return `+234 ${number.substring(0, 3)} ${number.substring(3, 6)} ${number.substring(6)}`;
    }
    return phoneNumber;
  };

  if (messages.length === 0) {
    return (
      <Card className={cn("flex-1 flex items-center justify-center p-8", className)}>
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
            <MessageCircle className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-medium text-muted-foreground">No messages yet</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Messages will appear here when you start chatting
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("flex-1 flex flex-col", className)}>
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <AnimatePresence initial={false}>
          <div className="space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "flex flex-col max-w-[80%]",
                  message.type === 'outgoing' ? "ml-auto items-end" : "mr-auto items-start"
                )}
              >
                {/* Sender info for incoming messages */}
                {message.type === 'incoming' && (
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      {formatPhoneNumber(message.from)}
                    </Badge>
                  </div>
                )}
                
                {/* Message bubble */}
                <div
                  className={cn(
                    "px-3 py-2 rounded-lg max-w-full break-words",
                    message.type === 'outgoing'
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                    message.status === 'failed' && "bg-destructive/10 border border-destructive/20"
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                </div>
                
                {/* Message metadata */}
                <div className={cn(
                  "flex items-center gap-1 mt-1 text-xs text-muted-foreground",
                  message.type === 'outgoing' ? "flex-row-reverse" : "flex-row"
                )}>
                  <span>
                    {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                  </span>
                  {message.type === 'outgoing' && (
                    <div className="flex items-center">
                      {getStatusIcon(message.status)}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      </ScrollArea>
    </Card>
  );
};