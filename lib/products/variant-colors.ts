import type { Variant } from '@/lib/api/schemas/catalog';

/**
 * One representative variant per distinct `color`, in first-seen order.
 * Variants with no color (colorless lens types) are excluded.
 */
export function distinctColorVariants(variants: Variant[]): Variant[] {
  return Array.from(new Map(variants.filter((v) => v.color).map((v) => [v.color, v])).values());
}
