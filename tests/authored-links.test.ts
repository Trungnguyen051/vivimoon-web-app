import { describe, it, expect } from 'vitest';
import { catalog } from '@/lib/api/resources/catalog';
import { editorial } from '@/lib/api/resources/editorial';
import { faqEntries } from '@/content/mock/support';
import { SEGMENT_ROOT, pathSegments, resolveRoute } from './route-tree';

/**
 * The same guarantee `nav-destinations.test.ts` holds over the nav, held over links
 * that live in *content*.
 *
 * An answer may point a reader at a Guide, an Article or anywhere else in the
 * storefront (ADR-0019 puts those links beside the prose rather than inside it,
 * which is also what makes them checkable). Fixtures are where a dead link survives
 * longest: nothing type-checks a string, nobody re-reads 26 answers after renaming a
 * route, and the reader who finds it is a shopper who already could not find an
 * answer.
 */

/** Authored hrefs carry no locale prefix — the page renders them under the reader's. */
const segmentsOf = (href: string) => pathSegments(href, { stripLocale: false });

function authoredHrefs(): string[] {
  return faqEntries.flatMap((entry) => entry.links.map((link) => link.href));
}

describe('authored content links', () => {
  it('has links to check', () => {
    // A guard over an empty set passes for the wrong reason.
    expect(authoredHrefs().length).toBeGreaterThan(0);
  });

  it('points every authored link at a route that exists', () => {
    const dangling = authoredHrefs().filter((href) => !resolveRoute(SEGMENT_ROOT, segmentsOf(href)));

    expect(dangling, `authored links with no route:\n${dangling.join('\n')}`).toEqual([]);
  });

  it('backs every dynamic destination with a resource that exists', async () => {
    const dynamic = authoredHrefs().filter(
      (href) => resolveRoute(SEGMENT_ROOT, segmentsOf(href))?.viaDynamic,
    );
    const collections = new Set((await catalog.listCollections()).map((c) => c.slug));
    const articles = new Set((await editorial.listArticles()).map((a) => a.slug));

    const backing: Record<string, Set<string>> = { collection: collections, articles };

    for (const href of dynamic) {
      const [segment, slug] = segmentsOf(href);

      // A new kind of dynamic destination resolves through `[param]` and lands here
      // unguarded, so it fails loudly until someone adds its resource rather than
      // passing by default. `support/guides/[slug]` arrives this way with #123.
      expect(backing[segment], `unguarded dynamic authored destination: ${href}`).toBeDefined();
      expect(backing[segment], `authored link to a ${segment} that does not exist: ${href}`).toContain(slug);
    }
  });

  it('gives every authored link a label in every locale', () => {
    for (const entry of faqEntries) {
      for (const link of entry.links) {
        expect(link.label.vi.length, `${entry.slug} → ${link.href}`).toBeGreaterThan(0);
        expect(link.label.en.length, `${entry.slug} → ${link.href}`).toBeGreaterThan(0);
      }
    }
  });
});
