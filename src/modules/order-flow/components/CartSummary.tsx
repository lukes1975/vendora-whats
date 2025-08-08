import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CartItem } from "../hooks/useCart";
import { formatCurrencyKobo } from "../hooks/useWhatsAppCheckout";

export function CartSummary({
  items,
  subtotal,
  onAddDemoItem,
}: {
  items: CartItem[];
  subtotal: number;
  onAddDemoItem?: () => void;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Your cart</CardTitle>
        {onAddDemoItem && (
          <Button size="sm" variant="secondary" onClick={onAddDemoItem}>
            Add demo item
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Your cart is empty.</p>
        ) : (
          <ul className="space-y-2">
            {items.map((i) => (
              <li key={i.id} className="flex items-center justify-between gap-4 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{i.name}</p>
                  <p className="text-muted-foreground">x{i.quantity}</p>
                </div>
                <div className="text-right font-medium">
                  {formatCurrencyKobo(i.price * i.quantity)}
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="flex items-center justify-between border-t pt-3 font-medium">
          <span>Subtotal</span>
          <span>{formatCurrencyKobo(subtotal)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
