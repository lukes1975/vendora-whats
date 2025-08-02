import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useWhatsAppSocket } from '@/hooks/useWhatsAppSocket';
import { RefreshCw, Smartphone, Wifi, WifiOff, AlertCircle } from 'lucide-react';
import QRCode from 'qrcode';
import { motion, AnimatePresence } from 'framer-motion';

export const WhatsAppConnection: React.FC = () => {
  const { connectionStatus, connect, disconnect, refreshQR, isConnected, isConnecting } = useWhatsAppSocket();
  const [qrCodeDataUrl, setQrCodeDataUrl] = React.useState<string | null>(null);

  // Generate QR code data URL when QR code changes
  React.useEffect(() => {
    if (connectionStatus.qrCode) {
      QRCode.toDataURL(connectionStatus.qrCode, {
        width: 256,
        margin: 2,
        color: {
          dark: 'hsl(var(--foreground))',
          light: 'hsl(var(--background))',
        },
      })
        .then(setQrCodeDataUrl)
        .catch(console.error);
    } else {
      setQrCodeDataUrl(null);
    }
  }, [connectionStatus.qrCode]);

  const getStatusInfo = () => {
    if (isConnected) {
      return {
        icon: <Wifi className="h-4 w-4" />,
        label: 'Connected',
        variant: 'default' as const,
        description: 'WhatsApp is ready to send and receive messages',
      };
    }
    
    if (isConnecting) {
      return {
        icon: <RefreshCw className="h-4 w-4 animate-spin" />,
        label: connectionStatus.error?.includes('Reconnecting') ? 'Reconnecting' : 'Connecting',
        variant: 'secondary' as const,
        description: connectionStatus.qrCode ? 'Scan the QR code with your phone' : 'Establishing connection...',
      };
    }
    
    if (connectionStatus.error) {
      return {
        icon: <AlertCircle className="h-4 w-4" />,
        label: 'Error',
        variant: 'destructive' as const,
        description: connectionStatus.error,
      };
    }
    
    return {
      icon: <WifiOff className="h-4 w-4" />,
      label: 'Disconnected',
      variant: 'outline' as const,
      description: 'Click connect to start WhatsApp integration',
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Smartphone className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-lg">WhatsApp Connection</CardTitle>
        </div>
        <div className="flex justify-center">
          <Badge variant={statusInfo.variant} className="flex items-center gap-1">
            {statusInfo.icon}
            {statusInfo.label}
          </Badge>
        </div>
        <CardDescription className="mt-2">
          {statusInfo.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <AnimatePresence mode="wait">
          {connectionStatus.qrCode && qrCodeDataUrl ? (
            <motion.div
              key="qr-code"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center space-y-4"
            >
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <img 
                  src={qrCodeDataUrl} 
                  alt="WhatsApp QR Code" 
                  className="w-48 h-48"
                />
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  1. Open WhatsApp on your phone
                </p>
                <p className="text-sm text-muted-foreground">
                  2. Go to Settings → Linked Devices
                </p>
                <p className="text-sm text-muted-foreground">
                  3. Tap "Link a Device" and scan this code
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshQR}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh QR Code
              </Button>
            </motion.div>
          ) : isConnecting && !connectionStatus.qrCode ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center space-y-4"
            >
              <Skeleton className="w-48 h-48 rounded-lg" />
              <div className="space-y-2 text-center">
                <Skeleton className="h-4 w-32 mx-auto" />
                <Skeleton className="h-4 w-40 mx-auto" />
                <Skeleton className="h-4 w-36 mx-auto" />
              </div>
            </motion.div>
          ) : isConnected ? (
            <motion.div
              key="connected"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-4"
            >
              <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <Wifi className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-medium text-green-700 dark:text-green-300">
                  Successfully Connected!
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Your WhatsApp is now linked and ready to use.
                </p>
                {connectionStatus.lastConnected && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Connected at {new Date(connectionStatus.lastConnected).toLocaleTimeString()}
                  </p>
                )}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="flex gap-2 justify-center">
          {!isConnected ? (
            <Button 
              onClick={connect} 
              disabled={isConnecting}
              className="flex items-center gap-2"
            >
              {isConnecting ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Wifi className="h-4 w-4" />
              )}
              {isConnecting ? 'Connecting...' : 'Connect WhatsApp'}
            </Button>
          ) : (
            <Button 
              variant="outline"
              onClick={disconnect}
              className="flex items-center gap-2"
            >
              <WifiOff className="h-4 w-4" />
              Disconnect
            </Button>
          )}
        </div>

        {connectionStatus.error && !isConnecting && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="p-3 bg-destructive/10 border border-destructive/20 rounded-md"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <p className="text-sm text-destructive">{connectionStatus.error}</p>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};