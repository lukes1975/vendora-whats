
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";
import { generateSecureWhatsAppUrl } from "@/utils/security";
import PaymentButton from "@/components/payment/PaymentButton";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image_url: string;
  status: string;
}

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

interface ProductCardProps {
  product: Product;
  store: Store;
}

const ProductCard = ({ product, store }: ProductCardProps) => {
  const generateWhatsAppUrl = () => {
    if (!store?.whatsapp_number) return '#';
    
    try {
      const message = `Hi ${store.name}! I'm interested in your ${product.name} for ₦${product.price.toLocaleString()}. Can you tell me more about it?`;
      return generateSecureWhatsAppUrl(store.whatsapp_number, message);
    } catch (error) {
      console.error('Error generating WhatsApp URL:', error);
      return '#';
    }
  };

  const handleWhatsAppClick = () => {
    // Track WhatsApp engagement (this could be sent to analytics)
    console.log('WhatsApp clicked for product:', product.name);
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 rounded-2xl border-border/50">
      <div className="aspect-square overflow-hidden rounded-t-2xl">
        <img
          src={product.image_url || "/placeholder.svg"}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg font-semibold leading-tight">{product.name}</CardTitle>
        <CardDescription className="text-sm leading-relaxed">{product.description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xl sm:text-2xl font-bold text-green-600">
            ₦{product.price.toLocaleString()}
          </span>
          <Badge variant="secondary" className="rounded-full">In Stock</Badge>
        </div>
        
        {/* Actions */}
        <div className="space-y-2">
          {/* Payment Button - Primary CTA */}
          <PaymentButton
            productId={product.id}
            productName={product.name}
            price={product.price}
            storeId={store.id}
            storeName={store.name}
            className="w-full rounded-full"
          />
          
          {/* WhatsApp Button - Secondary CTA */}
          <a
            href={generateWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
            onClick={handleWhatsAppClick}
          >
            <Button variant="outline" className="w-full rounded-full">
              <MessageSquare className="mr-2 h-4 w-4" />
              Ask Question
            </Button>
          </a>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
