import { faqEntries } from '@/content/mock';
import type { FaqEntry } from '@/lib/api/schemas/support';

export const mockSupport = {
  /**
   * Every FAQ Entry, in authored order. The fixtures are grouped by Topic, which is
   * the order the FAQ page shows them in — authoring order is editorial judgement
   * about what a reader should meet first, and sorting here would discard it.
   */
  async listFaqEntries(): Promise<FaqEntry[]> {
    return [...faqEntries];
  },

  /** The handful the support hub shows as "Người mới hay hỏi". */
  async listFeaturedFaqEntries(): Promise<FaqEntry[]> {
    return faqEntries.filter((entry) => entry.featured);
  },
};

export type Support = typeof mockSupport;
