import { LOYALTY_TIERS, type LoyaltyTierId } from './constants';

export interface TierStatus {
  current: LoyaltyTierId;
  next: LoyaltyTierId | null;
  /** Points still needed to reach `next`. */
  remaining: number;
  /** 0–1 progress from the current tier to the next. */
  progress: number;
}

export function getTierStatus(points: number): TierStatus {
  const index = LOYALTY_TIERS.reduce((found, tier, i) => (points >= tier.min ? i : found), 0);
  const current = LOYALTY_TIERS[index];
  const next = LOYALTY_TIERS[index + 1];
  if (!next) return { current: current.id, next: null, remaining: 0, progress: 1 };
  return {
    current: current.id,
    next: next.id,
    remaining: next.min - points,
    progress: (points - current.min) / (next.min - current.min),
  };
}
