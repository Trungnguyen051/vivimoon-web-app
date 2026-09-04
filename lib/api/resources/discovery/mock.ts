import { catalog } from '@/lib/api/resources/catalog';
import { eyeEnlargementBand } from '@/lib/products/eye-enlargement';
import type { ComparisonMatrix, ComparisonRow, Product } from '@/lib/api/schemas/catalog';

function cheapestVariant(product: Product) {
  return product.variants.reduce((min, v) => (v.price < min.price ? v : min), product.variants[0]);
}

function toComparisonRow(product: Product): ComparisonRow {
  const variant = cheapestVariant(product);
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    image: product.images[0],
    color: variant.color,
    colorLabel: variant.colorLabel,
    diameter: product.specs.diameter,
    eyeEnlargement: eyeEnlargementBand(product.specs.diameter),
    // "Lifespan" (spec §10) is the existing replacement schedule, relabeled.
    lifespan: product.replacement,
    price: variant.price,
    currency: variant.currency,
  };
}

export const mockDiscovery = {
  /**
   * `catalog.getProductsByIds` already preserves the caller's id order and
   * silently drops unknown ids — both properties this inherits for free, so
   * a stale compare-tray id (a product that left the catalog) degrades the
   * same way a stale Favorite does (spec §10, M3 precedent) rather than
   * erroring.
   */
  async compare(productIds: string[]): Promise<ComparisonMatrix> {
    const products = await catalog.getProductsByIds(productIds);
    return { products: products.map(toComparisonRow) };
  },
};

export type Discovery = typeof mockDiscovery;
