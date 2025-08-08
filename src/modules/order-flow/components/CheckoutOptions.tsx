import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export function CheckoutOptions({
  onWhatsAppCheckout,
  loading,
}: {
  onWhatsAppCheckout: (vendorPhone: string) => void;
  loading?: boolean;
}) {
  const [vendorPhone, setVendorPhone] = useState("");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Checkout</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-2">
          <label className="text-sm">Seller WhatsApp number</label>
          <Input
            placeholder="e.g. +2348012345678"
            value={vendorPhone}
            onChange={(e) => setVendorPhone(e.target.value)}
            inputMode="tel"
          />
        </div>
        <Button className="w-full" disabled={!vendorPhone || loading} onClick={() => onWhatsAppCheckout(vendorPhone)}>
          Continue in WhatsApp
        </Button>
        <Button className="w-full" variant="outline" disabled>
          Pay with card (coming soon)
        </Button>
      </CardContent>
    </Card>
  );
}
