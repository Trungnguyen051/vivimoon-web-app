import { articles, makeupLooks } from '@/content/mock';
import type { Article, ArticleQuery, MakeupLook } from '@/lib/api/schemas/editorial';
import { foldedIncludes } from '@/lib/text/fold';

/**
 * Everything a shopper could plausibly be searching for, in every locale.
 *
 * Title and excerpt only: a match inside a body would be invisible on the card that
 * claims it, which reads as a wrong result rather than a found one.
 */
function searchable(article: Article): string[] {
  return [...Object.values(article.title), ...Object.values(article.excerpt)];
}

export const mockEditorial = {
  /**
   * Newest first by default — the order the Knowledge index and the homepage both show.
   *
   * Filtering lives here rather than in the index page because the chip row, the search
   * box and the sort control are three spellings of this one query; splitting them would
   * let three controls disagree about what "matches" means.
   */
  async listArticles(query: ArticleQuery = {}): Promise<Article[]> {
    let list = [...articles];

    if (query.readingTheme) list = list.filter((a) => a.readingTheme === query.readingTheme);

    // Trimmed, so a box holding only spaces is no filter at all — typing and clearing
    // must give the whole list back rather than an empty page.
    const term = query.q?.trim();
    if (term) list = list.filter((a) => foldedIncludes(searchable(a), term));

    list.sort((a, b) =>
      query.sort === 'oldest'
        ? a.publishedAt.localeCompare(b.publishedAt)
        : b.publishedAt.localeCompare(a.publishedAt),
    );

    return list;
  },

  /**
   * Every Makeup Look there is, in the order they are authored.
   *
   * No query: the band shows the whole set, so there is nothing to filter and nothing to
   * page. It lives on this resource rather than beside the page because a Look is
   * editorial content with per-locale titles — the same reason Articles are here, and
   * the same seam a CMS would replace.
   */
  async listMakeupLooks(): Promise<MakeupLook[]> {
    return [...makeupLooks];
  },

  async getArticleBySlug(slug: string): Promise<Article | null> {
    return articles.find((a) => a.slug === slug) ?? null;
  },
};

export type Editorial = typeof mockEditorial;
