import type { CartState } from './cart.types';

const KEY = 'vivimoon-cart';

export function loadCart(): CartState {
  if (typeof window === 'undefined') return { lines: [] };
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CartState) : { lines: [] };
  } catch {
    return { lines: [] };
  }
}

export function saveCart(state: CartState): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEY, JSON.stringify(state));
}
