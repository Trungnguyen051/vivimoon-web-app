import { describe, it, expect } from 'vitest';
import { topicSchema, faqEntrySchema } from './support';
import { faqEntries } from '@/content/mock/support';

const entry = {
  slug: 'x', topic: 'giao-hang' as const, featured: false,
  question: { vi: 'a', en: 'a' },
  shortAnswer: { vi: 'a', en: 'a' },
  answer: { vi: ['a'], en: ['a'] },
  links: [],
};

describe('support schemas', () => {
  /**
   * The fixtures are the only place a FAQ Entry is authored, so a typo there is the
   * failure this guards — not a hypothetical caller. Validating the real data is the
   * whole point; a test over a hand-built object only proves zod works.
   */
  it('accepts every authored FAQ Entry', () => {
    for (const authored of faqEntries) {
      const parsed = faqEntrySchema.safeParse(authored);
      expect(parsed.success, `${authored.slug}: ${parsed.error?.issues[0]?.message}`).toBe(true);
    }
  });

  it('gives every FAQ Entry a distinct slug', () => {
    const slugs = faqEntries.map((e) => e.slug);
    expect(slugs).toEqual([...new Set(slugs)]);
  });

  /**
   * A sidebar listing a Topic no entry carries renders an empty column, and an entry
   * under a Topic the sidebar omits is unreachable by browsing. Neither is visible
   * from the schema alone, so both are held here.
   */
  it('files at least one FAQ Entry under every Topic', () => {
    const used = new Set(faqEntries.map((e) => e.topic));
    expect([...used].sort()).toEqual([...topicSchema.options].sort());
  });

  it('marks some FAQ Entries featured, for the hub to show', () => {
    expect(faqEntries.filter((e) => e.featured).length).toBeGreaterThan(0);
  });

  it('rejects an answer link that is not an app-relative path', () => {
    const link = (href: string) => ({ ...entry, links: [{ href, label: { vi: 'a', en: 'a' } }] });
    expect(faqEntrySchema.safeParse(link('https://example.com')).success).toBe(false);
    expect(faqEntrySchema.safeParse(link('orders/track')).success).toBe(false);
    expect(faqEntrySchema.safeParse(link('/orders/track')).success).toBe(true);
  });

  /**
   * A fixture that hardcoded `/vi/...` would walk an English reader into the
   * Vietnamese storefront, and the page already supplies the locale.
   */
  it('rejects an answer link that carries a locale prefix', () => {
    const link = (href: string) => ({ ...entry, links: [{ href, label: { vi: 'a', en: 'a' } }] });
    expect(faqEntrySchema.safeParse(link('/vi/support/faq')).success).toBe(false);
    expect(faqEntrySchema.safeParse(link('/en/support/faq')).success).toBe(false);
  });

  it('rejects a Topic outside the six', () => {
    expect(faqEntrySchema.safeParse({ ...entry, topic: 'khuyen-mai' }).success).toBe(false);
  });
});
