import { describe, it, expect } from 'vitest';
import { isLocale } from './config';
import { getDictionary } from './dictionaries';

describe('i18n', () => {
  it('validates locales', () => {
    expect(isLocale('en')).toBe(true);
    expect(isLocale('fr')).toBe(false);
  });
  it('returns matching dictionaries with the same keys', () => {
    const en = getDictionary('en');
    const vi = getDictionary('vi');
    expect(Object.keys(en.nav)).toEqual(Object.keys(vi.nav));
    expect(vi.common.shopNow).toBe('Mua ngay');
  });
});
