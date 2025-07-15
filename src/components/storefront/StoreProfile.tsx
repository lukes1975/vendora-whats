
import { Button } from "@/components/ui/button";
import { MessageSquare, Heart } from "lucide-react";
import { generateWhatsAppLink } from "@/utils/whatsapp";

interface Store {
  id: string;
  name: string;
  description: string;
  whatsapp_number: string;
  logo_url: string;
  cover_image_url: string;
  slug: string;
  vendor_id: string;
}

interface StoreProfileProps {
  store: Store;
}

const StoreProfile = ({ store }: StoreProfileProps) => {
  const handleFollowClick = () => {
    if (store.whatsapp_number) {
      const message = `I want to follow ${store.name}`;
      const whatsappUrl = generateWhatsAppLink(store.whatsapp_number, undefined, store.name);
      window.open(whatsappUrl, '_blank');
    }
  };

  return (
    <div className="relative">
      {/* Sticky mobile header section */}
      <div className="lg:hidden sticky top-14 bg-background/95 backdrop-blur-sm border-b border-border z-30 py-3 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src={store.logo_url || "/placeholder.svg"}
              alt={store.name}
              className="w-10 h-10 rounded-full border-2 border-primary/20"
            />
            <div>
              <h2 className="font-semibold text-foreground text-sm leading-tight">{store.name}</h2>
            </div>
          </div>
          {store.whatsapp_number && (
            <a
              href={generateWhatsAppLink(store.whatsapp_number, undefined, store.name)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white rounded-full">
                <MessageSquare className="h-4 w-4" />
              </Button>
            </a>
          )}
        </div>
      </div>

      {/* Cover image */}
      <div className="h-32 sm:h-40 lg:h-48 bg-gradient-to-r from-primary/20 to-accent/30 overflow-hidden">
        {store.cover_image_url ? (
          <img
            src={store.cover_image_url}
            alt="Store cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/30 via-accent/20 to-secondary/40" />
        )}
      </div>

      {/* Store info card */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-12 sm:-mt-16 pb-6 sm:pb-8">
          <div className="bg-card rounded-2xl shadow-xl border border-border p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
              <img
                src={store.logo_url || "/placeholder.svg"}
                alt={store.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-background shadow-lg"
              />
              <div className="text-center sm:text-left flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2 leading-tight">
                  {store.name}
                </h1>
                <p className="text-muted-foreground mb-4 sm:mb-6 max-w-2xl text-sm sm:text-base leading-relaxed">
                  {store.description || "Welcome to our store!"}
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  {store.whatsapp_number && (
                    <a
                      href={generateWhatsAppLink(store.whatsapp_number, undefined, store.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button className="bg-green-600 hover:bg-green-700 text-white rounded-full w-full sm:w-auto">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        DM to Connect
                      </Button>
                    </a>
                  )}
                  <Button 
                    variant="outline" 
                    className="rounded-full w-full sm:w-auto"
                    onClick={handleFollowClick}
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    Follow Brand
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreProfile;
