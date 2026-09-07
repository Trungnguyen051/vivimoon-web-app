import type { Product } from '@/lib/api/schemas/catalog';

/** The lowest-priced variant, ties broken by array order. */
export function cheapestVariant(product: Product) {
  return product.variants.reduce((min, v) => (v.price < min.price ? v : min), product.variants[0]);
}
