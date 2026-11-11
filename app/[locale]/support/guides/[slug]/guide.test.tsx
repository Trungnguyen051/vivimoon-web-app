import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import GuidePage from './page';
import { guides } from '@/content/mock';
import { collections } from '@/content/mock';
import { articles, products } from '@/content/mock';
import { guideSchema } from '@/lib/api/schemas/support';
import { readingMinutes } from '@/lib/editorial/reading-time';
import { locales } from '@/lib/i18n/config';
import { vi as viDict } from '@/lib/i18n/dictionaries/vi';
import { en as enDict } from '@/lib/i18n/dictionaries/en';
import { SEGMENT_ROOT, pathSegments, resolveRoute } from '@/tests/route-tree';

// The product cards reach for the cart store's router.
vi.mock('next/navigation', async (orig) => ({
  ...(await orig<typeof import('next/navigation')>()),
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

const guide = guides[0];
const copy = viDict.support.guide;

async function renderGuide(slug = guide.slug) {
  return render(
    await GuidePage({ params: Promise.resolve({ locale: 'vi', slug }) }),
  );
}

const section = (name: string) => screen.getByRole('heading', { name }).closest('section')!;

describe('a Guide page', () => {
  it('renders the opening note, every numbered step and the closing safety note', async () => {
    await renderGuide();

    expect(screen.getByRole('heading', { level: 1, name: guide.title.vi })).toBeInTheDocument();
    for (const paragraph of guide.opening.vi) expect(screen.getByText(paragraph)).toBeInTheDocument();

    const steps = within(section(copy.stepsLabel)).getAllByRole('listitem');
    expect(steps).toHaveLength(guide.steps.length);
    guide.steps.forEach((step, i) => {
      // Numbered by the list, and stated in the heading the reader actually sees.
      expect(within(steps[i]).getByRole('heading', { level: 3 }))
        .toHaveTextContent(`${i + 1}. ${step.title.vi}`);
      expect(within(steps[i]).getByText(step.body.vi)).toBeInTheDocument();
    });

    for (const paragraph of guide.closing.vi) expect(screen.getByText(paragraph)).toBeInTheDocument();
  });

  /** Computed from the body, authored for the date — the two sit in one byline. */
  it('states a computed reading time and the authored updated date', async () => {
    await renderGuide();
    const body = [
      ...guide.opening.vi,
      ...guide.steps.flatMap((s) => [s.title.vi, s.body.vi]),
      ...guide.closing.vi,
    ];

    const byline = screen.getByText(new RegExp(copy.updatedOn));
    expect(byline).toHaveTextContent(
      viDict.articles.readingTime.replace('{count}', String(readingMinutes(body))),
    );
    expect(guide.updatedAt >= guide.publishedAt).toBe(true);
  });

  it('renders the suggested lenses and opens the real Collection', async () => {
    await renderGuide();
    const suggested = section(copy.suggested);

    expect(within(suggested).getByRole('link', { name: copy.viewCollection }))
      .toHaveAttribute('href', `/vi/collection/${guide.collection}`);

    /* The row is the Collection's own first products, so an empty `beginner-friendly`
       would render a heading over nothing — and the fixture filter is a merchandising
       guess, which is exactly the kind of thing that quietly selects none. */
    const collection = collections.find((c) => c.slug === guide.collection)!;
    expect(collection.productIds.length).toBeGreaterThan(0);
    for (const product of products.filter((p) => collection.productIds.slice(0, 3).includes(p.id))) {
      expect(within(suggested).getByText(product.name)).toBeInTheDocument();
    }
  });

  it('links the related rail to an Article, not only to Guides', async () => {
    await renderGuide();
    const rail = section(copy.related);
    const article = articles.find((a) => a.slug === guide.related[0].slug)!;

    expect(within(rail).getByRole('link', { name: article.title.vi }))
      .toHaveAttribute('href', `/vi/articles/${article.slug}`);
  });

  it('returns through Hỗ trợ', async () => {
    await renderGuide();

    expect(screen.getByRole('link', { name: viDict.nav.support }))
      .toHaveAttribute('href', '/vi/support');
  });

  /** No footage exists, so no empty box pretending there is. */
  it('renders no video', async () => {
    const { container } = await renderGuide();

    expect(guide.video).toBeUndefined();
    expect(container.querySelector('video, iframe')).toBeNull();
  });

  it('404s on a slug nobody authored', async () => {
    await expect(renderGuide('khong-co-huong-dan-nao')).rejects.toThrow();
  });
});

describe('the Guide fixtures', () => {
  it('parse, in every locale, with no wireframe caption left in', async () => {
    for (const g of guides) {
      expect(guideSchema.safeParse(g).success, g.slug).toBe(true);
      for (const locale of locales) {
        expect(g.title[locale].trim()).not.toBe('');
        for (const step of g.steps) {
          expect(step.title[locale].trim()).not.toBe('');
          // "ảnh minh hoạ" is a note to a designer, not copy for a shopper.
          expect(step.title[locale].toLowerCase()).not.toContain('ảnh minh ho');
          expect(step.body[locale].toLowerCase()).not.toContain('placeholder');
        }
      }
    }
  });

  /**
   * The row *is* a Collection and the rail *is* a set of real documents, so both have
   * to resolve. Nothing type-checks a slug — the same guard the nav and the authored
   * answer links carry, one fixture over.
   */
  it('points every Collection and related link at something that exists', () => {
    for (const g of guides) {
      expect(
        collections.some((c) => c.slug === g.collection),
        `${g.slug} suggests a collection that does not exist: ${g.collection}`,
      ).toBe(true);

      for (const ref of g.related) {
        const found = ref.kind === 'article'
          ? articles.some((a) => a.slug === ref.slug)
          : guides.some((other) => other.slug === ref.slug);
        expect(found, `${g.slug} relates to a missing ${ref.kind}: ${ref.slug}`).toBe(true);
      }
    }
  });

  it('puts every guide route in the route tree', () => {
    for (const g of guides) {
      const href = `/support/guides/${g.slug}`;
      expect(
        resolveRoute(SEGMENT_ROOT, pathSegments(href, { stripLocale: false })),
        `no route for ${href}`,
      ).toBeTruthy();
    }
  });

  /**
   * Two different wrongs match the shape, and they fail differently. `2026-13-01` is
   * `Invalid Date`, which makes `Intl.DateTimeFormat.format` throw and 500 the page.
   * `2026-11-31` is the quieter one: JavaScript rolls it to 1 December and renders a
   * date nobody authored. The round trip catches both.
   */
  it('rejects a date that matches the shape but is not a real day', () => {
    const base = guides[0];

    // Rolls forward silently without the check.
    expect(guideSchema.safeParse({ ...base, updatedAt: '2026-11-31' }).success).toBe(false);
    // Throws at render without it.
    expect(guideSchema.safeParse({ ...base, publishedAt: '2026-13-01' }).success).toBe(false);
    expect(guideSchema.safeParse({ ...base, updatedAt: '2026-11-02' }).success).toBe(true);
  });

  /** `''` is exactly the value that renders the empty box the field exists to avoid. */
  it('rejects a blank video rather than treating it as absent', () => {
    expect(guideSchema.safeParse({ ...guides[0], video: '' }).success).toBe(false);
    expect(guideSchema.safeParse({ ...guides[0], video: '/video/x.mp4' }).success).toBe(true);
  });

  /**
   * The suggested-lenses heading is chrome shown above *any* guide's collection, but
   * the collection is per-guide. A heading that named this guide's audience would read
   * "Lens hợp với người mới" over a row of coloured monthlies on the next guide.
   */
  it('heads the suggested row with nothing specific to this guide', () => {
    for (const label of [viDict.support.guide.suggested, enDict.support.guide.suggested]) {
      expect(label.toLowerCase()).not.toMatch(/người mới|beginner/);
    }
  });
});
