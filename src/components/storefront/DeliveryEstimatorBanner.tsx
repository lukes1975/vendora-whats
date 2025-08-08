import { MapPin, Clock, Truck, Pencil } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AddressForm, AddressFormValues } from "@/modules/order-flow/components/AddressForm";
import { useGeoIP } from "@/modules/order-flow/hooks/useGeoIP";
import { useDeliveryQuote } from "@/modules/order-flow/hooks/useDeliveryQuote";
import { formatCurrencyKobo } from "@/modules/order-flow/hooks/useWhatsAppCheckout";
import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "vendora_delivery_details_v1";

function loadDetails(): AddressFormValues | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AddressFormValues) : null;
  } catch {
    return null;
  }
}

function saveDetails(values: AddressFormValues) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
  } catch {}
}

export default function DeliveryEstimatorBanner() {
  const geo = useGeoIP();
  const [details, setDetails] = useState<AddressFormValues | null>(() => loadDetails());
  const [open, setOpen] = useState(false);

  const address = details?.address ?? "";
  const { quote } = useDeliveryQuote({ address, vendorLocation: undefined });

  useEffect(() => {
    if (details) saveDetails(details);
  }, [details]);

  const currency = geo?.currency || "NGN";
  const summary = useMemo(() => {
    if (!quote) return null;
    return {
      distance: `${quote.distanceKm.toFixed(1)} km`,
      eta: `${quote.etaMinutes} mins`,
      total: formatCurrencyKobo(quote.total, currency),
      base: formatCurrencyKobo(quote.baseCost, currency),
      fee: formatCurrencyKobo(quote.serviceFee, currency),
    };
  }, [quote, currency]);

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 mt-4">
      <Card className="p-3 sm:p-4 rounded-2xl border-border/60 bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Truck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{details?.address ? details.address : `Delivering in ${geo?.country ?? "your area"}`}</span>
              </div>
              {summary ? (
                <div className="mt-1 text-sm sm:text-base">
                  <span className="font-medium">Delivery:</span> {summary.total}
                  <span className="mx-2 text-muted-foreground">•</span>
                  <span className="font-medium">ETA:</span> {summary.eta}
                  <span className="mx-2 text-muted-foreground">•</span>
                  <span className="font-medium">Distance:</span> {summary.distance}
                </div>
              ) : (
                <div className="mt-1 text-sm text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Set your address to see ETA and delivery cost</span>
                </div>
              )}
            </div>
          </div>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button size="sm" variant="outline" className="rounded-full"><Pencil className="h-3.5 w-3.5 mr-1"/>Change</Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Delivery details</SheetTitle>
              </SheetHeader>
              <div className="py-3">
                <AddressForm
                  defaultValues={details ?? undefined}
                  onChange={(vals, isValid) => {
                    if (isValid) setDetails(vals);
                  }}
                />
                <div className="mt-4 flex justify-end">
                  <Button onClick={() => setOpen(false)} className="rounded-full">Done</Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </Card>
    </div>
  );
}
