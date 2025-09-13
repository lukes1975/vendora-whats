
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface StoreUrlCardProps {
  storeUrl: string;
  storeName?: string;
}

const StoreUrlCard = ({ storeUrl, storeName }: StoreUrlCardProps) => {

  const copyStoreUrl = () => {
    const fullUrl = storeUrl.includes('://') ? storeUrl : `https://${storeUrl}`;
    navigator.clipboard.writeText(fullUrl);
    toast.success("Store URL copied to clipboard!");
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Your Store URL</CardTitle>
        <CardDescription>Share this link with your customers</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 p-3 bg-gray-50 rounded-lg font-mono text-sm break-all">
            {storeUrl.includes('://') ? storeUrl : `https://${storeUrl}`}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={copyStoreUrl}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={storeUrl.includes('://') ? storeUrl : `https://${storeUrl}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StoreUrlCard;
