import { describe, it, expect } from 'vitest';
import type { Product } from '@/lib/api/schemas/catalog';
import { vi } from '@/lib/i18n/dictionaries/vi';
import { activeFilterGroups, cardImage, showQuizCard, specLine } from './plp-card';

const product = {
  images: ['/a.jpg', '/b.jpg'], replacement: 'monthly',
  specs: { material: 'Hydrogel', waterContent: '', baseCurve: '', diameter: '14.2mm', graphicDiameter: '13.3mm', origin: '' },
} as Product;

describe('specLine', () => {
  it('reads Dòng lens · replacement · DIA · GDIA', () => {
    expect(specLine(product, vi)).toBe('Khoá ẩm · 1 tháng · DIA 14.2 · GDIA 13.3');
  });

  it('drops what a clear lens has no value for', () => {
    expect(specLine({ ...product, specs: { ...product.specs, graphicDiameter: undefined } }, vi)).toBe('Khoá ẩm · 1 tháng · DIA 14.2');
  });
});

describe('cardImage', () => {
  const gallery = { eye: ['/e.jpg'], face: ['/f.jpg'], withMakeup: [], withoutMakeup: [], byEyeColor: {}, closeUp: ['/c.jpg'] };

  it('takes each view from the gallery', () => {
    expect([cardImage(product, gallery, 'eye'), cardImage(product, gallery, 'face'), cardImage(product, gallery, 'closeUp')])
      .toEqual(['/e.jpg', '/f.jpg', '/c.jpg']);
  });

  it("falls back to the product's own images", () => {
    expect([cardImage(product, undefined, 'eye'), cardImage(product, undefined, 'face'), cardImage(product, undefined, 'closeUp')])
      .toEqual(['/a.jpg', '/b.jpg', '/a.jpg']);
  });
});

describe('quiz card rules', () => {
  it('shows on a plain listing of 6 or more', () => {
    expect(showQuizCard({}, 6)).toBe(true);
    expect(showQuizCard({ sort: 'newest', show: '16', view: 'eye', replacement: 'daily' }, 20)).toBe(true);
  });

  it('hides for a shopper arriving from quiz results', () => {
    expect(showQuizCard({ from: 'quiz' }, 20)).toBe(false);
  });

  it('hides at two filter groups', () => {
    expect(showQuizCard({ replacement: 'daily', color: 'brown' }, 20)).toBe(false);
  });

  it('counts min and max price, colour and clear line, and Độ each as one group', () => {
    expect(activeFilterGroups({ minPrice: '1', maxPrice: '2' })).toBe(1);
    expect(activeFilterGroups({ color: 'brown', productLine: 'trongSuot' })).toBe(1);
    expect(activeFilterGroups({ rx: '-2.50,-3.00' })).toBe(1);
    expect(showQuizCard({ rx: '-2.50,-3.00', minPrice: '1', maxPrice: '2' }, 20)).toBe(false);
  });

  it('does not count a malformed Độ, which filters nothing', () => {
    expect(activeFilterGroups({ rx: 'abc' })).toBe(0);
    expect(activeFilterGroups({ rx: '-2.50' })).toBe(0);
    expect(showQuizCard({ rx: 'abc', minPrice: '1' }, 20)).toBe(true);
  });

  it('hides under 6 results', () => {
    expect(showQuizCard({}, 5)).toBe(false);
  });
});
