import type { CartState } from './cart.types';

const KEY = 'vivimoon-cart';

export function loadCart(): CartState {
  if (typeof window === 'undefined') return { lines: [] };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { lines: [] };
    const parsed = JSON.parse(raw) as { lines?: unknown };
    return { lines: Array.isArray(parsed.lines) ? (parsed.lines as CartState['lines']) : [] };
  } catch {
    return { lines: [] };
  }
}

export function saveCart(state: CartState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ lines: state.lines }));
  } catch {
    // ignore storage quota / private-mode errors
  }
}
