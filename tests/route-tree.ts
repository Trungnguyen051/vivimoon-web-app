import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Resolving a URL path against the App Router's directory layout.
 *
 * This began inside `nav-destinations.test.ts`, guarding nav hrefs alone. It moved
 * here when authored content gained hrefs of its own — a FAQ Entry's answer links —
 * because a second copy of these three conventions would be a second thing to get
 * wrong, and the fixtures are exactly where a dead link hides longest.
 */
export const SEGMENT_ROOT = join('app', '[locale]');

/**
 * The path's segments, with a query string and fragment cut first: neither is part
 * of the route. A Lens Facet value points at `…/collection/all-lenses?color=brown`
 * and a facet name at that collection with its filter control focused (#87), and the
 * router matches both on the path alone. Splitting on whichever delimiter comes first
 * is what makes a fragment containing a `?` — a legal URL — resolve the same as one
 * without.
 *
 * `stripLocale` is for hrefs the app builds under a locale prefix. Authored content
 * carries no prefix (the page supplies it), so it passes `false`.
 */
export function pathSegments(href: string, { stripLocale }: { stripLocale: boolean }): string[] {
  const path = href.split(/[?#]/, 1)[0];
  const segments = path.split('/').filter(Boolean);
  return stripLocale ? segments.slice(1) : segments;
}

/**
 * Resolve one path, reporting whether a `[param]` directory did any of the matching.
 * Three conventions matter: a segment may be matched by a literal directory or a
 * dynamic one, and a `(group)` directory is transparent to the URL, so a route can
 * live a level deeper on disk than its path.
 */
export function resolveRoute(
  dir: string,
  segments: string[],
  viaDynamic = false,
): { viaDynamic: boolean } | null {
  if (segments.length === 0) return existsSync(join(dir, 'page.tsx')) ? { viaDynamic } : null;
  if (!existsSync(dir)) return null;

  const [head, ...rest] = segments;
  const dirs = readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  // Most specific first, as the router itself resolves: a literal directory beats
  // a dynamic one. Taking whichever `readdir` happened to yield first would let
  // `/en/about` match `[...rest]` and report the About page as dynamic.
  if (dirs.includes(head)) {
    const hit = resolveRoute(join(dir, head), rest, viaDynamic);
    if (hit) return hit;
  }

  // `[slug]` but never `[...rest]`: that catch-all exists purely to throw
  // `notFound()` (#73), so an href whose only match is the catch-all is precisely
  // the dead link this exists to catch. Resolving through it would make the whole
  // guard vacuous.
  for (const name of dirs.filter((n) => /^\[[^.]+\]$/.test(n))) {
    const hit = resolveRoute(join(dir, name), rest, true);
    if (hit) return hit;
  }

  // A route group adds a directory level but no URL segment, so the whole
  // remaining path is retried inside it.
  for (const name of dirs.filter((n) => /^\(.+\)$/.test(n))) {
    const hit = resolveRoute(join(dir, name), segments, viaDynamic);
    if (hit) return hit;
  }

  return null;
}
