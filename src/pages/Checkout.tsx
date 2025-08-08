import * as React from "react";
import { motion } from "framer-motion";
import { AddressForm, AddressFormValues } from "@/modules/order-flow/components/AddressForm";
import { CartSummary } from "@/modules/order-flow/components/CartSummary";
import { DeliveryQuoteCard } from "@/modules/order-flow/components/DeliveryQuoteCard";
import { CheckoutOptions } from "@/modules/order-flow/components/CheckoutOptions";
import { useCart } from "@/modules/order-flow/hooks/useCart";
import { useDeliveryQuote } from "@/modules/order-flow/hooks/useDeliveryQuote";
import { buildOrderSummary, getWhatsAppCheckoutLink } from "@/modules/order-flow/hooks/useWhatsAppCheckout";
import { useGeoIP } from "@/modules/order-flow/hooks/useGeoIP";
import { useToast } from "@/hooks/use-toast";

const Checkout: React.FC = () => {
  const { items, subtotal, addItem } = useCart();
  const geo = useGeoIP();
  const [form, setForm] = React.useState<AddressFormValues>({ name: "", phone: "", address: "" });
  const [valid, setValid] = React.useState(false);
  const { quote } = useDeliveryQuote({ address: form.address, vendorLocation: null });
  const { toast } = useToast();

  React.useEffect(() => {
    // SEO
    const title = "Checkout – Vendora";
    document.title = title;

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Fast WhatsApp checkout with instant delivery estimates.");
    } else {
      const meta = document.createElement("meta");
      meta.name = "description";
      meta.content = "Fast WhatsApp checkout with instant delivery estimates.";
      document.head.appendChild(meta);
    }

    const linkCanonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    const canonicalUrl = `${window.location.origin}/checkout`;
    if (linkCanonical) {
      linkCanonical.href = canonicalUrl;
    } else {
      const link = document.createElement("link");
      link.rel = "canonical";
      link.href = canonicalUrl;
      document.head.appendChild(link);
    }

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: window.location.origin },
        { "@type": "ListItem", position: 2, name: "Checkout", item: canonicalUrl },
      ],
    };
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(jsonLd);
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handleFormChange = React.useCallback((values: AddressFormValues, isValid: boolean) => {
    setForm(values);
    setValid(isValid);
  }, []);

  const onAddDemoItem = () => {
    addItem({ id: "demo-1", name: "Sample Product", price: 3500_00 }, 1);
  };

  const handleWhatsAppCheckout = (vendorPhone: string) => {
    if (!valid) {
      toast({ title: "Add details", description: "Please fill your name, phone and address." });
      return;
    }
    if (!quote) {
      toast({ title: "Address needed", description: "Enter a valid delivery address for estimate." });
      return;
    }
    const message = buildOrderSummary({
      items,
      total: subtotal + quote.total,
      name: form.name,
      phone: form.phone,
      address: form.address,
      etaMinutes: quote.etaMinutes,
      currency: geo?.currency,
    });
    const link = getWhatsAppCheckoutLink({ vendorPhone, message });
    window.open(link, "_blank");
    toast({ title: "Opening WhatsApp", description: "Your order summary is prefilled." });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Checkout</h1>
        <p className="text-muted-foreground">Zero-login checkout with delivery estimates</p>
      </header>

      <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <AddressForm onChange={handleFormChange} />
          {quote && (
            <DeliveryQuoteCard
              distanceKm={quote.distanceKm}
              etaMinutes={quote.etaMinutes}
              baseCost={quote.baseCost}
              serviceFee={quote.serviceFee}
              surgeMultiplier={quote.surgeMultiplier}
              total={quote.total}
              currency={geo?.currency || "NGN"}
            />
          )}
        </div>
        <div className="space-y-4">
          <CartSummary items={items} subtotal={subtotal} onAddDemoItem={onAddDemoItem} />
          <CheckoutOptions onWhatsAppCheckout={handleWhatsAppCheckout} />
        </div>
      </motion.section>
    </div>
  );
};

export default Checkout;
