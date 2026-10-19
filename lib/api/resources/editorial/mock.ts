import { articles } from '@/content/mock';
import type { Article } from '@/lib/api/schemas/editorial';

export const mockEditorial = {
  /** Newest first — the order the index and the homepage section both show. */
  async listArticles(): Promise<Article[]> {
    return [...articles].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  },

  async getArticleBySlug(slug: string): Promise<Article | null> {
    return articles.find((a) => a.slug === slug) ?? null;
  },
};

export type Editorial = typeof mockEditorial;
