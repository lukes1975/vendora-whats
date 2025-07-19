
import { Button } from "@/components/ui/button";
import { Share2, MessageSquare } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { generateWhatsAppLink } from "@/utils/whatsapp";

interface Store {
  id: string;
  name: string;
  logo_url: string;
  vendor_id: string;
  whatsapp_number: string;
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
          <div className="flex items-center">
            <img 
              src="/lovable-uploads/fd1cf987-9f9a-4873-8bab-01b4cd7bb0f9.png" 
              alt="Vendora" 
              className="h-8 w-8"
            />
          </div>
          
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
