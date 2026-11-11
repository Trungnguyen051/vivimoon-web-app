import { describe, it, expect } from 'vitest';
import { CARDS_PER_PAGE, knowledgeIndexLayout } from './index-layout';

/**
 * Three rules travel together — the Lead Article comes off the top, the grid pages six
 * at a time, and the grid is omitted entirely below two matches — so they live in one
 * function rather than scattered through the page (#129). Pure, so the arithmetic is
 * checked without rendering anything.
 */
describe('knowledgeIndexLayout', () => {
  const matches = (n: number) => Array.from({ length: n }, (_, i) => `a${i}`);

  it.each([
    // total, shown,         lead,   cards, more
    [0, CARDS_PER_PAGE, undefined, 0, 0],
    [1, CARDS_PER_PAGE, 'a0', 0, 0],
    [6, CARDS_PER_PAGE, 'a0', 5, 0],
    [7, CARDS_PER_PAGE, 'a0', 6, 0],
    [8, CARDS_PER_PAGE, 'a0', 6, 1],
  ])('lays out %i matches', (total, shown, lead, cardCount, more) => {
    const layout = knowledgeIndexLayout(matches(total), shown);

    expect(layout.lead).toBe(lead);
    expect(layout.cards).toHaveLength(cardCount);
    expect(layout.remaining).toBe(more);
  });

  /**
   * A heading over an empty band reads as a bug, so one match renders the Lead Article
   * and nothing else — the grid section is omitted, heading and all.
   */
  it('omits the grid below two matches', () => {
    expect(knowledgeIndexLayout(matches(1), CARDS_PER_PAGE).hasGrid).toBe(false);
    expect(knowledgeIndexLayout(matches(2), CARDS_PER_PAGE).hasGrid).toBe(true);
  });

  it('never repeats the Lead Article in the grid', () => {
    const { lead, cards } = knowledgeIndexLayout(matches(8), CARDS_PER_PAGE);

    expect(cards).not.toContain(lead);
    expect(cards[0]).toBe('a1');
  });

  /** Showing more raises the count rather than replacing a page, so the lead stays put. */
  it('grows the grid as more is asked for, and stops when the list runs out', () => {
    const grown = knowledgeIndexLayout(matches(8), CARDS_PER_PAGE * 2);

    expect(grown.lead).toBe('a0');
    expect(grown.cards).toHaveLength(7);
    expect(grown.remaining).toBe(0);
  });

  /**
   * `shown` arrives off a URL a shopper can edit, so it is clamped rather than trusted:
   * a negative would otherwise slice from the end of the list and show the oldest
   * articles under a control that says "show more".
   */
  it('clamps a nonsense count to one page', () => {
    expect(knowledgeIndexLayout(matches(8), -5).cards).toHaveLength(CARDS_PER_PAGE);
    expect(knowledgeIndexLayout(matches(8), 0).cards).toHaveLength(CARDS_PER_PAGE);
  });

  /**
   * The clamp is reported, not just applied. The show-more control raises this figure,
   * and raising the caller's raw one instead would turn `?shown=-4` into `?shown=2` —
   * which clamps straight back to six and renders the identical page.
   */
  it('reports the count it settled on', () => {
    expect(knowledgeIndexLayout(matches(8), -5).limit).toBe(CARDS_PER_PAGE);
    expect(knowledgeIndexLayout(matches(8), CARDS_PER_PAGE * 2).limit).toBe(CARDS_PER_PAGE * 2);
  });
});
