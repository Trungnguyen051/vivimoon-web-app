import { describe, it, expect } from 'vitest';
import { localizedTextSchema, localizedBodySchema, articleSchema } from './editorial';
import { locales } from '@/lib/i18n/config';

describe('editorial schemas', () => {
  /**
   * Article translations live in the fixtures rather than the dictionary, so they
   * miss the parity the `Dictionary` type gives UI copy. Adding a locale must fail
   * here rather than silently leave every article untranslated in it.
   */
  it.each([
    ['localizedText', localizedTextSchema],
    ['localizedBody', localizedBodySchema],
  ])('%s covers exactly the supported locales', (_name, schema) => {
    expect(Object.keys(schema.shape).sort()).toEqual([...locales].sort());
  });

  it('rejects a publishedAt that is not a plain date', () => {
    const article = {
      slug: 'x', image: '/x.png', publishedAt: '28/09/2026', readingTheme: 'beginner',
      title: { vi: 'a', en: 'a' }, excerpt: { vi: 'a', en: 'a' }, body: { vi: ['a'], en: ['a'] },
    };

    expect(articleSchema.safeParse(article).success).toBe(false);
    expect(articleSchema.safeParse({ ...article, publishedAt: '2026-09-28' }).success).toBe(true);
  });

  /**
   * A Reading Theme is what the Knowledge index filters by and what every card wears
   * as its eyebrow, so an Article without one has no place in the index and no label
   * on its card. Required rather than optional for that reason — and a free string
   * would let a typo file an article under a theme no chip can select.
   */
  it('requires a Reading Theme the taxonomy actually has', () => {
    const article = {
      slug: 'x', image: '/x.png', publishedAt: '2026-09-28',
      title: { vi: 'a', en: 'a' }, excerpt: { vi: 'a', en: 'a' }, body: { vi: ['a'], en: ['a'] },
    };

    expect(articleSchema.safeParse(article).success).toBe(false);
    expect(articleSchema.safeParse({ ...article, readingTheme: 'nonsense' }).success).toBe(false);
    expect(articleSchema.safeParse({ ...article, readingTheme: 'care' }).success).toBe(true);
  });
});
