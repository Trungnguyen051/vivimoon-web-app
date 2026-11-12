import { describe, it, expect } from 'vitest';
import { catalog } from '@/lib/api/resources/catalog';
import { editorial } from '@/lib/api/resources/editorial';
import { support } from '@/lib/api/resources/support';
import { faqEntries } from '@/content/mock/support';
import { topicSchema } from '@/lib/api/schemas/support';
import { SEGMENT_ROOT, pathSegments, resolveRoute } from './route-tree';

/**
 * The same guarantee `nav-destinations.test.ts` holds over the nav, held over links
 * that live in *content*.
 *
 * An answer may point a reader at a Guide, an Article or anywhere else in the
 * storefront (`CONTEXT.md`'s FAQ Entry puts those links beside the prose rather than
 * inside it, which is also what makes them checkable). Fixtures are where a dead link
 * survives longest: nothing type-checks a string, nobody re-reads 26 answers after
 * renaming a route, and the reader who finds it is a shopper who already could not
 * find an answer.
 *
 * A Guide's own references are checked here too, per spec #118 — but they are not
 * hrefs. `related` is `{ kind, slug }` and `collection` is a Collection slug, so the
 * route they render is derived and cannot dangle; what can dangle is the thing they
 * name. Those get resolved against the resource rather than against the route tree.
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
    const guides = new Set((await support.listGuides()).map((g) => g.slug));

    /* Keyed on the path *above* the dynamic segment, not on the first segment: a
       nested destination like `support/guides/[slug]` has three parts, and reading
       the first two as `[segment, slug]` would have asked whether a collection named
       "guides" exists. */
    const backing: Record<string, Set<string>> = {
      collection: collections,
      articles,
      'support/guides': guides,
    };

    for (const href of dynamic) {
      const segments = segmentsOf(href);
      const slug = segments[segments.length - 1];
      const segment = segments.slice(0, -1).join('/');

      // A new kind of dynamic destination resolves through `[param]` and lands here
      // unguarded, so it fails loudly until someone adds its resource rather than
      // passing by default. `support/guides/[slug]` arrived this way with #123.
      expect(backing[segment], `unguarded dynamic authored destination: ${href}`).toBeDefined();
      expect(backing[segment], `authored link to a ${segment} that does not exist: ${href}`).toContain(slug);
    }
  });

  it('backs every Guide related reference with content that exists', async () => {
    const guides = await support.listGuides();
    const guideSlugs = new Set(guides.map((g) => g.slug));
    const articleSlugs = new Set((await editorial.listArticles()).map((a) => a.slug));

    // A guard over an empty set passes for the wrong reason.
    expect(guides.flatMap((g) => g.related).length).toBeGreaterThan(0);

    const dangling = guides.flatMap((guide) =>
      guide.related
        .filter(({ kind, slug }) => !(kind === 'guide' ? guideSlugs : articleSlugs).has(slug))
        .map(({ kind, slug }) => `${guide.slug} → ${kind}:${slug}`),
    );

    expect(dangling, `related rail pointing at content that does not exist:\n${dangling.join('\n')}`).toEqual([]);
  });

  it('backs every Guide collection with a collection that exists', async () => {
    const guides = await support.listGuides();
    const collections = new Set((await catalog.listCollections()).map((c) => c.slug));

    const dangling = guides
      .filter((guide) => !collections.has(guide.collection))
      .map((guide) => `${guide.slug} → ${guide.collection}`);

    expect(dangling, `Guide lens row pointing at no collection:\n${dangling.join('\n')}`).toEqual([]);
  });

  it('leaves no Topic tile leading to an empty page', async () => {
    /* The hub draws all six Topics as tiles and the FAQ sidebar lists the same six
       (`CONTEXT.md` → Topic), so a Topic nothing is filed under is a tile a shopper
       can click into nothing. The route cannot dangle — `parseTopic` degrades an
       unrecognised category to everything — which is exactly why the emptiness has to
       be caught here instead. */
    const entries = await support.listFaqEntries();
    const filed = new Set(entries.map((entry) => entry.topic));

    const empty = topicSchema.options.filter((topic) => !filed.has(topic));

    expect(empty, `Topics with no FAQ Entry behind them:\n${empty.join('\n')}`).toEqual([]);
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
