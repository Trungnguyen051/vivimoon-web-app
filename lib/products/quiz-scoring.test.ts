import { describe, it, expect } from 'vitest';
import { scoreQuiz, QUIZ_RESULTS_CAP } from './quiz-scoring';
import type { QuizQuestion } from '@/lib/api/schemas/discovery';
import type { Product } from '@/lib/api/schemas/catalog';

function product(overrides: Partial<Product> & Pick<Product, 'id'>): Product {
  return {
    slug: overrides.id,
    name: overrides.id,
    brandId: 'vivimoon',
    brandName: 'Vivimoon',
    type: 'clear',
    replacement: 'daily',
    description: 'd',
    images: ['/a.jpg'],
    badges: [],
    specs: {
      material: 'Hydrogel', waterContent: '50%', baseCurve: '8.6mm',
      diameter: '14.2mm', uvProtection: true, manufacturer: 'M',
    },
    requiresRx: true,
    variants: [{ id: `${overrides.id}-v1`, sku: 'S', packSize: '30', price: 10, currency: 'USD', stock: 1 }],
    rating: 4.5,
    reviewCount: 0,
    ...overrides,
  };
}

const questions: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: 'Look?',
    options: [
      { id: 'q1-colored', label: 'Colored', tags: { 'type:colored': 2 } },
      { id: 'q1-clear', label: 'Clear', tags: { 'type:clear': 2 } },
    ],
  },
];

const colored1 = product({ id: 'colored-1', type: 'colored', reviewCount: 5 });
const colored2 = product({ id: 'colored-2', type: 'colored', reviewCount: 1 });
const clear1 = product({ id: 'clear-1', type: 'clear', reviewCount: 5 });
const clear2 = product({ id: 'clear-2', type: 'clear', reviewCount: 1 });
const fixtureProducts = [clear1, clear2, colored1, colored2];

describe('scoreQuiz', () => {
  it('ranks every product matching the weighted tag above every product that does not', () => {
    const answers = [{ questionId: 'q1', optionId: 'q1-colored' }];
    const ranked = scoreQuiz(answers, questions, fixtureProducts);
    const coloredIds = new Set([colored1.id, colored2.id]);
    const firstClearIndex = ranked.findIndex((p) => !coloredIds.has(p.id));
    const lastColoredIndex = Math.max(...ranked.map((p, i) => (coloredIds.has(p.id) ? i : -1)));
    expect(lastColoredIndex).toBeLessThan(firstClearIndex);
  });

  it('degrades to a deterministic default ordering (by reviewCount) when answers is empty', () => {
    const ranked = scoreQuiz([], questions, fixtureProducts);
    expect(ranked.length).toBeGreaterThan(0);
    const reviewCounts = ranked.map((p) => p.reviewCount);
    const sorted = [...reviewCounts].sort((a, b) => b - a);
    expect(reviewCounts).toEqual(sorted);
  });

  it('never exceeds the cap regardless of catalog size', () => {
    const many = Array.from({ length: QUIZ_RESULTS_CAP + 10 }, (_, i) => product({ id: `p-${i}` }));
    const ranked = scoreQuiz([], questions, many);
    expect(ranked.length).toBe(QUIZ_RESULTS_CAP);
  });
});
