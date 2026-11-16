import { describe, it, expect } from 'vitest';
import { quizMatches, scoreQuiz } from './quiz-scoring';
import type { QuizQuestion } from '@/lib/api/schemas/discovery';
import type { Product } from '@/lib/api/schemas/catalog';

function product(overrides: Partial<Product> & Pick<Product, 'id'>): Product {
  return {
    slug: overrides.id,
    name: overrides.id,
    brandId: 'vivimoon',
    brandName: 'Vivimoon',
    productLine: 'trongSuot',
    replacement: 'daily',
    description: 'd',
    images: ['/a.jpg'],
    badges: [],
    specs: {
      material: 'Hydrogel', waterContent: '50%', baseCurve: '8.6mm',
      diameter: '14.2mm', origin: 'M',
    },
    requiresRx: true,
    variants: [{ id: `${overrides.id}-v1`, sku: 'S', price: 50_000, currency: 'VND', stock: 1 }],
    rating: 4.5,
    reviewCount: 0,
    ...overrides,
  };
}

const questions: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: { vi: 'Look?', en: 'Look?' },
    options: [
      { id: 'q1-colored', label: { vi: 'Colored', en: 'Colored' }, tags: { 'productLine:coMau': 2 } },
      { id: 'q1-clear', label: { vi: 'Clear', en: 'Clear' }, tags: { 'productLine:trongSuot': 2 } },
    ],
  },
];

const colored1 = product({ id: 'colored-1', productLine: 'coMau', reviewCount: 5 });
const colored2 = product({ id: 'colored-2', productLine: 'coMau', reviewCount: 1 });
const clear1 = product({ id: 'clear-1', productLine: 'trongSuot', reviewCount: 5 });
const clear2 = product({ id: 'clear-2', productLine: 'trongSuot', reviewCount: 1 });
const fixtureProducts = [clear1, clear2, colored1, colored2];

describe('scoreQuiz', () => {
  it('ranks the lenses the answers weight first', () => {
    const ranked = scoreQuiz([{ questionId: 'q1', optionId: 'q1-colored' }], questions, fixtureProducts);
    expect(ranked.map((p) => p.id)).toEqual([colored1.id, colored2.id]);
  });

  it('degrades to a deterministic default ordering (by reviewCount) when answers is empty', () => {
    const ranked = scoreQuiz([], questions, fixtureProducts);
    expect(ranked).toHaveLength(fixtureProducts.length);
    const reviewCounts = ranked.map((p) => p.reviewCount);
    expect(reviewCounts).toEqual([...reviewCounts].sort((a, b) => b - a));
  });

  it('has no fixed cap: every lens that matches is returned', () => {
    const many = Array.from({ length: 30 }, (_, i) => product({ id: `p-${i}`, productLine: 'coMau' }));
    expect(scoreQuiz([{ questionId: 'q1', optionId: 'q1-colored' }], questions, many)).toHaveLength(30);
  });
});

describe('quizMatches (#247)', () => {
  const two: QuizQuestion[] = [
    ...questions,
    {
      id: 'q2',
      prompt: { vi: 'Wear?', en: 'Wear?' },
      options: [
        { id: 'q2-daily', label: { vi: 'Daily', en: 'Daily' }, tags: { 'replacement:daily': 2, 'replacement:monthly': 1 } },
        { id: 'q2-soft', label: { vi: 'Soft', en: 'Soft' }, tags: { 'material:moisture': 3, 'makeupStyle:natural': 1 } },
      ],
    },
  ];
  const both = product({ id: 'both', productLine: 'coMau', replacement: 'daily' });
  const mostly = product({ id: 'mostly', productLine: 'coMau', replacement: 'monthly' });
  const half = product({ id: 'half', productLine: 'trongSuot', replacement: 'daily' });
  const none = product({ id: 'none', productLine: 'trongSuot', replacement: 'sixMonth' });
  const answers = [{ questionId: 'q1', optionId: 'q1-colored' }, { questionId: 'q2', optionId: 'q2-daily' }];

  it('a match is any lens within a share of the best score, best first', () => {
    const { matches } = quizMatches(answers, two, [none, half, mostly, both]);
    // both 4, mostly 3, half 2 (below 60% of 4), none 0.
    expect(matches.map((m) => [m.product.id, m.score])).toEqual([['both', 4], ['mostly', 3]]);
  });

  it('always matches at least the best lens, whatever the answers', () => {
    const { matches } = quizMatches(answers, two, [none]);
    expect(matches.map((m) => m.product.id)).toEqual(['none']);
  });

  it('gives the best match as a percentage of the most those answers could score', () => {
    // A lens has one replacement, so the most is 2 (colored) + 2 (daily), not 2 + 2 + 1.
    expect(quizMatches(answers, two, [both, mostly]).bestPercent).toBe(100);
    expect(quizMatches(answers, two, [mostly, half]).bestPercent).toBe(75);
    expect(quizMatches([], two, [both]).bestPercent).toBe(0);
  });

  it('scores the material line and makeup style a lens states', () => {
    const soft = product({ id: 'soft', makeupStyles: ['natural'] }); // Hydrogel = the moisture line
    const hard = product({ id: 'hard', specs: { ...soft.specs, material: 'Silicone Hydrogel' } });
    const { matches, bestPercent } = quizMatches([{ questionId: 'q2', optionId: 'q2-soft' }], two, [hard, soft]);
    expect(matches.map((m) => [m.product.id, m.score])).toEqual([['soft', 4]]);
    expect(bestPercent).toBe(100);
  });
});
