/** Commerce rules. All money values are in the base currency (USD). */

export const FREE_SHIPPING_THRESHOLD = 50;

export const PLP_PAGE_SIZE = 12;

export const MAX_QUANTITY = 10;

/** Demo promo codes — a real store would validate these server-side. */
export const PROMO_CODES: Record<string, number> = {
  DARLUX10: 0.1,
  WELCOME15: 0.15,
};

export type DeliveryMethodId = 'standard' | 'express' | 'same-day';

export const DELIVERY_METHODS: { id: DeliveryMethodId; price: number; days: string }[] = [
  { id: 'standard', price: 6, days: '3-5' },
  { id: 'express', price: 14, days: '1-2' },
  { id: 'same-day', price: 22, days: '0' },
];

/** Points earned per 1 USD spent, and the Darlux Circle tier thresholds. */
export const POINTS_PER_DOLLAR = 1;

export const LOYALTY_TIERS = [
  { id: 'insider', min: 0 },
  { id: 'vip', min: 500 },
  { id: 'elite', min: 1500 },
] as const;

export type LoyaltyTierId = (typeof LOYALTY_TIERS)[number]['id'];

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://darlux.com';
