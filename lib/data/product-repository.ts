import type {
  Product, Collection, Review, LensType, ReplacementSchedule, ProductBadge,
} from '@/lib/types';

export interface ProductQuery {
  type?: LensType;
  replacement?: ReplacementSchedule;
  brandId?: string;
  color?: string;
  badges?: ProductBadge[];
  sort?: 'newest' | 'price-asc' | 'price-desc' | 'bestselling';
}

export interface ProductRepository {
  getProductBySlug(slug: string): Promise<Product | null>;
  listProducts(query?: ProductQuery): Promise<Product[]>;
  getCollection(slug: string): Promise<Collection | null>;
  listCollections(): Promise<Collection[]>;
  getProductsByIds(ids: string[]): Promise<Product[]>;
  getRelatedProducts(product: Product, limit?: number): Promise<Product[]>;
  getReviews(productId: string): Promise<Review[]>;
}

/** Lowest variant price, used for sorting. */
export function minPrice(product: Product): number {
  return Math.min(...product.variants.map((v) => v.price));
}
