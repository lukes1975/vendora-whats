
import { Button } from "@/components/ui/button";
import { MessageSquare, Heart } from "lucide-react";

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
  return (
    <div className="relative">
      <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 overflow-hidden">
        {store.cover_image_url ? (
          <img
            src={store.cover_image_url}
            alt="Store cover"
            className="w-full h-full object-cover mix-blend-overlay"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600" />
        )}
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-16 pb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
              <img
                src={store.logo_url || "/placeholder.svg"}
                alt={store.name}
                className="w-20 h-20 rounded-full border-4 border-white shadow-lg"
              />
              <div className="text-center sm:text-left flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  {store.name}
                </h1>
                <p className="text-gray-600 mb-4 max-w-2xl">
                  {store.description || "Welcome to our store!"}
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  {store.whatsapp_number && (
                    <a
                      href={`https://wa.me/${store.whatsapp_number.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button className="bg-green-600 hover:bg-green-700">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Message on WhatsApp
                      </Button>
                    </a>
                  )}
                  <Button variant="outline">
                    <Heart className="mr-2 h-4 w-4" />
                    Follow Store
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
