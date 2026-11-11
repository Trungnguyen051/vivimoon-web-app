/**
 * Minutes to read an Article, derived from its body rather than authored beside it.
 *
 * The design states the figure twice — on every card and in an article's dateline — and a
 * stored number is a second source of truth that goes stale the moment a paragraph is
 * edited, with nothing to catch it. Deriving costs a word count and cannot drift. Same
 * discipline as Eye Enlargement (ADR-0005).
 *
 * Takes a body rather than an Article because the figure is per locale: Vietnamese writes
 * syllables as separate words, so the same article counts higher there and reads as a
 * minute or so longer — the safe direction for a promise about someone's time.
 */
const WORDS_PER_MINUTE = 200;

export function readingMinutes(body: string[]): number {
  const words = body.join(' ').trim().split(/\s+/).filter(Boolean).length;
  // Never zero: a one-paragraph article still takes a moment, and "0 phút đọc" reads as
  // a bug rather than as brevity. Every current fixture is short enough to need this.
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}
