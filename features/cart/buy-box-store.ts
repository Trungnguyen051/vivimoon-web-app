'use client';
import { create } from 'zustand';
import type { CartLine } from './cart.types';

/**
 * The lens line the PDP buy box would add right now (its variant, Purchase Unit
 * and power, one unit). The Bundle block reads it, so the lens it adds is the one
 * the shopper set up in the buy box. Not persisted.
 */
export const useBuyBoxStore = create<{ line: CartLine | null; setLine: (line: CartLine) => void }>((set) => ({
  line: null,
  setLine: (line) => set({ line }),
}));
