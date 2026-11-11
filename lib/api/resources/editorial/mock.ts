import { articles, makeupLooks } from '@/content/mock';
import type { Article, ArticleQuery, MakeupLook } from '@/lib/api/schemas/editorial';

/**
 * Lowercased and stripped of tone marks, so a search matches the way people actually
 * type. Vietnamese is written without diacritics far more often than with them — on a
 * phone keyboard that is the default — and "ky yeu" has to find "kỷ yếu".
 *
 * `đ` needs saying separately: it is a letter in its own right rather than `d` carrying
 * a mark, so NFD does not decompose it and `'Đ'.toLowerCase()` yields `'đ'`, not `'d'`.
 * Both sides of the comparison are folded, so this stays symmetric.
 */
function fold(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/đ/g, 'd');
}

/**
 * Everything a shopper could plausibly be searching for, in every locale.
 *
 * Title and excerpt only: a match inside a body would be invisible on the card that
 * claims it, which reads as a wrong result rather than a found one.
 */
function haystack(article: Article): string {
  return fold([...Object.values(article.title), ...Object.values(article.excerpt)].join(' '));
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
    if (term) {
      const needle = fold(term);
      list = list.filter((a) => haystack(a).includes(needle));
    }

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
