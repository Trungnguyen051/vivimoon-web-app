import { describe, it, expect } from 'vitest';
import { formatLineSummary, lineTitle } from './line-summary';
import { getDictionary } from '@/lib/i18n/dictionaries';

const vi = getDictionary('vi');
const pair = (left: number, right: number) => ({ sameBothEyes: false, left: { sph: left }, right: { sph: right } });

describe('formatLineSummary (ADR-0023)', () => {
  it('formats a single, a pair and a plano pair the one shared way', () => {
    expect(formatLineSummary({ purchaseUnit: 'single', rx: { sph: -2.5 } }, vi)).toBe('1 chiếc · −2.50');
    expect(formatLineSummary({ purchaseUnit: 'pair', rx: pair(-2.5, -3) }, vi)).toBe('1 đôi · L −2.50 · R −3.00');
    expect(formatLineSummary({ purchaseUnit: 'pair', rx: pair(0, 0) }, vi)).toBe('1 đôi · Không độ');
    expect(formatLineSummary({ purchaseUnit: 'single', rx: { sph: 0 } }, vi)).toBe('1 chiếc · Không độ');
  });

  it('reads a unit-less line with an Rx as a pair, and gives nothing for a line with no Rx', () => {
    expect(formatLineSummary({ rx: pair(-1, -1) }, vi)).toBe('1 đôi · L −1.00 · R −1.00');
    expect(formatLineSummary({}, vi)).toBeNull();
  });

  it('formats an accessory as its variant and quantity', () => {
    expect(formatLineSummary({ variantLabel: '120ml', quantity: 1 }, vi)).toBe('120ml · x1');
    expect(formatLineSummary({ variantLabel: '120ml', quantity: 3 }, vi)).toBe('120ml · x3');
  });
});

describe('lineTitle', () => {
  it('names the Dòng lens the PLP card labels, then the replacement (#202)', () => {
    expect(lineTitle({ name: 'Sandkiss', lensLine: 'moisture', replacement: 'monthly' }, vi)).toBe('Sandkiss · Khoá ẩm 1 tháng');
    expect(lineTitle({ name: 'Savage Gray', lensLine: 'breathable', replacement: 'sixMonth' }, vi)).toBe('Savage Gray · Mắt thở 6 tháng');
    expect(lineTitle({ name: 'Nước ngâm lens 120ml' }, vi)).toBe('Nước ngâm lens 120ml');
  });
});
