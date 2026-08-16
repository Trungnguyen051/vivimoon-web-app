import type { Collection } from '@/lib/types';
import { products } from './products';

const byBadge = (badge: string) =>
  products.filter((p) => p.badges.includes(badge as never)).map((p) => p.id);

export const collections: Collection[] = [
  { slug: 'new-arrivals', title: 'collection.newArrivals', productIds: byBadge('new') },
  { slug: 'bestsellers', title: 'collection.bestsellers', productIds: byBadge('bestseller') },
  { slug: 'sale', title: 'collection.sale', productIds: byBadge('sale') },
  {
    slug: 'colored-lenses',
    title: 'collection.colored',
    productIds: products.filter((p) => p.type === 'colored').map((p) => p.id),
  },
  {
    slug: 'daily-lenses',
    title: 'collection.daily',
    productIds: products.filter((p) => p.replacement === 'daily').map((p) => p.id),
  },
];
