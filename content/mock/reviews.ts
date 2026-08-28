import type { Review } from '@/lib/types';

export const reviews: Review[] = [
  {
    id: 'r1',
    productId: 'p-aqua-daily',
    author: 'Mai N.',
    rating: 5,
    title: 'Super comfortable',
    body: 'No dryness even after 12 hours.',
    createdAt: '2026-06-01',
    hasImages: false,
    source: 'vivimoon',
  },
  {
    id: 'r2',
    productId: 'p-aqua-daily',
    author: 'John D.',
    rating: 4,
    title: 'Good value',
    body: 'Great for daily wear, slightly tricky to insert.',
    createdAt: '2026-06-10',
    hasImages: true,
    source: 'vivimoon',
  },
  {
    id: 'r3',
    productId: 'p-breeze-daily',
    author: 'Linh T.',
    rating: 5,
    title: 'Lightweight all day',
    body: 'Barely notice I have them on, even after long shifts.',
    createdAt: '2026-06-15',
    hasImages: false,
    source: 'vivimoon',
  },
];
