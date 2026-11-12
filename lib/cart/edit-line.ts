import { isSingleRx, lensesIn, purchaseUnitOf, type PurchaseUnit } from '@/lib/api/schemas/rx';
import type { CartLine } from '@/lib/api/schemas/cart';

export type Eye = 'left' | 'right';

/** A lens line's power per eye; a single lens reads as the same power in both. */
export function powersOf(line: CartLine): Record<Eye, number> {
  const rx = line.rx!;
  if (isSingleRx(rx)) return { left: rx.sph, right: rx.sph };
  return { left: rx.left.sph, right: rx.right.sph };
}

/**
 * The line bought in another unit or at other powers. Re-keying and merging is
 * the cart reducer's EDIT. A pair becoming a single keeps the left eye's power,
 * as the buy box does. `unitPrice` is a display snapshot (ADR-0003).
 */
export function editLens(line: CartLine, change: { unit?: PurchaseUnit; eye?: Eye; sph?: number }): CartLine {
  const from = purchaseUnitOf(line) ?? 'pair';
  const unit = change.unit ?? from;
  const powers = powersOf(line);
  if (change.sph !== undefined) {
    if (change.eye) powers[change.eye] = change.sph;
    else powers.left = powers.right = change.sph;
  }
  return {
    ...line,
    purchaseUnit: unit,
    rx: unit === 'single'
      ? { sph: powers.left }
      : { sameBothEyes: false, left: { sph: powers.left }, right: { sph: powers.right } },
    unitPrice: (line.unitPrice / lensesIn(from)) * lensesIn(unit),
  };
}
