import { lineKey } from '@/lib/cart/line-key';
import { MAX_LINE_QUANTITY, cartLineSchema } from '@/lib/api/schemas/cart';
import { purchaseUnitOf } from '@/lib/api/schemas/rx';
import type { CartAction, CartLine, CartState } from './cart.types';

/**
 * Pure cart logic. The zustand store delegates to this (spec §8), so the cart's
 * behaviour stays covered by direct reducer tests rather than through the store.
 *
 * Lines are addressed by `lineKey` (variant + prescription), never by
 * `variantId`: the same variant at two different powers is two lines (spec §7).
 */
export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD': {
      const key = action.line.lineKey || lineKey(action.line.variantId, action.line.rx);
      const incoming = { ...action.line, lineKey: key, quantity: Math.min(action.line.quantity, MAX_LINE_QUANTITY) };
      const existing = state.lines.find((l) => l.lineKey === key);
      if (existing) {
        return {
          ...state,
          lines: state.lines.map((l) =>
            l.lineKey === key ? { ...l, quantity: Math.min(l.quantity + incoming.quantity, MAX_LINE_QUANTITY) } : l,
          ),
        };
      }
      return { ...state, lines: [...state.lines, incoming] };
    }
    case 'UPDATE_QTY': {
      // Decrementing to zero means "remove". Clamping to 1 would strand a line
      // the shopper was trying to delete.
      if (action.quantity < 1) {
        return { ...state, lines: state.lines.filter((l) => l.lineKey !== action.lineKey) };
      }
      return {
        ...state,
        lines: state.lines.map((l) =>
          l.lineKey === action.lineKey ? { ...l, quantity: Math.min(action.quantity, MAX_LINE_QUANTITY) } : l,
        ),
      };
    }
    case 'REMOVE':
      return { ...state, lines: state.lines.filter((l) => l.lineKey !== action.lineKey) };
    case 'CLEAR':
      return { ...state, lines: [] };
    default:
      return state;
  }
}

/**
 * Reads one line back from storage, or null when it no longer parses — per
 * line, so one corrupt line never costs the shopper the rest of their cart.
 * A lens line saved before Purchase Units existed is read as a `pair`, which
 * is what it always meant (ADR-0023); its key is unchanged, since a pair's
 * key format predates units.
 */
export function readPersistedLine(raw: unknown): CartLine | null {
  const parsed = cartLineSchema.safeParse(raw);
  if (!parsed.success) return null;
  const purchaseUnit = purchaseUnitOf(parsed.data);
  return purchaseUnit ? { ...parsed.data, purchaseUnit } : parsed.data;
}

export function cartCount(state: CartState): number {
  return state.lines.reduce((sum, l) => sum + l.quantity, 0);
}

/* `cartSubtotal` intentionally does not exist. Money is server-owned: totals
 * come from POST /api/cart/price so that discount rules stay on the server and
 * behave identically for guests and members (spec §7). */
