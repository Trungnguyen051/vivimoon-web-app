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
 * The subject an Article is grouped under (CONTEXT.md). It files the Knowledge index —
 * today the chip row, and the card eyebrows and article breadcrumb that #129 and #130
 * add — and chooses which Collection the article merchandises beside its body (ADR-0018).
 *
 * Named Reading Theme rather than Topic because the Support section's Topic files FAQ
 * Entries and Guides; the two are separated by what they file, and one word across both
 * would be ambiguous at every call site.
 */
export const readingThemeSchema = z.enum([
  'beginner',
  'comfort',
  'natural',
  'makeup',
  'occasion',
  'care',
]);

/**
 * An Article: one editorial piece behind the homepage's Kiến thức section. Body is
 * paragraphs rather than markup, so rendering needs no parser and the fixtures
 * cannot inject markup into the page.
 *
 * It carries no product reference by design (ADR-0018): that independence is what lets
 * editorial migrate to a CMS ahead of catalog. The lenses beside an article are composed
 * at the page from its Reading Theme instead.
 */
export const articleSchema = z.object({
  slug: z.string().min(1),
  image: z.string().min(1),
  /** ISO date, used for display order and the dateline. */
  publishedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'publishedAt must be YYYY-MM-DD'),
  readingTheme: readingThemeSchema,
  title: localizedTextSchema,
  excerpt: localizedTextSchema,
  body: localizedBodySchema,
});

/** How the index orders results. Newest is the default the design shows. */
export const articleSortSchema = z.enum(['newest', 'oldest']);

/**
 * The Knowledge index's URL state. The chip row, the search box and the sort control are
 * three spellings of this one query, which is why filtering lives in the resource rather
 * than in the page.
 */
export const articleQuerySchema = z.object({
  readingTheme: readingThemeSchema.optional(),
  /** Free text. Matched across every locale, so a search never depends on which one is open. */
  q: z.string().optional(),
  sort: articleSortSchema.optional(),
});

export type LocalizedText = z.infer<typeof localizedTextSchema>;
export type Article = z.infer<typeof articleSchema>;
export type ReadingTheme = z.infer<typeof readingThemeSchema>;
export type ArticleSort = z.infer<typeof articleSortSchema>;
export type ArticleQuery = z.infer<typeof articleQuerySchema>;
