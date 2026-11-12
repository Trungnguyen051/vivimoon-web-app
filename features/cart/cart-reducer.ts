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
  const unticked = state.unticked ?? [];
  const without = (...keys: string[]) => unticked.filter((k) => !keys.includes(k));
  switch (action.type) {
    case 'ADD': {
      const key = action.line.lineKey || lineKey(action.line.variantId, action.line.rx, action.line.bundle);
      const incoming = { ...action.line, lineKey: key, quantity: Math.min(action.line.quantity, MAX_LINE_QUANTITY) };
      const existing = state.lines.find((l) => l.lineKey === key);
      // Adding a line again means the shopper wants it now: it is ticked again.
      state = { ...state, unticked: without(key) };
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
        return { ...state, lines: state.lines.filter((l) => l.lineKey !== action.lineKey), unticked: without(action.lineKey) };
      }
      return {
        ...state,
        lines: state.lines.map((l) =>
          l.lineKey === action.lineKey ? { ...l, quantity: Math.min(action.quantity, MAX_LINE_QUANTITY) } : l,
        ),
      };
    }
    case 'EDIT': {
      const key = lineKey(action.line.variantId, action.line.rx, action.line.bundle);
      const edited = { ...action.line, lineKey: key };
      const twin = state.lines.find((l) => l.lineKey === key && l.lineKey !== action.lineKey);
      // An unticked line stays unticked under its new key; merged into a twin, it takes the twin's tick.
      const wasUnticked = unticked.includes(action.lineKey);
      if (!twin) {
        return {
          ...state,
          lines: state.lines.map((l) => (l.lineKey === action.lineKey ? edited : l)),
          unticked: wasUnticked ? [...without(action.lineKey, key), key] : unticked,
        };
      }
      return {
        ...state,
        unticked: without(action.lineKey),
        lines: state.lines
          .filter((l) => l.lineKey !== action.lineKey)
          .map((l) => (l === twin ? { ...l, quantity: Math.min(l.quantity + edited.quantity, MAX_LINE_QUANTITY) } : l)),
      };
    }
    case 'REMOVE':
      return { ...state, lines: state.lines.filter((l) => l.lineKey !== action.lineKey), unticked: without(action.lineKey) };
    case 'REMOVE_LINES':
      return {
        ...state,
        lines: state.lines.filter((l) => !action.lineKeys.includes(l.lineKey)),
        unticked: without(...action.lineKeys),
      };
    case 'TICK':
      return { ...state, unticked: action.ticked ? without(action.lineKey) : [...without(action.lineKey), action.lineKey] };
    case 'TICK_ALL':
      return { ...state, unticked: action.ticked ? [] : state.lines.map((l) => l.lineKey) };
    case 'CLEAR':
      return { ...state, lines: [], unticked: [] };
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

/** The lines the shopper ticked: the only ones priced and checked out. */
export function tickedLines(state: CartState): CartLine[] {
  const unticked = state.unticked ?? [];
  return unticked.length === 0 ? state.lines : state.lines.filter((l) => !unticked.includes(l.lineKey));
}

export function cartCount(state: CartState): number {
  return state.lines.reduce((sum, l) => sum + l.quantity, 0);
}

/* `cartSubtotal` intentionally does not exist. Money is server-owned: totals
 * come from POST /api/cart/price so that discount rules stay on the server and
 * behave identically for guests and members (spec §7). */
