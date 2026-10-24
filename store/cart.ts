import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MAX_QUANTITY, PROMO_CODES } from '@/lib/constants';
import type { LocalizedString } from '@/lib/types';
import { clamp } from '@/lib/utils';
import { persistOptions } from './storage';

/**
 * A cart line keeps a snapshot of what the shopper saw, so the basket renders
 * without refetching the catalog. A real backend would re-price on checkout.
 */
export interface CartLine {
  key: string;
  productId: string;
  slug: string;
  brand: string;
  name: LocalizedString;
  image: string;
  shade: { id: string; name: LocalizedString; hex: string } | null;
  size: { id: string; label: string } | null;
  unitPrice: number;
  compareAtPrice: number | null;
  quantity: number;
}

export type NewCartLine = Omit<CartLine, 'key' | 'quantity'>;

interface CartState {
  lines: CartLine[];
  promoCode: string | null;
  add: (line: NewCartLine, quantity?: number) => void;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  applyPromo: (code: string) => boolean;
  removePromo: () => void;
}

export const lineKey = (productId: string, shadeId?: string | null, sizeId?: string | null) =>
  [productId, shadeId ?? '-', sizeId ?? '-'].join(':');

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      promoCode: null,
      add: (line, quantity = 1) =>
        set((state) => {
          const key = lineKey(line.productId, line.shade?.id, line.size?.id);
          const existing = state.lines.find((item) => item.key === key);
          if (existing) {
            return {
              lines: state.lines.map((item) =>
                item.key === key ? { ...item, quantity: clamp(item.quantity + quantity, 1, MAX_QUANTITY) } : item,
              ),
            };
          }
          return { lines: [...state.lines, { ...line, key, quantity: clamp(quantity, 1, MAX_QUANTITY) }] };
        }),
      setQuantity: (key, quantity) =>
        set((state) => ({
          lines: state.lines.map((item) =>
            item.key === key ? { ...item, quantity: clamp(quantity, 1, MAX_QUANTITY) } : item,
          ),
        })),
      remove: (key) => set((state) => ({ lines: state.lines.filter((item) => item.key !== key) })),
      clear: () => set({ lines: [], promoCode: null }),
      applyPromo: (code) => {
        const normalized = code.trim().toUpperCase();
        if (!(normalized in PROMO_CODES)) return false;
        set({ promoCode: normalized });
        return true;
      },
      removePromo: () => set({ promoCode: null }),
    }),
    { name: 'darlux-cart', ...persistOptions },
  ),
);

export function selectItemCount(state: CartState) {
  return state.lines.reduce((sum, line) => sum + line.quantity, 0);
}
