import { describe, it, expect } from 'vitest';
import { occasionSchema } from '@/lib/api/schemas/catalog';
import { occasionContent } from './occasions';

describe('occasionContent (#251)', () => {
  it('every Occasion has complete advice in both locales', () => {
    for (const occasion of occasionSchema.options) {
      const c = occasionContent[occasion];
      const texts = [c.headline, c.subline, c.tipsTitle, ...c.tips, c.videoTitle, ...(c.promo ? [c.promo] : [])];
      expect(c.tips, occasion).toHaveLength(3);
      for (const text of texts) {
        expect(text.vi.trim(), occasion).not.toBe('');
        expect(text.en.trim(), occasion).not.toBe('');
      }
      expect(c.subline.vi, occasion).toContain('{n}');
      expect(c.subline.en, occasion).toContain('{n}');
    }
  });

  it('only Kỷ yếu carries the class-shoot promo line', () => {
    expect(occasionSchema.options.filter((o) => occasionContent[o].promo)).toEqual(['graduation']);
  });
});
