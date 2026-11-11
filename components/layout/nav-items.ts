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
  | { kind: 'group'; id: string; label: string; items: NavLink[] }
  /**
   * Sản Phẩm, which browses the catalog by Lens Facet rather than listing collections
   * (#87). It carries no items of its own: the four facets and their values are owned by
   * `LENS_FACETS`, so the desktop panel and the mobile drawer read one source and cannot
   * offer a shopper different things.
   */
  | { kind: 'facets'; id: string; label: string };

/** Primary storefront navigation, shared by the desktop MegaNav and the mobile drawer. */
export function getNavItems(dict: Dictionary, locale: Locale): NavItem[] {
  return [
    { kind: 'link', id: 'about', label: dict.nav.about, href: `/${locale}/about` },
    // The five collections this replaced — new-arrivals, bestsellers, colored-lenses,
    // daily-lenses, sale — keep their routes but lose their only link from the header.
    // Whether they get another one is a merchandising decision for Vivimoon (#114).
    { kind: 'facets', id: 'products', label: dict.nav.products },
    { kind: 'link', id: 'knowledge', label: dict.nav.knowledge, href: `/${locale}/articles` },
    { kind: 'link', id: 'support', label: dict.nav.support, href: `/${locale}/support` },
    { kind: 'link', id: 'order-tracking', label: dict.nav.orderTracking, href: `/${locale}/orders/track` },
  ];
}
