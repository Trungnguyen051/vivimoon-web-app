import type { Product, Variant } from '@/lib/types';

export interface Ga4Item {
  item_id: string;
  item_name: string;
  item_brand: string;
  item_category: string;
  price: number;
  quantity: number;
}

export function toGa4Items(
  entries: { product: Product; variant?: Variant; quantity?: number }[],
): Ga4Item[] {
  return entries.map(({ product, variant, quantity }) => ({
    item_id: variant?.sku ?? product.id,
    item_name: product.name,
    item_brand: product.brandName,
    item_category: product.type,
    price: variant?.price ?? Math.min(...product.variants.map((v) => v.price)),
    quantity: quantity ?? 1,
  }));
}

/** Map cart-line snapshots (which lack a full Product) to GA4 items. */
export function cartLinesToGa4Items(
  lines: { sku: string; name: string; unitPrice: number; quantity: number }[],
): Ga4Item[] {
  return lines.map((l) => ({
    item_id: l.sku,
    item_name: l.name,
    item_brand: 'Vivimoon',
    item_category: '',
    price: l.unitPrice,
    quantity: l.quantity,
  }));
}

export type AnalyticsEvent =
  | { name: 'view_item_list'; params: { item_list_id: string; items: Ga4Item[] } }
  | { name: 'select_item'; params: { item_list_id: string; items: Ga4Item[] } }
  | { name: 'view_item'; params: { items: Ga4Item[] } }
  | { name: 'add_to_cart'; params: { currency: string; value: number; items: Ga4Item[] } }
  | { name: 'remove_from_cart'; params: { currency: string; value: number; items: Ga4Item[] } }
  | { name: 'view_cart'; params: { currency: string; value: number; items: Ga4Item[] } }
  | { name: 'begin_checkout'; params: { currency: string; value: number; items: Ga4Item[] } }
  | { name: 'purchase'; params: { transaction_id: string; currency: string; value: number; items: Ga4Item[] } };
