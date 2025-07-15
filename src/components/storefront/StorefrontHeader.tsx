
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Store {
  id: string;
  name: string;
  logo_url: string;
  vendor_id: string;
}

interface StorefrontHeaderProps {
  onShare: () => void;
  store?: Store;
}

const StorefrontHeader = ({ onShare, store }: StorefrontHeaderProps) => {
  const { user } = useAuth();
  const isOwner = user && store && user.id === store.vendor_id;

  return (
    <div className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-40">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* Show store info only to owner */}
          {isOwner && store && (
            <div className="flex items-center space-x-3">
              <img
                src={store.logo_url || "/placeholder.svg"}
                alt={store.name}
                className="w-8 h-8 rounded-full border border-border"
              />
              <span className="font-medium text-foreground text-sm">{store.name}</span>
            </div>
          )}
          
          {!isOwner && <div />}
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onShare}
            className="rounded-full"
          >
            <Share2 className="mr-1 h-4 w-4" />
            Share
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StorefrontHeader;
