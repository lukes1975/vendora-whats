import { CartItem } from "./useCart";

function sanitizePhone(input: string) {
  return input.replace(/[^\d+]/g, "");
}

export function formatCurrencyKobo(amount: number, currency = "NGN") {
  const major = amount / 100;
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(major);
}

export function buildOrderSummary({
  items,
  total,
  name,
  phone,
  address,
  etaMinutes,
  currency,
}: {
  items: CartItem[];
  total: number;
  name: string;
  phone: string;
  address: string;
  etaMinutes?: number;
  currency?: string;
}) {
  const lines = [
    `New order via Vendora`,
    `Name: ${name}`,
    `Phone: ${phone}`,
    `Address: ${address}`,
    `Items:`,
    ...items.map((i) => `• ${i.name} x${i.quantity}`),
    `Total: ${formatCurrencyKobo(total, currency)}`,
    etaMinutes ? `ETA (est): ${etaMinutes} mins` : undefined,
  ].filter(Boolean) as string[];

  return lines.join("\n");
}

export function getWhatsAppCheckoutLink({
  vendorPhone,
  message,
}: {
  vendorPhone: string;
  message: string;
}) {
  const to = sanitizePhone(vendorPhone);
  const text = encodeURIComponent(message);
  return `https://wa.me/${to}?text=${text}`;
}
