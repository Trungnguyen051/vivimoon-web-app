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
