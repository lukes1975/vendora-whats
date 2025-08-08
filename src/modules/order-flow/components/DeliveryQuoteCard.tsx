import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrencyKobo } from "../hooks/useWhatsAppCheckout";

export function DeliveryQuoteCard({
  distanceKm,
  etaMinutes,
  baseCost,
  serviceFee,
  surgeMultiplier,
  total,
  currency = "NGN",
}: {
  distanceKm: number;
  etaMinutes: number;
  baseCost: number;
  serviceFee: number;
  surgeMultiplier: number;
  total: number;
  currency?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Delivery estimate</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span>Distance</span>
          <span>{distanceKm.toFixed(1)} km</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span>ETA</span>
          <span>{etaMinutes} mins</span>
        </div>
        <Separator />
        <div className="flex items-center justify-between text-sm">
          <span>Base cost</span>
          <span>{formatCurrencyKobo(baseCost, currency)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span>Service fee</span>
          <span>{formatCurrencyKobo(serviceFee, currency)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span>Surge</span>
          <span>{surgeMultiplier.toFixed(2)}x</span>
        </div>
        <Separator />
        <div className="flex items-center justify-between font-medium">
          <span>Total</span>
          <span>{formatCurrencyKobo(total, currency)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
