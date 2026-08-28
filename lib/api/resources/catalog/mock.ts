import { products, collections, reviews } from '@/content/mock';
import type { Collection, Product, ProductQuery, Review } from '@/lib/api/schemas/catalog';

/** Lowest variant price, used for sorting. */
export function minPrice(product: Product): number {
  return Math.min(...product.variants.map((v) => v.price));
}

export const mockCatalog = {
  async getProductBySlug(slug: string): Promise<Product | null> {
    return products.find((p) => p.slug === slug) ?? null;
  },

  async listProducts(query: ProductQuery = {}): Promise<Product[]> {
    let list = [...products];
    if (query.type) list = list.filter((p) => p.type === query.type);
    if (query.replacement) list = list.filter((p) => p.replacement === query.replacement);
    if (query.brandId) list = list.filter((p) => p.brandId === query.brandId);
    if (query.color) list = list.filter((p) => p.variants.some((v) => v.color === query.color));

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
          (p.type === product.type || p.replacement === product.replacement),
      )
      .slice(0, limit);
  },

  async getReviews(productId: string): Promise<Review[]> {
    return reviews.filter((r) => r.productId === productId);
  },
};

export type Catalog = typeof mockCatalog;
