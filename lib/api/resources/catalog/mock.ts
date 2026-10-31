import { products, collections, reviews, galleries } from '@/content/mock';
import { diameterMm, parseDiameterRange } from '@/lib/api/schemas/catalog';
import type { Collection, LensGallery, Product, ProductQuery, Review, Variant } from '@/lib/api/schemas/catalog';
import { cheapestVariant } from '@/lib/products/cheapest-variant';

/** Lowest variant price, used for sorting. */
export function minPrice(product: Product): number {
  return cheapestVariant(product).price;
}

export const mockCatalog = {
  async getProductBySlug(slug: string): Promise<Product | null> {
    return products.find((p) => p.slug === slug) ?? null;
  },

  async listProducts(query: ProductQuery = {}): Promise<Product[]> {
    let list = [...products];
    if (query.productLine) list = list.filter((p) => p.productLine === query.productLine);
    if (query.replacement) list = list.filter((p) => p.replacement === query.replacement);
    if (query.brandId) list = list.filter((p) => p.brandId === query.brandId);
    // A comma-separated set, so one link can carry a whole Color Family (CONTEXT.md);
    // a single color is just a set of one, which is what every other caller sends.
    if (query.color) {
      const wanted = query.color.split(',');
      list = list.filter((p) => p.variants.some((v) => v.color !== undefined && wanted.includes(v.color)));
    }
    // Both ends inclusive, which is what makes a one-value bucket like `14.0-14.0`
    // select exactly the lenses of that width. A range the schema would have
    // rejected can only arrive from a caller that bypassed it; matching nothing is
    // the same answer an unknown color already gets.
    if (query.diameter) {
      const range = parseDiameterRange(query.diameter);
      list = range
        ? list.filter((p) => {
            const mm = diameterMm(p.specs.diameter);
            return mm !== null && mm >= range.min && mm <= range.max;
          })
        : [];
    }
    if (query.material) list = list.filter((p) => p.specs.material === query.material);

    switch (query.sort) {
      case 'price-asc': list.sort((a, b) => minPrice(a) - minPrice(b)); break;
      case 'price-desc': list.sort((a, b) => minPrice(b) - minPrice(a)); break;
      case 'bestselling': list.sort((a, b) => b.reviewCount - a.reviewCount); break;
      case 'newest':
        list.sort((a, b) => Number(b.badges.includes('new')) - Number(a.badges.includes('new')));
        break;
      default: break;
    }
    return list;
  },

  async getCollection(slug: string): Promise<Collection | null> {
    return collections.find((c) => c.slug === slug) ?? null;
  },

  async listCollections(): Promise<Collection[]> {
    return [...collections];
  },

  async getProductsByIds(ids: string[]): Promise<Product[]> {
    return ids
      .map((id) => products.find((p) => p.id === id))
      .filter((p): p is Product => Boolean(p));
  },

  async getRelatedProducts(product: Product, limit = 8): Promise<Product[]> {
    return products
      .filter(
        (p) =>
          p.id !== product.id &&
          (p.productLine === product.productLine || p.replacement === product.replacement),
      )
      .slice(0, limit);
  },

  async getReviews(productId: string): Promise<Review[]> {
    return reviews.filter((r) => r.productId === productId);
  },

  /** `null` when the product has no gallery entry — the fallback signal the PDP branches on to render the plain `ProductGallery` instead. */
  async getGallery(productId: string): Promise<LensGallery | null> {
    return galleries.find((g) => g.productId === productId) ?? null;
  },

  /**
   * Finds a variant by id across the whole catalogue, and the product it
   * belongs to. This is the server-side price lookup pricing/mock.ts uses —
   * variant ids are asserted globally unique in tests/contract/fixtures.test.ts.
   */
  async getVariantById(id: string): Promise<{ product: Product; variant: Variant } | null> {
    for (const product of products) {
      const variant = product.variants.find((v) => v.id === id);
      if (variant) return { product, variant };
    }
    return null;
  },
};

export type Catalog = typeof mockCatalog;
