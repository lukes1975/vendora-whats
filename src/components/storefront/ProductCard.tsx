
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";
import { generateSecureWhatsAppUrl } from "@/utils/security";

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
  const generateWhatsAppLink = () => {
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
    <Card className="group hover:shadow-lg transition-all duration-200">
      <div className="aspect-square overflow-hidden rounded-t-lg">
        <img
          src={product.image_url || "/placeholder.svg"}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        />
      </div>
      <CardHeader>
        <CardTitle className="text-lg">{product.name}</CardTitle>
        <CardDescription>{product.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <span className="text-2xl font-bold text-green-600">
            ₦{product.price.toLocaleString()}
          </span>
          <Badge variant="secondary">In Stock</Badge>
        </div>
        <a
          href={generateWhatsAppLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
          onClick={handleWhatsAppClick}
        >
          <Button className="w-full bg-green-600 hover:bg-green-700">
            <MessageSquare className="mr-2 h-4 w-4" />
            Order on WhatsApp
          </Button>
        </a>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
