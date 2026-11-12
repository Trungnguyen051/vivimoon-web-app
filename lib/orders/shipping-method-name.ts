import type { Dictionary } from '@/lib/i18n/dictionaries';

/** A shipping option id in the shopper's language; an id the dictionary doesn't know shows as-is. */
export function shippingMethodName(id: string, dict: Dictionary): string {
  const names: Record<string, string> = dict.orderDetail.shippingMethods;
  return Object.hasOwn(names, id) ? names[id] : id;
}
