'use client';
import { useContext } from 'react';
import { CartContext } from './cart-context';
import { cartCount, cartSubtotal } from './cart-reducer';
import type { CartLine } from './cart.types';

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  const { state, dispatch } = ctx;
  return {
    lines: state.lines,
    count: cartCount(state),
    subtotal: cartSubtotal(state),
    currency: state.lines[0]?.currency ?? 'USD',
    add: (line: CartLine) => dispatch({ type: 'ADD', line }),
    updateQty: (variantId: string, quantity: number) => dispatch({ type: 'UPDATE_QTY', variantId, quantity }),
    remove: (variantId: string) => dispatch({ type: 'REMOVE', variantId }),
    clear: () => dispatch({ type: 'CLEAR' }),
  };
}
