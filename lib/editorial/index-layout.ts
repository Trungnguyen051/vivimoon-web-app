/**
 * How the Knowledge index arranges whatever the current query returned (#129).
 *
 * Three rules travel together and are meaningless apart: the Lead Article comes off the
 * top of the list, the grid beneath it pages six at a time, and below two matches the
 * grid is omitted entirely — heading and all, because a heading over an empty band reads
 * as a bug. Scattered through the page they would be three conditions that can disagree;
 * here they are one function with no rendering in it, so the arithmetic is checked
 * directly across the counts that matter.
 *
 * The Lead Article is positional, not editorial: it is the first of the *current* result
 * set, so narrowing the index changes which article leads it. Nothing about the choice
 * is a judgement anyone made, which is why the design's "NỔI BẬT" eyebrow is reworded.
 */
export const CARDS_PER_PAGE = 6;

export type KnowledgeIndexLayout<T> = {
  /** The band at the top. Absent only when nothing matched. */
  lead: T | undefined;
  /** The grid beneath it, already capped at what the shopper has asked to see. */
  cards: T[];
  /** How many matches are still unshown — the show-more control's reason to exist. */
  remaining: number;
  /** False below two matches, when the grid section is omitted rather than left empty. */
  hasGrid: boolean;
  /**
   * The clamped count this layout actually used. Returned rather than recomputed by the
   * caller: the show-more control raises it, and a control that raised the *unclamped*
   * figure would answer a nonsense `?shown=-4` with a link back to the same six cards.
   */
  limit: number;
};

export function knowledgeIndexLayout<T>(matches: T[], shown: number): KnowledgeIndexLayout<T> {
  const [lead, ...rest] = matches;

  /* `shown` is read off a URL a shopper can edit. Clamped rather than trusted: a
     negative slices from the end of the list, which would answer "show more" with the
     oldest articles and no error anywhere. */
  const limit = Math.max(CARDS_PER_PAGE, Math.floor(shown) || CARDS_PER_PAGE);
  const cards = rest.slice(0, limit);

  return {
    lead,
    cards,
    remaining: rest.length - cards.length,
    hasGrid: rest.length > 0,
    limit,
  };
}
