import type { LensGallery } from '@/lib/types';

/**
 * PROVISIONAL — real per-context photography pending Vivimoon (spec §11).
 * Owner: Vivimoon. Same convention as `lib/orders/statuses.ts`.
 *
 * Populated for 2 demo products only, by cycling each product's existing
 * `images[]` across the five contexts — there is no new photography here,
 * only different orderings of what already exists. Every other product has
 * no entry, which is the fallback path the PDP (`LensViewer`) exercises.
 */
export const galleries: LensGallery[] = [
  {
    productId: 'p-aqua-daily',
    contexts: {
      eye: ['/images/products/aqua-daily-1.jpg', '/images/products/aqua-daily-2.jpg'],
      face: ['/images/products/aqua-daily-2.jpg', '/images/products/aqua-daily-1.jpg'],
      withMakeup: ['/images/products/aqua-daily-1.jpg'],
      withoutMakeup: ['/images/products/aqua-daily-2.jpg'],
      byEyeColor: {
        brown: ['/images/products/aqua-daily-1.jpg'],
        blue: ['/images/products/aqua-daily-2.jpg'],
        green: ['/images/products/aqua-daily-1.jpg', '/images/products/aqua-daily-2.jpg'],
      },
    },
  },
  {
    productId: 'p-mystic-daily',
    contexts: {
      eye: ['/images/products/mystic-daily-1.jpg', '/images/products/mystic-daily-2.jpg'],
      face: ['/images/products/mystic-daily-2.jpg', '/images/products/mystic-daily-1.jpg'],
      withMakeup: ['/images/products/mystic-daily-2.jpg'],
      withoutMakeup: ['/images/products/mystic-daily-1.jpg'],
      byEyeColor: {
        brown: ['/images/products/mystic-daily-1.jpg'],
        hazel: ['/images/products/mystic-daily-2.jpg'],
      },
    },
  },
];
