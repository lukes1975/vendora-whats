
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Share2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface ShareStoreCardProps {
  storeUrl: string;
  storeName: string;
}

const ShareStoreCard = ({ storeUrl, storeName }: ShareStoreCardProps) => {
  const [copied, setCopied] = useState(false);

  const copyStoreUrl = async () => {
    try {
      await navigator.clipboard.writeText(storeUrl);
      setCopied(true);
      toast.success("Store URL copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy URL");
    }
  };

  const shareOnWhatsApp = () => {
    const message = `Check out my branded storefront: ${storeUrl} — See what I offer and DM me to buy!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const openStore = () => {
    window.open(storeUrl, '_blank');
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Share Your Branded Store Link
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Your branded store link:</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 p-3 bg-muted rounded-lg font-mono text-sm break-all">
              {storeUrl}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={copyStoreUrl}
            className="flex-1 sm:flex-none"
            disabled={copied}
          >
            <Copy className="h-4 w-4 mr-2" />
            {copied ? 'Copied!' : 'Copy Link'}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={shareOnWhatsApp}
            className="flex-1 sm:flex-none bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share on WhatsApp
          </Button>
          
          <Button 
            variant="outline" 
            onClick={openStore}
            className="flex-1 sm:flex-none"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View Your Storefront
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShareStoreCard;
