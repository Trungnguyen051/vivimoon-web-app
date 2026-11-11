import { describe, it, expect } from 'vitest';
import { filterFaqEntries } from './faq-filter';
import type { FaqEntry } from '@/lib/api/schemas/support';

function entry(over: Partial<FaqEntry> & Pick<FaqEntry, 'slug'>): FaqEntry {
  return {
    topic: 'nguoi-moi-deo-lens',
    featured: false,
    question: { vi: 'Câu hỏi', en: 'A question' },
    shortAnswer: { vi: 'Trả lời ngắn', en: 'A short answer' },
    answer: { vi: ['Dài'], en: ['Long'] },
    links: [],
    ...over,
  };
}

const entries: FaqEntry[] = [
  entry({
    slug: 'deo-lens-co-dau-khong',
    topic: 'nguoi-moi-deo-lens',
    question: { vi: 'Đeo lens có đau không?', en: 'Does wearing lenses hurt?' },
    shortAnswer: { vi: 'Không đau nếu đúng cách.', en: 'Not if you do it right.' },
    answer: { vi: ['Cộm nhẹ lúc đầu là bình thường.'], en: ['Mild grit at first is normal.'] },
  }),
  entry({
    slug: 'giao-hang-bao-lau',
    topic: 'giao-hang',
    question: { vi: 'Giao hàng mất bao lâu?', en: 'How long is delivery?' },
    shortAnswer: { vi: 'Hai tới bốn ngày.', en: 'Two to four days.' },
    answer: { vi: ['Nội thành nhanh hơn.'], en: ['Faster in the city.'] },
  }),
  entry({ slug: 'doi-tra', topic: 'doi-tra-va-bao-hanh' }),
];

describe('filterFaqEntries', () => {
  it('returns everything when nothing is asked', () => {
    expect(filterFaqEntries(entries, {})).toHaveLength(3);
  });

  it('narrows to a Topic', () => {
    expect(filterFaqEntries(entries, { category: 'giao-hang' }).map((e) => e.slug))
      .toEqual(['giao-hang-bao-lau']);
  });

  /**
   * The replace rule. Searching and browsing are different modes: a query that narrowed
   * *within* a Topic would hide answers a reader can see are relevant, and a sidebar
   * reporting counts under a live query reads as broken.
   */
  it('lets a query replace the active Topic rather than narrowing inside it', () => {
    const found = filterFaqEntries(entries, { q: 'giao hàng', category: 'nguoi-moi-deo-lens' });

    expect(found.map((e) => e.slug)).toEqual(['giao-hang-bao-lau']);
  });

  /**
   * The match-scope rule. A match found only in the full answer is invisible on the
   * collapsed row that claims it, which reads as a wrong result rather than a found one.
   */
  it('matches question and short answer, and stops there', () => {
    expect(filterFaqEntries(entries, { q: 'đau' }).map((e) => e.slug)).toEqual(['deo-lens-co-dau-khong']);
    expect(filterFaqEntries(entries, { q: 'đúng cách' }).map((e) => e.slug)).toEqual(['deo-lens-co-dau-khong']);
    // Present only in the full answer of the first entry.
    expect(filterFaqEntries(entries, { q: 'cộm nhẹ' })).toEqual([]);
  });

  it('finds a question typed without its tone marks, in either locale', () => {
    expect(filterFaqEntries(entries, { q: 'deo lens' }).map((e) => e.slug)).toEqual(['deo-lens-co-dau-khong']);
    expect(filterFaqEntries(entries, { q: 'DELIVERY' }).map((e) => e.slug)).toEqual(['giao-hang-bao-lau']);
  });

  /** A box holding only spaces is not a query: typing and clearing gives the list back. */
  it('treats a blank query as no query at all', () => {
    expect(filterFaqEntries(entries, { q: '   ' })).toHaveLength(3);
    expect(filterFaqEntries(entries, { q: '   ', category: 'giao-hang' }).map((e) => e.slug))
      .toEqual(['giao-hang-bao-lau']);
  });

  it('says nothing matched rather than falling back to everything', () => {
    expect(filterFaqEntries(entries, { q: 'khong-co-cau-nao-nhu-vay' })).toEqual([]);
  });

  it('keeps authored order, which is editorial judgement about what to meet first', () => {
    expect(filterFaqEntries(entries, {}).map((e) => e.slug)).toEqual(entries.map((e) => e.slug));
  });

  /**
   * A phrase that appears on no single field must not match. Joining the fields into
   * one string and running `includes` over it matched across the seam — with a question
   * ending "…hurt?" and a short answer beginning "Không đau…", `hurt? Không đau` found
   * a row on which that phrase appears nowhere.
   */
  it('does not match a phrase straddling two fields', () => {
    expect(filterFaqEntries(entries, { q: 'hurt? Không đau' })).toEqual([]);
    // Each half still finds it on its own field.
    expect(filterFaqEntries(entries, { q: 'hurt' }).map((e) => e.slug)).toEqual(['deo-lens-co-dau-khong']);
    expect(filterFaqEntries(entries, { q: 'Không đau' }).map((e) => e.slug)).toEqual(['deo-lens-co-dau-khong']);
  });

  it('does not mutate what it was given', () => {
    const before = [...entries];
    filterFaqEntries(entries, { q: 'đau' });

    expect(entries).toEqual(before);
  });
});
