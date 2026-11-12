import { lineKey } from '@/lib/cart/line-key';
import type { Accessory } from '@/lib/api/schemas/catalog';
import type { CartLine } from './cart.types';

/** One unit of an accessory's first variant, as the Bundle block and the mini cart's suggestions add it. */
export function accessoryLine(a: Accessory): CartLine {
  const v = a.variants[0];
  return {
    lineKey: lineKey(v.id),
    productId: a.id,
    variantId: v.id,
    name: a.option === 'volume' ? `${a.name} ${v.label}` : a.name,
    sku: v.sku,
    unitPrice: v.price,
    currency: v.currency,
    quantity: 1,
    image: a.images[0],
    variantLabel: v.label,
  };
}
