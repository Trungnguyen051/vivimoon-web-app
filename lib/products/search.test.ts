import { describe, it, expect } from 'vitest';
import type { Product } from '@/lib/api/schemas/catalog';
import { products } from '@/content/mock';
import { popularSearches } from '@/content/search';
import { matchesSearch } from './search';

const lens = {
  name: 'Sandkiss', productLine: 'coMau', replacement: 'monthly', badges: [],
  specs: { material: 'Hydrogel', waterContent: '45%', baseCurve: '8.6mm', diameter: '14.2mm', origin: '' },
  variants: [{ id: 'v', sku: 's', price: 1, currency: 'VND', stock: 1, color: 'brown', colorLabel: 'Hazel Brown' }],
  makeupStyles: ['natural'], occasions: ['graduation'], sphRange: { min: -8, max: 0 },
} as unknown as Product;

describe('matchesSearch (#259)', () => {
  it('ignores accents and capitals, including đ', () => {
    expect(matchesSearch(lens, 'NÂU')).toBe(true);
    expect(matchesSearch(lens, 'nau tu nhien')).toBe(true);
    expect(matchesSearch(lens, 'co do')).toBe(true); // "có độ"
  });

  it('requires every word to match somewhere', () => {
    expect(matchesSearch(lens, 'nâu tự nhiên')).toBe(true);
    expect(matchesSearch(lens, 'nâu tiệc')).toBe(false);
  });

  it.each([
    ['its name', 'sandkiss'],
    ['a color name', 'hazel'],
    ['its Color Family', 'nâu'],
    ['its Dòng lens', 'khoá ẩm'],
    ['its product line', 'có màu'],
    ['its hạn sử dụng', '1 tháng'],
    ['a makeup style', 'trong trẻo'],
    ['an Occasion', 'kỷ yếu'],
    ['the word lens itself', 'lens nâu'],
    ['having no power', 'không độ'],
  ])('matches %s', (_, query) => {
    expect(matchesSearch(lens, query)).toBe(true);
  });

  it('matches the English labels too', () => {
    expect(matchesSearch(lens, 'brown yearbook')).toBe(true);
    expect(matchesSearch(lens, 'moisture-lock')).toBe(true);
  });

  it('matches nothing for an empty query or a word the lens does not state', () => {
    expect(matchesSearch(lens, '   ')).toBe(false);
    expect(matchesSearch(lens, 'tím')).toBe(false);
  });

  it('every popular keyword finds at least one lens in the catalog', () => {
    for (const keyword of [...popularSearches.vi, ...popularSearches.en]) {
      expect(products.some((p) => matchesSearch(p, keyword)), keyword).toBe(true);
    }
    expect(popularSearches.vi).toHaveLength(6);
    expect(popularSearches.en).toHaveLength(6);
  });
});
