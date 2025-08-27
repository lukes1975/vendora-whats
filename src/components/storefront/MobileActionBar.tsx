import { Button } from "@/components/ui/button";
import { MessageCircle, ShoppingCart, Package } from "lucide-react";
import { useCart } from "@/modules/order-flow/hooks/useCart";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface MobileActionBarProps {
  store: {
    whatsapp_number?: string | null;
    name: string;
  };
}

export default function MobileActionBar({ store }: MobileActionBarProps) {
  const { totalItems } = useCart();
  const [trackingCode, setTrackingCode] = useState("");
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  
  const handleWhatsAppContact = () => {
    if (store.whatsapp_number) {
      const message = `Hi! I'm interested in your products at ${store.name}`;
      const whatsappUrl = `https://wa.me/${store.whatsapp_number.replace(/[^\d]/g, '')}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const handleTrackOrder = () => {
    if (trackingCode.trim()) {
      window.open(`/track/${trackingCode.trim()}`, '_blank');
      setIsTrackingOpen(false);
      setTrackingCode("");
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border p-4 md:hidden z-40">
      <div className="flex gap-2 max-w-sm mx-auto">
        {store.whatsapp_number && (
          <Button 
            onClick={handleWhatsAppContact}
            size="lg" 
            className="flex-1 gap-2"
          >
            <MessageCircle size={18} />
            Chat
          </Button>
        )}
        
        <Dialog open={isTrackingOpen} onOpenChange={setIsTrackingOpen}>
          <DialogTrigger asChild>
            <Button size="lg" variant="outline" className="gap-2">
              <Package size={18} />
              Track
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Track Your Order</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Enter tracking code</label>
                <Input
                  placeholder="e.g. WA123ABC"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleTrackOrder()}
                />
              </div>
              <Button onClick={handleTrackOrder} className="w-full" disabled={!trackingCode.trim()}>
                Track Order
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
        {totalItems > 0 && (
          <Link to="/checkout" className="flex-1">
            <Button size="lg" variant="outline" className="w-full gap-2 relative">
              <ShoppingCart size={18} />
              Cart
              <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {totalItems}
              </span>
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
