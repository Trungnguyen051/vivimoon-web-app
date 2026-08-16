import { describe, it, expect } from 'vitest';
import { formatPrice } from './format';

describe('formatPrice', () => {
  it('formats VND with no decimals and đ suffix', () => {
    expect(formatPrice(399000, 'VND', 'vi')).toContain('399.000');
  });
  it('formats USD with dollar sign for en', () => {
    expect(formatPrice(25, 'USD', 'en')).toBe('$25.00');
  });
});
