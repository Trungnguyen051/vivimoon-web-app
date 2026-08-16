import type { Currency } from '@/lib/types';

export interface CartLine {
  productId: string;
  variantId: string;
  name: string;
  sku: string;
  color?: string;
  packSize: string;
  unitPrice: number;
  currency: Currency;
  quantity: number;
  image?: string;
}

export interface CartState {
  lines: CartLine[];
}

export type CartAction =
  | { type: 'ADD'; line: CartLine }
  | { type: 'UPDATE_QTY'; variantId: string; quantity: number }
  | { type: 'REMOVE'; variantId: string }
  | { type: 'CLEAR' };
