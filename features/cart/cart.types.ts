/**
 * Cart domain types. Schemas are the single source of truth (M1 constraint);
 * this module only re-exports them plus the reducer's action union.
 */
export type { CartLine, CartState } from '@/lib/api/schemas/cart';
import type { CartLine } from '@/lib/api/schemas/cart';

/**
 * Lines are addressed by `lineKey`, never by `variantId` — two lines can share
 * a variant and differ only by prescription (spec §7).
 */
export type CartAction =
  | { type: 'ADD'; line: CartLine }
  | { type: 'UPDATE_QTY'; lineKey: string; quantity: number }
  | { type: 'REMOVE'; lineKey: string }
  | { type: 'CLEAR' };
