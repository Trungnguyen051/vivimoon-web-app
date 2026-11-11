import { z } from 'zod';
import { localizedTextSchema, localizedBodySchema } from './editorial';

/**
 * The six subjects help content is filed under. One list, not one per screen: the
 * support hub shows all six as tiles and the FAQ sidebar lists the same six beneath
 * "Tất cả", so no Topic is reachable from one screen and invisible on the other.
 *
 * Labels are not here. A Topic's name is chrome, so it lives in the dictionary and
 * gets the parity the `Dictionary` type gives UI copy; this enum is the identity the
 * fixtures and the `?category=` param agree on.
 */
export const topicSchema = z.enum([
  'nguoi-moi-deo-lens',
  'chon-lens-va-do-can',
  'don-hang-va-thanh-toan',
  'giao-hang',
  'doi-tra-va-bao-hanh',
  'tai-khoan-va-uu-dai',
]);

/**
 * A link out of an answer, carried *beside* the prose rather than inside it. Keeping
 * it a field is what lets an answer stay plain paragraphs — the same no-parser rule
 * `Article` holds (ADR-0019) — while still pointing a reader at the Guide that
 * actually shows them how.
 *
 * `href` carries no locale prefix — the page renders it under the locale the reader
 * is already in, so one authored link serves both and a Vietnamese reader is never
 * walked into the English storefront. It is checked against the real route tree by
 * `tests/authored-links.test.ts`, so a renamed route cannot leave a dead link buried
 * in a fixture.
 */
export const supportLinkSchema = z.object({
  href: z
    .string()
    .startsWith('/', 'href must be an app-relative path')
    .refine((h) => !/^\/(vi|en)(\/|$)/.test(h), 'href must not carry a locale prefix'),
  label: localizedTextSchema,
});

/**
 * One question Vivimoon answers.
 *
 * `shortAnswer` is authored rather than derived: it is the line a hub card shows,
 * where a sentence cut mid-word reads as a bug rather than as a summary.
 */
export const faqEntrySchema = z.object({
  slug: z.string().min(1),
  topic: topicSchema,
  /** Shown in the hub's "Người mới hay hỏi" row. */
  featured: z.boolean(),
  question: localizedTextSchema,
  shortAnswer: localizedTextSchema,
  answer: localizedBodySchema,
  links: z.array(supportLinkSchema),
});

export type Topic = z.infer<typeof topicSchema>;
export type SupportLink = z.infer<typeof supportLinkSchema>;
export type FaqEntry = z.infer<typeof faqEntrySchema>;

/**
 * A plain date that is also a real day.
 *
 * The shape alone admits two different wrongs, and they fail differently. `2026-13-01`
 * parses to `Invalid Date`, and `Intl.DateTimeFormat.format` throws `RangeError` on
 * that — a fixture typo would 500 the page. `2026-11-31` is the quieter one: JavaScript
 * rolls it forward to 1 December and renders a date nobody authored, with nothing
 * anywhere to say so.
 *
 * The round trip catches both: a real day serialises back to the string it came from.
 */
function isoDate(field: string) {
  return z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, `${field} must be YYYY-MM-DD`)
    .refine((value) => {
      const parsed = new Date(value).getTime();
      return !Number.isNaN(parsed) && new Date(parsed).toISOString().slice(0, 10) === value;
    }, `${field} is not a real date`);
}

/**
 * One numbered step of a Guide: what to do, and a picture of it being done.
 *
 * The illustration is required. A step that cannot be shown is a step a first-time
 * wearer has to imagine, which is the whole thing this document exists to spare them.
 */
export const guideStepSchema = z.object({
  image: z.string().min(1),
  title: localizedTextSchema,
  body: localizedTextSchema,
});

/**
 * A Guide: a fixed-layout help document, and not an Article (ADR-0019).
 *
 * Named parts rather than a discriminated union of section kinds. A union is a
 * document builder, and there is one guide shape here with no CMS to author against —
 * it would be an extension point serving a single implementation. Widening a
 * named-parts schema later is a smaller change than unwinding a union nobody varied.
 *
 * `updatedAt` as well as `publishedAt`, which an Article does not carry: step-by-step
 * instructions about someone's eyes going stale is a safety problem in a way that an
 * opinion piece about lens colour is not.
 *
 * `video` is optional and currently unused. Shipping an empty grey box labelled
 * "video" is shipping a bug; keeping it in the schema means the day Vivimoon sends
 * footage is a content change rather than a migration.
 */
export const guideSchema = z.object({
  slug: z.string().min(1),
  topic: topicSchema,
  publishedAt: isoDate('publishedAt'),
  updatedAt: isoDate('updatedAt'),
  title: localizedTextSchema,
  /* `.min(1)`, because `''` is exactly the value that would render the empty box this
     field exists to avoid: the page treats "no video" as absent, not as blank. */
  video: z.string().min(1).optional(),
  /** What to do before starting. */
  opening: localizedBodySchema,
  steps: z.array(guideStepSchema).min(1),
  /** When to stop and see a doctor rather than push through. */
  closing: localizedBodySchema,
  /** The row of lenses to act on — a real Collection slug, so "Xem tất cả" resolves. */
  collection: z.string().min(1),
  /**
   * A Guide and an Article differ by shape, never by subject, so the rail points at
   * either kind rather than refusing to link to prose it did not author (ADR-0019).
   */
  related: z.array(z.object({ kind: z.enum(['guide', 'article']), slug: z.string().min(1) })),
});

export type GuideStep = z.infer<typeof guideStepSchema>;
export type Guide = z.infer<typeof guideSchema>;

/**
 * Whether a Guide helped (#124).
 *
 * Two fields and no more. There is no dedup, because guests have no identity in this
 * app and inventing one for a thumbs-up is disproportionate; and no tally, because
 * what to do with the signal is a product decision nobody has made yet.
 */
export const guideFeedbackSchema = z.object({
  /*
   * Bounded, unlike most `.min(1)` strings here: this one is retained for the life of
   * the process rather than resolved and dropped. App Router route handlers have no
   * body-size limit of their own, so without a ceiling a single multi-megabyte slug is
   * accepted and kept.
   */
  guideSlug: z.string().min(1).max(120),
  helpful: z.boolean(),
});

export type GuideFeedback = z.infer<typeof guideFeedbackSchema>;
