
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
          {/* Mobile: Show store name to all users */}
          <div className="flex items-center space-x-3 md:hidden">
            {store && (
              <>
                <img
                  src={store.logo_url || "/placeholder.svg"}
                  alt={store.name}
                  className="w-8 h-8 rounded-full border border-border"
                />
                <span className="font-medium text-foreground text-sm">PECKYCAKES EMPIRE</span>
              </>
            )}
          </div>

          {/* Desktop: Show store info only to owner */}
          {isOwner && store && (
            <div className="hidden md:flex items-center space-x-3">
              <img
                src={store.logo_url || "/placeholder.svg"}
                alt={store.name}
                className="w-8 h-8 rounded-full border border-border"
              />
              <span className="font-medium text-foreground text-sm">{store.name}</span>
            </div>
          )}
          
          {!isOwner && <div className="hidden md:block" />}
          
          <div className="flex items-center space-x-2">
            {/* Mobile: WhatsApp CTA */}
            {store?.whatsapp_number && (
              <a
                href={generateWhatsAppLink(store.whatsapp_number, undefined, store.name)}
                target="_blank"
                rel="noopener noreferrer"
                className="md:hidden"
              >
                <Button 
                  size="sm" 
                  className="bg-green-600 hover:bg-green-700 text-white rounded-full px-3"
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </a>
            )}
            
            {/* Share button - always visible */}
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
    </div>
  );
};

export default StorefrontHeader;
