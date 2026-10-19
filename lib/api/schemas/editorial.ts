import { z } from 'zod';

/**
 * Text in every supported locale. Articles are content, not UI chrome, so their
 * translations live beside them rather than in the dictionary — a dictionary key
 * per paragraph of every article would not scale, and an article is authored as a
 * whole in each language. Keys mirror `locales` in lib/i18n/config, which
 * `editorial.test.ts` holds them to.
 */
export const localizedTextSchema = z.object({
  vi: z.string().min(1),
  en: z.string().min(1),
});

export const localizedBodySchema = z.object({
  vi: z.array(z.string().min(1)).min(1),
  en: z.array(z.string().min(1)).min(1),
});

/**
 * An Article: one editorial piece behind the homepage's Kiến thức section. Body is
 * paragraphs rather than markup, so rendering needs no parser and the fixtures
 * cannot inject markup into the page.
 */
export const articleSchema = z.object({
  slug: z.string().min(1),
  image: z.string().min(1),
  /** ISO date, used for display order and the dateline. */
  publishedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'publishedAt must be YYYY-MM-DD'),
  title: localizedTextSchema,
  excerpt: localizedTextSchema,
  body: localizedBodySchema,
});

export type LocalizedText = z.infer<typeof localizedTextSchema>;
export type Article = z.infer<typeof articleSchema>;
