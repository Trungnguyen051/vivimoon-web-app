import { describe, it, expect } from 'vitest';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { locales } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { catalog } from '@/lib/api/resources/catalog';
import { getNavItems, type NavItem } from '@/components/layout/nav-items';

const SEGMENT_ROOT = join('app', '[locale]');

/**
 * `NavItem` used to carry a third kind — inert `text`, for an item with nowhere to
 * point — which made it impossible *by construction* for a routeless entry to render
 * as a link (#40). #72 gave Hỗ trợ a route, emptying that variant, and deleting it
 * took the compile-time guarantee with it. This is that guarantee, held by a test
 * instead. Same trick as `a11y-labels.test.ts` — a rule the compiler can't hold.
 *
 * A route existing on disk is only half of it. `collection/[slug]` matches *any*
 * slug, and the page calls `notFound()` when the catalog has no such collection —
 * so renaming a collection in the fixtures would leave a green build and a nav link
 * that 404s. A dynamic match is therefore checked against the real data too.
 */

/** Every href the nav can produce, across both kinds of entry. */
function hrefsOf(item: NavItem): string[] {
  return item.kind === 'group' ? item.items.map((child) => child.href) : [item.href];
}

function navHrefs(): string[] {
  return locales.flatMap((locale) => getNavItems(getDictionary(locale), locale).flatMap(hrefsOf));
}

/** The path below the locale prefix, which is what the App Router matches on. */
function routeSegments(href: string): string[] {
  return href.split('/').filter(Boolean).slice(1);
}

/**
 * Resolve one URL path against the App Router's directory layout, reporting whether a
 * `[param]` directory did any of the matching. Three conventions matter: a segment may
 * be matched by a literal directory or a dynamic one, and a `(group)` directory is
 * transparent to the URL, so a route can live a level deeper on disk than its path.
 */
function resolveRoute(dir: string, segments: string[], viaDynamic = false): { viaDynamic: boolean } | null {
  if (segments.length === 0) return existsSync(join(dir, 'page.tsx')) ? { viaDynamic } : null;
  if (!existsSync(dir)) return null;

  const [head, ...rest] = segments;

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const next = join(dir, entry.name);

    const hit =
      entry.name === head ? resolveRoute(next, rest, viaDynamic)
      : /^\[.+\]$/.test(entry.name) ? resolveRoute(next, rest, true)
      // A route group adds a directory level but no URL segment, so the whole
      // remaining path is retried inside it.
      : /^\(.+\)$/.test(entry.name) ? resolveRoute(next, segments, viaDynamic)
      : null;

    if (hit) return hit;
  }

  return null;
}

describe('nav destinations', () => {
  it('points every nav item at a route that exists', () => {
    const dangling = navHrefs().filter((href) => !resolveRoute(SEGMENT_ROOT, routeSegments(href)));

    expect(dangling, `nav items with no route:\n${dangling.join('\n')}`).toEqual([]);
  });

  it('prefixes every nav href with the locale it was built for', () => {
    for (const locale of locales) {
      // Group children carry their own hrefs, and a child pointing at the wrong
      // locale would walk a Vietnamese shopper into the English storefront.
      for (const href of getNavItems(getDictionary(locale), locale).flatMap(hrefsOf)) {
        expect(href).toMatch(new RegExp(`^/${locale}/`));
      }
    }
  });

  it('backs every dynamic destination with a resource that exists', async () => {
    const dynamic = navHrefs().filter((href) => resolveRoute(SEGMENT_ROOT, routeSegments(href))?.viaDynamic);
    const slugs = new Set((await catalog.listCollections()).map((collection) => collection.slug));

    for (const href of dynamic) {
      const [segment, slug] = routeSegments(href);

      // Collections are the only dynamic destination the nav offers. A new one
      // resolves through `[param]` and lands here unguarded, so it fails loudly
      // until someone extends this check rather than passing by default.
      expect(segment, `unguarded dynamic nav destination: ${href}`).toBe('collection');
      expect(slugs, `nav links to a collection that does not exist: ${href}`).toContain(slug);
    }
  });
});
