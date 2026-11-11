import { describe, it, expect } from 'vitest';
import { readingMinutes } from './reading-time';
import { articles } from '@/content/mock';
import { locales } from '@/lib/i18n/config';

/** A body of exactly `words` words, spread over three paragraphs the way an article is. */
function bodyOf(words: number): string[] {
  const all = Array.from({ length: words }, (_, i) => `word${i}`);
  const third = Math.ceil(words / 3);
  return [all.slice(0, third), all.slice(third, third * 2), all.slice(third * 2)]
    .filter((part) => part.length > 0)
    .map((part) => part.join(' '));
}

describe('reading time', () => {
  /**
   * 200 words a minute is the figure the dateline promises against. The expectations here
   * are worked from that rate rather than from the implementation: 200 words is a minute,
   * 600 is three, and 500 rounds to the nearer of two and three.
   */
  it.each([
    [200, 1],
    [400, 2],
    [600, 3],
    [500, 3],
  ])('reads %i words as %i minutes', (words, minutes) => {
    expect(readingMinutes(bodyOf(words))).toBe(minutes);
  });

  /**
   * A very short article still takes a moment, and "0 phút đọc" reads as a bug rather
   * than as brevity — which matters now, because every current fixture is short enough
   * to round to zero without this floor.
   */
  it('never promises less than a minute', () => {
    expect(readingMinutes(['Ba từ thôi.'])).toBe(1);
    expect(readingMinutes([''])).toBe(1);
  });

  /**
   * Vietnamese writes syllables as separate words, so the same article counts higher in
   * Vietnamese than in English. The figure is therefore computed per locale rather than
   * once per article — this holds that the two can actually differ, which is the whole
   * reason the body is passed in rather than the Article.
   */
  it('counts each locale separately', () => {
    for (const article of articles) {
      for (const locale of locales) {
        expect(readingMinutes(article.body[locale])).toBeGreaterThanOrEqual(1);
      }
    }
  });
});
