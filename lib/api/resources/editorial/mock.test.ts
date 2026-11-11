import { describe, it, expect } from 'vitest';
import { mockEditorial } from './mock';

describe('mockEditorial', () => {
  it('lists articles newest first', async () => {
    const dates = (await mockEditorial.listArticles()).map((a) => a.publishedAt);

    expect(dates).toEqual([...dates].sort().reverse());
  });

  it('finds an article by slug, and nothing for an unknown one', async () => {
    const [first] = await mockEditorial.listArticles();

    expect((await mockEditorial.getArticleBySlug(first.slug))?.slug).toBe(first.slug);
    expect(await mockEditorial.getArticleBySlug('nope')).toBeNull();
  });

  it('does not expose its own array for callers to sort in place', async () => {
    const once = await mockEditorial.listArticles();
    once.reverse();

    expect((await mockEditorial.listArticles()).map((a) => a.slug)).not.toEqual(once.map((a) => a.slug));
  });

  it('narrows to one Reading Theme', async () => {
    const comfort = await mockEditorial.listArticles({ readingTheme: 'comfort' });

    expect(comfort.map((a) => a.slug)).toEqual([
      'silicone-hydrogel-vs-lens-thuong',
      'deo-lens-bao-lau-la-du',
    ]);
  });

  it('matches free text against titles and excerpts', async () => {
    const found = await mockEditorial.listArticles({ q: 'gdia' });

    expect(found.map((a) => a.slug)).toEqual(['dia-va-gdia-la-gi']);
  });

  /**
   * The resource takes no locale, and matches every one. A shopper reading the English
   * storefront who half-remembers a Vietnamese phrase still finds the article, and a
   * search never silently depends on which storefront happens to be open.
   */
  it.each([['kỷ yếu'], ['yearbook']])('finds the same article from either language (%s)', async (term) => {
    const found = await mockEditorial.listArticles({ q: term });

    expect(found.map((a) => a.slug)).toEqual(['lens-cho-ngay-ky-yeu']);
  });

  /**
   * Vietnamese is typed without tone marks far more often than with them — on a phone
   * keyboard it is the default. A search that only matches fully-accented input fails
   * the most common way a Vietnamese shopper actually types.
   *
   * `đ` is the case that a naive fold misses: it is its own letter rather than `d` with
   * a mark, so NFD leaves it alone and `'Đ'.toLowerCase()` is `'đ'`, not `'d'`.
   */
  it.each([
    ['ky yeu', 'lens-cho-ngay-ky-yeu'],
    ['kỷ yếu', 'lens-cho-ngay-ky-yeu'],
    ['deo lens bao lau', 'deo-lens-bao-lau-la-du'],
    ['Đeo lens bao lâu', 'deo-lens-bao-lau-la-du'],
  ])('matches "%s" however the shopper types the tones', async (term, slug) => {
    const found = await mockEditorial.listArticles({ q: term });

    expect(found.map((a) => a.slug)).toContain(slug);
  });

  it('ignores case and surrounding whitespace in a search', async () => {
    const found = await mockEditorial.listArticles({ q: '  YEARBOOK  ' });

    expect(found.map((a) => a.slug)).toEqual(['lens-cho-ngay-ky-yeu']);
  });

  /** A blank box is not a filter — typing and clearing must give the whole list back. */
  it('treats an empty search as no search at all', async () => {
    const all = await mockEditorial.listArticles();

    expect(await mockEditorial.listArticles({ q: '   ' })).toEqual(all);
  });

  it('orders oldest first when asked, and newest by default', async () => {
    const oldest = (await mockEditorial.listArticles({ sort: 'oldest' })).map((a) => a.publishedAt);
    const newest = (await mockEditorial.listArticles({ sort: 'newest' })).map((a) => a.publishedAt);

    expect(oldest).toEqual([...oldest].sort());
    expect(newest).toEqual([...oldest].reverse());
    expect(newest).toEqual((await mockEditorial.listArticles()).map((a) => a.publishedAt));
  });

  it('combines a Reading Theme with a search and an order', async () => {
    const found = await mockEditorial.listArticles({ readingTheme: 'comfort', q: 'lens', sort: 'oldest' });

    expect(found.map((a) => a.slug)).toEqual([
      'deo-lens-bao-lau-la-du',
      'silicone-hydrogel-vs-lens-thuong',
    ]);
  });

  it('returns nothing when a filter matches nothing, rather than everything', async () => {
    expect(await mockEditorial.listArticles({ q: 'khong-co-bai-nao-nhu-vay' })).toEqual([]);
  });
});
