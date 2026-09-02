import { lineKey } from '@/lib/cart/line-key';
import type { CartAction, CartState } from './cart.types';

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
      const incoming = { ...action.line, lineKey: key };
      const existing = state.lines.find((l) => l.lineKey === key);
      if (existing) {
        return {
          ...state,
          lines: state.lines.map((l) =>
            l.lineKey === key ? { ...l, quantity: l.quantity + incoming.quantity } : l,
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
          l.lineKey === action.lineKey ? { ...l, quantity: action.quantity } : l,
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

export function cartCount(state: CartState): number {
  return state.lines.reduce((sum, l) => sum + l.quantity, 0);
}

/* `cartSubtotal` intentionally does not exist. Money is server-owned: totals
 * come from POST /api/cart/price so that discount rules stay on the server and
 * behave identically for guests and members (spec §7). */
