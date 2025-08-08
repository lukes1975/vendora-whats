import { Button } from "@/components/ui/button";
import { ShoppingCart, MessageSquare } from "lucide-react";
import { useCart } from "@/modules/order-flow/hooks/useCart";
import { buildOrderSummary, getWhatsAppCheckoutLink } from "@/modules/order-flow/hooks/useWhatsAppCheckout";
import { useMemo } from "react";

const DETAILS_KEY = "vendora_delivery_details_v1";

function loadDetails() {
  try {
    const raw = localStorage.getItem(DETAILS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

interface Store {
  name: string;
  whatsapp_number: string;
}

export default function MobileActionBar({ store }: { store: Store }) {
  const { items, subtotal, totalItems } = useCart();
  const details = useMemo(() => loadDetails(), []);

  if (totalItems === 0) return null;

  const onWhatsAppCheckout = () => {
    const message = buildOrderSummary({
      items,
      total: subtotal,
      name: details?.name || "",
      phone: details?.phone || "",
      address: details?.address || "",
      etaMinutes: undefined,
      currency: undefined,
    });
    const url = getWhatsAppCheckoutLink({ vendorPhone: store.whatsapp_number || "", message });
    window.open(url, "_blank");
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 bg-background/95 border-t border-border backdrop-blur supports-[backdrop-filter]:bg-background/80 px-3 sm:px-4 py-2" style={{ paddingBottom: `calc(env(safe-area-inset-bottom) + 0.5rem)` }}>
      <div className="max-w-4xl mx-auto flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-sm text-muted-foreground truncate">{totalItems} item{totalItems>1?"s":""} in cart</div>
          <div className="font-semibold text-foreground truncate">{new Intl.NumberFormat(undefined,{style:"currency",currency:"NGN"}).format(subtotal/100)}</div>
        </div>
        <Button variant="outline" className="rounded-full" onClick={() => (window.location.href = "/checkout")}> 
          <ShoppingCart className="h-4 w-4 mr-1" /> Checkout
        </Button>
        <Button className="rounded-full" onClick={onWhatsAppCheckout}>
          <MessageSquare className="h-4 w-4 mr-1" /> WhatsApp
        </Button>
      </div>
    </div>
  );
}
