import type { CartAction, CartState } from './cart.types';

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD': {
      const existing = state.lines.find((l) => l.variantId === action.line.variantId);
      if (existing) {
        return {
          lines: state.lines.map((l) =>
            l.variantId === action.line.variantId
              ? { ...l, quantity: l.quantity + action.line.quantity }
              : l,
          ),
        };
      }
      return { lines: [...state.lines, action.line] };
    }
    case 'UPDATE_QTY':
      return {
        lines: state.lines.map((l) =>
          l.variantId === action.variantId ? { ...l, quantity: Math.max(1, action.quantity) } : l,
        ),
      };
    case 'REMOVE':
      return { lines: state.lines.filter((l) => l.variantId !== action.variantId) };
    case 'CLEAR':
      return { lines: [] };
    default:
      return state;
  }
}

export function cartCount(state: CartState): number {
  return state.lines.reduce((sum, l) => sum + l.quantity, 0);
}

export function cartSubtotal(state: CartState): number {
  return state.lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
}
