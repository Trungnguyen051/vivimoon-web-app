import { describe, it, expect } from 'vitest';
import { cartReducer, cartCount, cartSubtotal } from './cart-reducer';
import type { CartLine, CartState } from './cart.types';

const line: CartLine = {
  productId: 'p1', variantId: 'v1', name: 'Aqua', sku: 'SKU1',
  packSize: '30', unitPrice: 25, currency: 'USD', quantity: 1,
};
const empty: CartState = { lines: [] };

describe('cartReducer', () => {
  it('adds a new line', () => {
    const s = cartReducer(empty, { type: 'ADD', line });
    expect(s.lines).toHaveLength(1);
  });
  it('merges quantity when adding an existing variant', () => {
    const s1 = cartReducer(empty, { type: 'ADD', line });
    const s2 = cartReducer(s1, { type: 'ADD', line: { ...line, quantity: 2 } });
    expect(s2.lines).toHaveLength(1);
    expect(s2.lines[0].quantity).toBe(3);
  });
  it('updates quantity', () => {
    const s1 = cartReducer(empty, { type: 'ADD', line });
    const s2 = cartReducer(s1, { type: 'UPDATE_QTY', variantId: 'v1', quantity: 5 });
    expect(s2.lines[0].quantity).toBe(5);
  });
  it('removes a line', () => {
    const s1 = cartReducer(empty, { type: 'ADD', line });
    const s2 = cartReducer(s1, { type: 'REMOVE', variantId: 'v1' });
    expect(s2.lines).toHaveLength(0);
  });
  it('clears', () => {
    const s1 = cartReducer(empty, { type: 'ADD', line });
    expect(cartReducer(s1, { type: 'CLEAR' }).lines).toHaveLength(0);
  });
  it('computes count and subtotal', () => {
    const s = cartReducer(empty, { type: 'ADD', line: { ...line, quantity: 2 } });
    expect(cartCount(s)).toBe(2);
    expect(cartSubtotal(s)).toBe(50);
  });
  it('HYDRATE sets lines (idempotent, does not merge)', () => {
    const s1 = cartReducer(empty, { type: 'HYDRATE', lines: [line] });
    const s2 = cartReducer(s1, { type: 'HYDRATE', lines: [line] });
    expect(s2.lines).toHaveLength(1);
    expect(s2.lines[0].quantity).toBe(1);
    expect(s2.hydrated).toBe(true);
  });
});
