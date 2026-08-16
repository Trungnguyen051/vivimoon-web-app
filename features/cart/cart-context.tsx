'use client';
import { createContext, useEffect, useReducer, type ReactNode } from 'react';
import { cartReducer } from './cart-reducer';
import { loadCart, saveCart } from './cart-storage';
import type { CartAction, CartState } from './cart.types';

export const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
} | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { lines: [] });

  useEffect(() => {
    const stored = loadCart();
    if (stored.lines.length) {
      stored.lines.forEach((line) => dispatch({ type: 'ADD', line }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    saveCart(state);
  }, [state]);

  return <CartContext.Provider value={{ state, dispatch }}>{children}</CartContext.Provider>;
}
