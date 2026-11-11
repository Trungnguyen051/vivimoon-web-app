import { faqEntries, guides } from '@/content/mock';
import type { FaqEntry, Guide } from '@/lib/api/schemas/support';

/** The hub's featured row is drawn five across. */
export const FEATURED_LIMIT = 5;

export const mockSupport = {
  /**
   * Every FAQ Entry, in authored order. The fixtures are grouped by Topic, which is
   * the order the FAQ page shows them in — authoring order is editorial judgement
   * about what a reader should meet first, and sorting here would discard it.
   */
  async listFaqEntries(): Promise<FaqEntry[]> {
    return [...faqEntries];
  },

  /**
   * The five the support hub shows as "Người mới hay hỏi".
   *
   * Capped here rather than left to the fixtures. The hub draws this row five across
   * and nothing else enforces it, so flagging a sixth entry — an ordinary edit to
   * content marked PROVISIONAL and headed for a CMS — would strand one card alone on a
   * second row with no error anywhere. Which five is still editorial: this takes them
   * in authored order.
   */
  async listFeaturedFaqEntries(): Promise<FaqEntry[]> {
    return faqEntries.filter((entry) => entry.featured).slice(0, FEATURED_LIMIT);
  },

  async listGuides(): Promise<Guide[]> {
    return [...guides];
  },

  async getGuideBySlug(slug: string): Promise<Guide | null> {
    return guides.find((guide) => guide.slug === slug) ?? null;
  },
};

export type Support = typeof mockSupport;
