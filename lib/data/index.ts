import { MockProductRepository } from './mock-product-repository';
import type { ProductRepository } from './product-repository';

export const productRepository: ProductRepository = new MockProductRepository();
export type { ProductRepository, ProductQuery } from './product-repository';
