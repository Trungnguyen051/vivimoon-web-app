import type { Dictionary } from '@/lib/i18n/dictionaries';
import type { Locale } from '@/lib/i18n/config';

/** A destination inside the nav — a top-level item or one of Sản Phẩm's collections. */
export type NavLink = { id: string; label: string; href: string };

/**
 * One top-level entry in the primary nav. The three kinds are the point: Kiến thức
 * and Hỗ trợ have no routes yet, and a `text` item cannot carry an href, so they
 * are inert by construction rather than by styling — no dead link can ship while
 * their own tickets are still open (#40). #42 turns Kiến thức into a `link`.
 */
export type NavItem =
  | ({ kind: 'link' } & NavLink)
  | { kind: 'group'; id: string; label: string; items: NavLink[] }
  | { kind: 'text'; id: string; label: string };

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
    { kind: 'text', id: 'knowledge', label: dict.nav.knowledge },
    { kind: 'text', id: 'support', label: dict.nav.support },
    { kind: 'link', id: 'order-tracking', label: dict.nav.orderTracking, href: `/${locale}/orders/track` },
  ];
}
