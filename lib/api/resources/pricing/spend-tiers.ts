import type { NextSpendTier, SpendTier } from '@/lib/api/schemas/cart';

/**
 * PROVISIONAL (CONTEXT.md "Spend Tier"): Vivimoon has not confirmed its real
 * promotion rules. Ascending by threshold, in ₫.
 */
export const SPEND_TIERS = [
  { threshold: 300_000, reward: 'freeShipping' },
  { threshold: 500_000, reward: 'gift' },
  { threshold: 800_000, reward: 'discount', value: 50_000 },
] as const satisfies readonly Omit<SpendTier, 'reached'>[];

/** The variant the 500.000₫ tier gives away: Khay đựng + dụng cụ. */
export const TIER_GIFT_VARIANT_ID = 'a-khay-dung-set';

/** Which tiers `amount` reaches, the next one and what is left to it, and what the reached ones are worth. */
export function spendTiersFor(amount: number): {
  tiers: SpendTier[];
  next: NextSpendTier | undefined;
  freeShipping: boolean;
  gift: boolean;
  discount: number;
} {
  const tiers: SpendTier[] = SPEND_TIERS.map((t) => ({ ...t, reached: amount >= t.threshold }));
  const upcoming = SPEND_TIERS.find((t) => amount < t.threshold);
  const reached = (reward: SpendTier['reward']) => tiers.some((t) => t.reward === reward && t.reached);
  return {
    tiers,
    next: upcoming && { ...upcoming, remaining: upcoming.threshold - amount },
    freeShipping: reached('freeShipping'),
    gift: reached('gift'),
    discount: tiers.reduce((sum, t) => sum + (t.reached && t.reward === 'discount' ? t.value ?? 0 : 0), 0),
  };
}
