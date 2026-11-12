import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import ArticlesPage from './page';
import { articles, makeupLooks } from '@/content/mock';
import { vi as viDict } from '@/lib/i18n/dictionaries/vi';
import { CARDS_PER_PAGE } from '@/lib/editorial/index-layout';
import { readingMinutes } from '@/lib/editorial/reading-time';

/**
 * The index as a page rather than a grid (#129): one article leads at full width, the
 * chips and a search box sit under it, and the rest arrive as cards six at a time.
 *
 * Rendered by awaiting the server component, so these exercise the real resource and the
 * real fixtures — the paging arithmetic is covered against counts in
 * `lib/editorial/index-layout.test.ts`, and what is held here is the page agreeing with it.
 */
async function renderIndex(query: Record<string, string> = {}) {
  return render(
    await ArticlesPage({
      params: Promise.resolve({ locale: 'vi' }),
      searchParams: Promise.resolve(query),
    }),
  );
}

const grid = () => screen.getByRole('heading', { name: viDict.articles.gridTitle }).closest('section')!;

describe('the Knowledge index', () => {
  it('leads with the newest article and pages the rest six at a time', async () => {
    await renderIndex();
    const newest = [...articles].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))[0];

    expect(screen.getByText(viDict.articles.leadEyebrow)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: newest.title.vi })).toBeInTheDocument();
    // Eight fixtures: one leads, six fill the first page, one is left to ask for.
    expect(within(grid()).getAllByRole('link')).toHaveLength(CARDS_PER_PAGE);
    expect(screen.getByRole('link', { name: viDict.articles.showMore })).toBeInTheDocument();
  });

  /** The lead is positional, so narrowing the index changes which article leads it. */
  it('leads with whatever the current query puts first', async () => {
    await renderIndex({ theme: 'care' });
    const care = articles.filter((a) => a.readingTheme === 'care');

    expect(screen.getByRole('heading', { level: 2, name: care[0].title.vi })).toBeInTheDocument();

    // One match: the grid is omitted entirely, heading and all.
    expect(care).toHaveLength(1);
    expect(screen.queryByRole('heading', { name: viDict.articles.gridTitle })).not.toBeInTheDocument();
  });

  it('states a dateline of author, reading time and date on every card', async () => {
    await renderIndex();
    const newest = [...articles].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))[0];
    const minutes = readingMinutes(newest.body.vi);

    expect(
      screen.getAllByText(
        new RegExp(`${newest.author}.*${viDict.articles.readingTime.replace('{count}', String(minutes))}`),
      ).length,
    ).toBeGreaterThan(0);
    // The Reading Theme rides as the card's eyebrow.
    expect(screen.getAllByText(viDict.articles.readingThemes[newest.readingTheme]).length).toBeGreaterThan(0);
  });

  it('draws no excerpt on an index card', async () => {
    await renderIndex();

    /* Spec #126: "The index's card is bordered, carries an eyebrow and a dateline and
       no excerpt; the homepage's is borderless with an excerpt." One component renders
       both, so the excerpt is the kind of thing that reappears the next time somebody
       passes it in — which is how it shipped the first time. */
    for (const article of articles) {
      expect(within(grid()).queryByText(article.excerpt.vi)).not.toBeInTheDocument();
    }
  });

  it('searches, and says so when nothing matches without taking the rest of the page down', async () => {
    await renderIndex({ q: 'khong-co-bai-nao-ten-the-nay' });

    expect(screen.getByText(viDict.articles.noResults)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: viDict.articles.showAll })).toHaveAttribute('href', '/vi/articles');
    // The other bands still render — an empty result is not an empty page.
    expect(screen.getByRole('heading', { name: viDict.home.quiz.title })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: viDict.articles.makeupLooksTitle })).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: viDict.articles.searchLabel })).toBeInTheDocument();
  });

  /** Tone marks are optional on a phone keyboard, so a folded search has to find them. */
  it('finds an article typed without its tone marks', async () => {
    await renderIndex({ q: 'ky yeu' });

    expect(screen.queryByText(viDict.articles.noResults)).not.toBeInTheDocument();
  });

  it('offers newest and oldest only, and keeps the theme when either is picked', async () => {
    await renderIndex({ theme: 'natural' });
    const sorts = screen.getByRole('navigation', { name: viDict.articles.sortLabel });

    expect(within(sorts).getAllByRole('link').map((a) => a.textContent))
      .toEqual([viDict.articles.sorts.newest, viDict.articles.sorts.oldest]);
    expect(within(sorts).getByRole('link', { name: viDict.articles.sorts.oldest }))
      .toHaveAttribute('href', expect.stringContaining('theme=natural'));
    expect(within(sorts).getByRole('link', { name: viDict.articles.sorts.oldest }))
      .toHaveAttribute('href', expect.stringContaining('sort=oldest'));
  });

  it('sorts oldest first when asked', async () => {
    await renderIndex({ sort: 'oldest' });
    const oldest = [...articles].sort((a, b) => a.publishedAt.localeCompare(b.publishedAt))[0];

    expect(screen.getByRole('heading', { level: 2, name: oldest.title.vi })).toBeInTheDocument();
  });

  /**
   * Showing more raises the count rather than paging, and lands on the grid rather than
   * at the top of the page — a shopper who asked for more should not have to scroll back
   * down to whatever arrived.
   */
  it('raises the count and returns the shopper to the cards', async () => {
    const { unmount } = await renderIndex();
    expect(screen.getByRole('link', { name: viDict.articles.showMore }))
      .toHaveAttribute('href', `/vi/articles?shown=${CARDS_PER_PAGE * 2}#more-articles`);
    unmount();

    await renderIndex({ shown: String(CARDS_PER_PAGE * 2) });
    expect(within(grid()).getAllByRole('link')).toHaveLength(articles.length - 1);
    expect(screen.queryByRole('link', { name: viDict.articles.showMore })).not.toBeInTheDocument();
  });

  /** A URL a shopper can edit: every control degrades to its default rather than throwing. */
  it('ignores nonsense in the query rather than failing', async () => {
    await renderIndex({ theme: 'nonsense', sort: 'sideways', shown: '-4' });

    expect(screen.getByText(viDict.articles.leadEyebrow)).toBeInTheDocument();
    expect(within(grid()).getAllByRole('link')).toHaveLength(CARDS_PER_PAGE);

    /* And show-more still moves. Raising the *unclamped* count would link `?shown=-4`
       to `?shown=2`, which clamps back to six — a control that reloads the same six
       cards and gives the shopper no reason why. */
    expect(screen.getByRole('link', { name: viDict.articles.showMore }))
      .toHaveAttribute('href', expect.stringContaining(`shown=${CARDS_PER_PAGE * 2}`));
  });

  /**
   * The way out of an empty state has to change something. An upstream editorial
   * resource returning nothing with no filter applied would otherwise be offered a
   * button back to the page already on screen.
   */
  it('offers a way out of an empty result only when something is filtering', async () => {
    await renderIndex({ q: 'khong-co-bai-nao-ten-the-nay' });
    expect(screen.getByRole('link', { name: viDict.articles.showAll })).toBeInTheDocument();
  });

  /**
   * The band is not part of the query: it shows every Look whatever the chips and the
   * search box are doing, which is why it survives a result set of nothing.
   */
  it('shows the Makeup Look band, every look opening its lens', async () => {
    await renderIndex();
    const band = screen.getByRole('heading', { name: viDict.articles.makeupLooksTitle }).closest('section')!;

    expect(within(band).getAllByRole('link')).toHaveLength(makeupLooks.length);
    expect(within(band).getByRole('link', { name: new RegExp(makeupLooks[0].lensName) }))
      .toHaveAttribute('href', `/vi/product/${makeupLooks[0].productSlug}`);
  });
});
