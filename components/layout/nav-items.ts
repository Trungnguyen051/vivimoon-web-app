import type { Dictionary } from '@/lib/i18n/dictionaries';
import type { Locale } from '@/lib/i18n/config';

/** A destination inside the nav — a top-level item or one of Sản Phẩm's collections. */
export type NavLink = { id: string; label: string; href: string };

/**
 * One top-level entry in the primary nav. A third kind used to exist — inert `text`,
 * for an item with nowhere to point — so that no dead link could ship while its own
 * ticket was open (#40). #42 routed Kiến thức and #72 routed Hỗ trợ, which emptied
 * that variant, and an alternative with no members stops being a guarantee. What
 * replaced it is `tests/nav-destinations.test.ts`: an href resolving to a route
 * nobody built now fails CI rather than 404ing in production.
 */
export type NavItem =
  | ({ kind: 'link' } & NavLink)
  | { kind: 'group'; id: string; label: string; items: NavLink[] };

/** The five collections, which the design nests under Sản Phẩm rather than listing flat. */
function getCollectionLinks(dict: Dictionary, locale: Locale): NavLink[] {
  return [
    { id: 'new-arrivals', label: dict.collection.newArrivals, href: `/${locale}/collection/new-arrivals` },
    { id: 'bestsellers', label: dict.collection.bestsellers, href: `/${locale}/collection/bestsellers` },
    { id: 'colored-lenses', label: dict.collection.colored, href: `/${locale}/collection/colored-lenses` },
    { id: 'daily-lenses', label: dict.collection.daily, href: `/${locale}/collection/daily-lenses` },
    { id: 'sale', label: dict.nav.sale, href: `/${locale}/collection/sale` },
  ];
}

/** Primary storefront navigation, shared by the desktop MegaNav and the mobile drawer. */
export function getNavItems(dict: Dictionary, locale: Locale): NavItem[] {
  return [
    { kind: 'link', id: 'about', label: dict.nav.about, href: `/${locale}/about` },
    { kind: 'group', id: 'products', label: dict.nav.products, items: getCollectionLinks(dict, locale) },
    { kind: 'link', id: 'knowledge', label: dict.nav.knowledge, href: `/${locale}/articles` },
    { kind: 'link', id: 'support', label: dict.nav.support, href: `/${locale}/support` },
    { kind: 'link', id: 'order-tracking', label: dict.nav.orderTracking, href: `/${locale}/orders/track` },
  ];
}
