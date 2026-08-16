'use client';
import { createContext, useEffect, useReducer, type Dispatch, type ReactNode } from 'react';
import { cartReducer } from './cart-reducer';
import { loadCart, saveCart } from './cart-storage';
import type { CartAction, CartState } from './cart.types';

export const CartContext = createContext<{
  state: CartState;
  dispatch: Dispatch<CartAction>;
} | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { lines: [] });

  useEffect(() => {
    dispatch({ type: 'HYDRATE', lines: loadCart().lines });
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    saveCart({ lines: state.lines });
  }, [state]);

  return <CartContext.Provider value={{ state, dispatch }}>{children}</CartContext.Provider>;
}
