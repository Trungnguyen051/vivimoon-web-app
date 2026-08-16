import type { Dictionary } from '@/lib/i18n/dictionaries';

export type NavItem = { label: string; slug: string };

/** Primary storefront navigation, shared by the desktop MegaNav and the mobile drawer. */
export function getNavItems(dict: Dictionary): NavItem[] {
  return [
    { label: dict.collection.newArrivals, slug: 'new-arrivals' },
    { label: dict.collection.bestsellers, slug: 'bestsellers' },
    { label: dict.collection.colored, slug: 'colored-lenses' },
    { label: dict.collection.daily, slug: 'daily-lenses' },
    { label: dict.nav.sale, slug: 'sale' },
  ];
}
