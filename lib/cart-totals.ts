import { DELIVERY_METHODS, FREE_SHIPPING_THRESHOLD, PROMO_CODES, type DeliveryMethodId } from './constants';
import type { CartLine } from '@/store/cart';

export interface CartTotals {
  itemCount: number;
  subtotal: number;
  discount: number;
  /** `null` until a delivery method is chosen (cart page). */
  shipping: number | null;
  total: number;
  qualifiesForFreeShipping: boolean;
  remainingForFreeShipping: number;
  freeShippingProgress: number;
}

/** Standard delivery is free once the subtotal reaches the threshold; faster methods are always charged. */
export function shippingPrice(delivery: DeliveryMethodId, subtotal: number) {
  const method = DELIVERY_METHODS.find((item) => item.id === delivery)!;
  return delivery === 'standard' && subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : method.price;
}

export function computeTotals(
  lines: CartLine[],
  promoCode: string | null,
  delivery: DeliveryMethodId | null = null,
): CartTotals {
  const subtotal = round(lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0));
  const discount = round(subtotal * (promoCode ? PROMO_CODES[promoCode] ?? 0 : 0));
  const shipping = delivery ? shippingPrice(delivery, subtotal) : null;
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  return {
    itemCount: lines.reduce((sum, line) => sum + line.quantity, 0),
    subtotal,
    discount,
    shipping,
    total: round(subtotal - discount + (shipping ?? 0)),
    qualifiesForFreeShipping: remaining === 0,
    remainingForFreeShipping: round(remaining),
    freeShippingProgress: Math.min(1, subtotal / FREE_SHIPPING_THRESHOLD),
  };
}

const round = (value: number) => Math.round(value * 100) / 100;
