import { faqEntries, guides } from '@/content/mock';
import type { FaqEntry, Guide, GuideFeedback } from '@/lib/api/schemas/support';

/*
 * Votes live for the life of the process. No store, no file, no dedup — see
 * `recordGuideFeedback`.
 *
 * Capped, because "no dedup" removes the only natural bound on this array and the
 * endpoint behind it needs no session. Uncapped, a loop of POSTs against a
 * long-running server grows the heap until the process dies. The cap discards the
 * oldest, which costs nothing: nothing reads these, and an upstream with a real store
 * replaces the whole mechanism.
 */
const MAX_VOTES = 1_000;
const guideFeedback: GuideFeedback[] = [];

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

  /**
   * Records a vote in memory and answers that it landed.
   *
   * In memory and nowhere else: the point is that the seam is real, so an upstream can
   * replace this without the page changing. It does not survive a restart and has no
   * reader — there is no tally surface, because what to do with the signal is a product
   * decision nobody has made. What it must not do is pretend: a button that reports
   * success without recording anything is worse than no button.
   */
  async recordGuideFeedback(feedback: GuideFeedback): Promise<GuideFeedback> {
    guideFeedback.push(feedback);
    if (guideFeedback.length > MAX_VOTES) guideFeedback.splice(0, guideFeedback.length - MAX_VOTES);
    return feedback;
  },
};

export type Support = typeof mockSupport;

/**
 * Mock-only, beside the resource rather than on it — the same shape as
 * `resetMockFavoritesState` and `resetMockLoyaltyState`.
 *
 * Kept off the `Support` contract deliberately: a method there would be mandatory for
 * any future upstream adapter, so whoever writes `upstream.ts` would have to invent a
 * `GET /guide-feedback` — or a stub that lies — purely to satisfy a type that exists
 * for a test. The ticket is explicit that no read surface has been decided on.
 */
export function readMockGuideFeedback(): GuideFeedback[] {
  return [...guideFeedback];
}

/** Votes otherwise leak between test files sharing a Vitest worker. */
export function resetMockGuideFeedbackState(): void {
  guideFeedback.length = 0;
}
