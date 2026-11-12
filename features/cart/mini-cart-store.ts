'use client';
import { create } from 'zustand';
import type { CartLine } from './cart.types';

/**
 * The cart-UI signal: any "Thêm vào giỏ" (PDP buy box, Bundle, Quick add,
 * product cards) calls `show` with what it just added, and the mini cart
 * drawer opens confirming it. Mua ngay never calls it. Not persisted.
 */
export const useMiniCartStore = create<{
  open: boolean;
  added: CartLine[];
  show: (added: CartLine[]) => void;
  setOpen: (open: boolean) => void;
}>((set) => ({
  open: false,
  added: [],
  show: (added) => set({ open: true, added }),
  setOpen: (open) => set({ open }),
}));
