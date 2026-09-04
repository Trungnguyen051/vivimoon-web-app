import { describe, it, expect } from 'vitest';
import { mockDiscovery, DiscoveryError } from './mock';
import { products } from '@/content/mock';
import { quiz } from '@/content/quiz';
import { eyeEnlargementBand } from '@/lib/products/eye-enlargement';

describe('mockDiscovery.compare', () => {
  it('returns rows in the order the ids were given, not catalog order', () => {
    const [a, b] = products;
    const result = mockDiscovery.compare([b.id, a.id]);
    return result.then((matrix) => {
      expect(matrix.products.map((p) => p.id)).toEqual([b.id, a.id]);
    });
  });

  it("bands eyeEnlargement per each product's own diameter", async () => {
    const product = products[0];
    const matrix = await mockDiscovery.compare([product.id]);
    expect(matrix.products[0].eyeEnlargement).toBe(eyeEnlargementBand(product.specs.diameter));
  });

  it('silently drops an id that is not in the catalog', async () => {
    const product = products[0];
    const matrix = await mockDiscovery.compare([product.id, 'not-a-real-id']);
    expect(matrix.products).toHaveLength(1);
    expect(matrix.products[0].id).toBe(product.id);
  });

  it('maps lifespan to the replacement schedule and price/currency to the cheapest variant', async () => {
    const product = products[0];
    const cheapest = product.variants.reduce((min, v) => (v.price < min.price ? v : min), product.variants[0]);
    const matrix = await mockDiscovery.compare([product.id]);
    expect(matrix.products[0].lifespan).toBe(product.replacement);
    expect(matrix.products[0].price).toBe(cheapest.price);
    expect(matrix.products[0].currency).toBe(cheapest.currency);
  });
});

describe('mockDiscovery.getQuizDefinition', () => {
  it('returns content/quiz.ts as-is', async () => {
    const definition = await mockDiscovery.getQuizDefinition();
    expect(definition).toEqual(quiz);
  });
});

describe('mockDiscovery.submitQuiz', () => {
  it('scores real question/option answers against the real catalog', async () => {
    const q = quiz.questions[0];
    const recommendations = await mockDiscovery.submitQuiz([
      { questionId: q.id, optionId: q.options[0].id },
    ]);
    expect(recommendations.length).toBeGreaterThan(0);
  });

  it('rejects an answer referencing an unknown question id', async () => {
    await expect(
      mockDiscovery.submitQuiz([{ questionId: 'not-a-question', optionId: 'not-an-option' }]),
    ).rejects.toBeInstanceOf(DiscoveryError);
  });

  it('rejects an answer referencing an unknown option id on a real question', async () => {
    const q = quiz.questions[0];
    await expect(
      mockDiscovery.submitQuiz([{ questionId: q.id, optionId: 'not-an-option' }]),
    ).rejects.toBeInstanceOf(DiscoveryError);
  });

  it('rejects two answers for the same question rather than double-counting its weight', async () => {
    const q = quiz.questions[0];
    await expect(
      mockDiscovery.submitQuiz([
        { questionId: q.id, optionId: q.options[0].id },
        { questionId: q.id, optionId: q.options[1].id },
      ]),
    ).rejects.toBeInstanceOf(DiscoveryError);
  });
});
