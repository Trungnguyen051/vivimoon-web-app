import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import ArticlePage from './page';
import { articles, collections, products } from '@/content/mock';
import { countReadingTheme, readingThemeDestination, readingThemeIncludes } from '@/lib/editorial/reading-themes';
import { readingMinutes } from '@/lib/editorial/reading-time';
import { vi as viDict } from '@/lib/i18n/dictionaries/vi';
import { en as enDict } from '@/lib/i18n/dictionaries/en';
import { catalog } from '@/lib/api/resources/catalog';

vi.mock('next/navigation', async (orig) => ({
  ...(await orig<typeof import('next/navigation')>()),
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

const STRIP_SIZE = 3;

/** How many lenses a theme leads to, counted the way the page counts them. */
function matchCount(readingTheme: (typeof articles)[number]['readingTheme']): number {
  const entry = readingThemeDestination(readingTheme);
  if (!entry) return 0;
  const collection = collections.find((c) => c.slug === entry.collection)!;
  return countReadingTheme(entry, products.filter((p) => collection.productIds.includes(p.id)));
}

/** One with a destination, and the one without — `care` is the partial half of the table. */
const merchandised = articles.find((a) => matchCount(a.readingTheme) > 0)!;
/* A theme with more lenses than the strip shows, so the count in the banner is visibly
   not just "what you can already see". */
const bannered = articles.find((a) => matchCount(a.readingTheme) > STRIP_SIZE)!;
/* And one whose collection holds exactly one lens — `natural` and `occasion` do. These
   had no banner at all until #160, which is also what made the singular copy below
   unreachable (#153). */
const singular = articles.find((a) => matchCount(a.readingTheme) === 1)!;
const careArticle = articles.find((a) => a.readingTheme === 'care')!;

async function renderArticle(slug: string) {
  return render(await ArticlePage({ params: Promise.resolve({ locale: 'vi', slug }) }));
}

describe('an article page', () => {
  it('breadcrumbs through Kiến thức to its Reading Theme, and not to its own title', async () => {
    await renderArticle(merchandised.slug);
    const crumbs = screen.getByRole('navigation', { name: viDict.common.breadcrumb });

    expect(within(crumbs).getByRole('link', { name: viDict.articles.title }))
      .toHaveAttribute('href', '/vi/articles');
    expect(within(crumbs).getByRole('link', { name: viDict.articles.readingThemes[merchandised.readingTheme] }))
      .toHaveAttribute('href', `/vi/articles?theme=${merchandised.readingTheme}`);
    // The heading sits directly beneath, so repeating the title as a crumb is noise.
    expect(within(crumbs).queryByText(merchandised.title.vi)).not.toBeInTheDocument();
  });

  it('states author, derived reading time and date in one dateline', async () => {
    await renderArticle(merchandised.slug);
    const minutes = readingMinutes(merchandised.body.vi);

    const dateline = screen.getByText(new RegExp(merchandised.author));
    expect(dateline).toHaveTextContent(viDict.articles.readingTime.replace('{count}', String(minutes)));
  });

  it('renders the body as plain paragraphs, with no markup reaching the page', async () => {
    await renderArticle(merchandised.slug);

    for (const paragraph of merchandised.body.vi) {
      const rendered = screen.getByText(paragraph);
      expect(rendered).toBeInTheDocument();
      /* The Article shape is unchanged: nothing here parses anything.

         Asserted on the paragraphs rather than on the `<article>` landmark, which
         stopped being a proxy for "the prose" when the lens strip moved inside the
         body (#154). The strip's product links are markup the landmark is *supposed*
         to contain; a paragraph is not. */
      expect(rendered.querySelector('strong, em, a')).toBeNull();
    }
  });

  it('sets the lens strip inside the body, with prose on both sides of it', async () => {
    const { container } = await renderArticle(merchandised.slug);
    const article = container.querySelector('article')!;
    const strip = screen.getByRole('heading', { name: viDict.articles.inThisArticle }).closest('section')!;

    // "Partway down", per #130 — not bolted to the end of the piece.
    expect(article.contains(strip)).toBe(true);

    const paragraphs = merchandised.body.vi.map((text) => screen.getByText(text));
    const above = paragraphs.filter(
      (p) => strip.compareDocumentPosition(p) & Node.DOCUMENT_POSITION_PRECEDING,
    );

    expect(above.length).toBeGreaterThan(0);
    expect(above.length).toBeLessThan(paragraphs.length);
  });

  it('shows three real lenses with their real prices', async () => {
    await renderArticle(merchandised.slug);
    const strip = screen.getByRole('heading', { name: viDict.articles.inThisArticle }).closest('section')!;
    const entry = readingThemeDestination(merchandised.readingTheme)!;

    const collection = collections.find((c) => c.slug === entry.collection)!;
    const expected = products
      .filter((p) => collection.productIds.includes(p.id) && readingThemeIncludes(entry, p))
      .slice(0, 3);

    expect(expected.length).toBeGreaterThan(0);
    for (const product of expected) {
      expect(within(strip).getByText(product.name)).toBeInTheDocument();
    }
  });

  /**
   * The design's "18" is invented, and #36 is the regression that says so. Counted
   * from the fixtures rather than compared to a literal, so a fixture edit moves the
   * banner instead of breaking it.
   */
  it('states a count read from the collection it opens', async () => {
    await renderArticle(bannered.slug);
    const entry = readingThemeDestination(bannered.readingTheme)!;

    const collection = collections.find((c) => c.slug === entry.collection)!;
    const inCollection = products.filter((p) => collection.productIds.includes(p.id));
    const count = countReadingTheme(entry, inCollection);

    expect(count).toBeGreaterThan(0);
    const line = (count === 1
      ? viDict.articles.collectionBannerCount.one
      : viDict.articles.collectionBannerCount.other).replace('{count}', String(count));
    expect(screen.getByText(line)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: viDict.articles.collectionBannerCta }))
      .toHaveAttribute('href', expect.stringContaining(`/vi/collection/${entry.collection}`));
  });

  /**
   * The banner is not gated on size (#160): the only condition #130 states is that the
   * theme leads somewhere. A collection holding one lens still gets its route in, and
   * the singular string — dead copy in both locales until this landed — finally renders.
   */
  it('banners a collection holding a single lens, in the singular', async () => {
    await renderArticle(singular.slug);
    const entry = readingThemeDestination(singular.readingTheme)!;

    const line = viDict.articles.collectionBannerCount.one.replace('{count}', '1');
    expect(screen.getByText(line)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: viDict.articles.collectionBannerCta }))
      .toHaveAttribute('href', expect.stringContaining(`/vi/collection/${entry.collection}`));
  });

  /**
   * The partial half of the table, and the point of it: `care` covers solution, cases
   * and hygiene, and a lens strip beneath an article about cleaning solution would be
   * merchandising at a shopper dishonestly.
   */
  it('ends cleanly when the Reading Theme leads nowhere', async () => {
    expect(readingThemeDestination('care')).toBeNull();
    await renderArticle(careArticle.slug);

    expect(screen.queryByRole('heading', { name: viDict.articles.inThisArticle })).not.toBeInTheDocument();
    expect(screen.queryByText(viDict.articles.collectionBannerTitle)).not.toBeInTheDocument();
    // Still a whole article: body and breadcrumb are untouched by the absence.
    expect(screen.getByRole('heading', { level: 1, name: careArticle.title.vi })).toBeInTheDocument();
    expect(screen.getByText(careArticle.body.vi[0])).toBeInTheDocument();
  });

  it('404s on a slug nobody authored', async () => {
    await expect(renderArticle('khong-co-bai-nao')).rejects.toThrow();
  });

  /**
   * The reverse of the rule that used to live here. A banner was hidden whenever the
   * collection held no more than the strip, on the reasoning that the strip *is* the
   * collection at that size — plausible, but nobody asked for it, and #160 reversed it.
   * A theme that leads somewhere says so, whatever the size of where it leads.
   */
  it('banners a collection the strip already showed in full', async () => {
    const whole = articles.find((a) => {
      const n = matchCount(a.readingTheme);
      return n > 0 && n <= STRIP_SIZE;
    });
    if (!whole) return; // No such fixture today; the rule is still the rule.

    await renderArticle(whole.slug);

    expect(screen.getByRole('heading', { name: viDict.articles.inThisArticle })).toBeInTheDocument();
    expect(screen.getByText(viDict.articles.collectionBannerTitle)).toBeInTheDocument();
  });

  /** A destination that holds nothing is not a destination: no "0 products" banner. */
  it('drops the banner when the collection matches no lens', async () => {
    const spy = vi.spyOn(catalog, 'getProductsByIds').mockResolvedValue([]);
    try {
      await renderArticle(merchandised.slug);
    } finally {
      spy.mockRestore();
    }

    expect(screen.queryByText(viDict.articles.collectionBannerTitle)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: viDict.articles.backToIndex }))
      .toHaveAttribute('href', '/vi/articles');
  });

  /** Every article offers a way onward, banner or not. */
  it('ends with a way back to the index when there is no banner', async () => {
    await renderArticle(careArticle.slug);

    expect(screen.getByRole('link', { name: viDict.articles.backToIndex }))
      .toHaveAttribute('href', '/vi/articles');
  });

  /**
   * English says "1 product", not "1 products". Vietnamese has one form either way,
   * so a test asserting only in `vi` cannot see this.
   */
  it('counts in the right plural for the locale', () => {
    expect(enDict.articles.collectionBannerCount.one).not.toContain('products');
    expect(enDict.articles.collectionBannerCount.other).toContain('products');
    expect(new Intl.PluralRules('en-US').select(1)).toBe('one');
  });
});
