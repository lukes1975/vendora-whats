
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Plus, Minus } from "lucide-react";
import { generateSecureWhatsAppUrl } from "@/utils/security";

import { useCart } from "@/modules/order-flow/hooks/useCart";

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
  const { items, addItem, updateQty, removeItem } = useCart();
  const cartItem = items.find((i) => i.id === product.id);

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
    console.log('WhatsApp clicked for product:', product.name);
  };

  const onAdd = () => {
    addItem({ id: product.id, name: product.name, price: Math.round(product.price * 100), imageUrl: product.image_url }, 1);
  };

  const onInc = () => cartItem && updateQty(cartItem.id, cartItem.quantity + 1);
  const onDec = () => {
    if (!cartItem) return;
    if (cartItem.quantity <= 1) removeItem(cartItem.id);
    else updateQty(cartItem.id, cartItem.quantity - 1);
  };

  return (
    <Card id={`product-${product.id}`} className="group hover:shadow-lg transition-all duration-300 rounded-2xl border-border/50">
      <div className="aspect-square overflow-hidden rounded-t-2xl">
        <img
          src={product.image_url || "/placeholder.svg"}
          alt={`${product.name} product photo`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg font-semibold leading-tight line-clamp-2">{product.name}</CardTitle>
        <CardDescription className="text-sm leading-relaxed line-clamp-2">{product.description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xl sm:text-2xl font-bold text-foreground">
            ₦{product.price.toLocaleString()}
          </span>
          <Badge variant="secondary" className="rounded-full">In Stock</Badge>
        </div>

        <div className="space-y-2">
          {cartItem ? (
            <div className="flex items-center gap-2">
              <Button size="icon" variant="outline" className="rounded-full" onClick={onDec} aria-label="Decrease quantity">
                <Minus className="h-4 w-4" />
              </Button>
              <span className="min-w-[2ch] text-center font-medium">{cartItem.quantity}</span>
              <Button size="icon" className="rounded-full" onClick={onInc} aria-label="Increase quantity">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button className="rounded-full w-full" variant="outline" onClick={onAdd}>
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          )}

          <a
            href={generateWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
            onClick={handleWhatsAppClick}
          >
            <Button variant="outline" className="w-full rounded-full">
              <MessageSquare className="mr-2 h-4 w-4" />
              Order via WhatsApp
            </Button>
          </a>

        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;

