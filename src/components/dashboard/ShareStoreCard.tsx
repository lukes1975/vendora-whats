
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Share2, ExternalLink, QrCode, Users } from "lucide-react";
import { toast } from "sonner";
import { useAnalytics } from '@/hooks/useAnalytics';
import { useDashboardData } from '@/hooks/useDashboardData';
import QRCodeGenerator from '@/components/QRCodeGenerator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const ShareStoreCard = () => {
  const { storeData } = useDashboardData();
  const { track } = useAnalytics();
  const [copied, setCopied] = useState(false);

  if (!storeData) return null;

  const storeUrl = `${window.location.origin}/${storeData.slug}`;
  const shareText = `Check out my professional store on Vendora: ${storeUrl}`;

  const copyStoreUrl = async () => {
    try {
      await navigator.clipboard.writeText(storeUrl);
      setCopied(true);
      toast.success("Store URL copied to clipboard!");
      track('store_shared', { source: 'copy_link', store_id: storeData.id });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy URL");
    }
  };

  const shareOnWhatsApp = () => {
    const message = `Check out my professional store on Vendora: ${storeUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    track('store_shared', { source: 'whatsapp', store_id: storeData.id });
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${storeData.name} - Professional Store`,
          text: shareText,
          url: storeUrl,
        });
        track('store_shared', { source: 'native_share', store_id: storeData.id });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      copyStoreUrl();
    }
  };

  const openStore = () => {
    window.open(storeUrl, '_blank');
    track('store_viewed', { source: 'dashboard_preview', store_id: storeData.id });
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5 text-primary" />
          Multiply Your Influence
        </CardTitle>
        <CardContent className="space-y-4">
          <div className="p-3 bg-background/50 rounded-lg border">
            <div className="text-sm font-medium text-foreground mb-1">Your Store URL</div>
            <div className="text-sm text-muted-foreground break-all">{storeUrl}</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button onClick={copyStoreUrl} variant="outline" size="sm" className="w-full">
              <Copy className="h-4 w-4 mr-2" />
              Copy Link
            </Button>
            
            <Button onClick={openStore} variant="outline" size="sm" className="w-full">
              <ExternalLink className="h-4 w-4 mr-2" />
              Preview
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button onClick={shareOnWhatsApp} variant="outline" size="sm" className="w-full bg-green-50 hover:bg-green-100 text-green-700 border-green-200">
              <Users className="h-4 w-4 mr-2" />
              WhatsApp
            </Button>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full">
                  <QrCode className="h-4 w-4 mr-2" />
                  QR Code
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Store QR Code</DialogTitle>
                </DialogHeader>
                <div className="flex justify-center">
                  <QRCodeGenerator 
                    url={storeUrl} 
                    size={200}
                    storeName={storeData.name}
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Button onClick={shareNative} size="sm" className="w-full">
            <Share2 className="h-4 w-4 mr-2" />
            Share Store
          </Button>

          <div className="text-center">
            <div className="text-xs text-muted-foreground">
              🚀 <strong>Power Move:</strong> Every share builds your reputation as a serious business owner. Watch your network see you differently.
            </div>
          </div>
        </CardContent>
      </CardHeader>
    </Card>
  );
};

export default ShareStoreCard;
