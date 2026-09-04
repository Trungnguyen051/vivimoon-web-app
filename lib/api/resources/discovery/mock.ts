import { catalog } from '@/lib/api/resources/catalog';
import { eyeEnlargementBand } from '@/lib/products/eye-enlargement';
import { scoreQuiz } from '@/lib/products/quiz-scoring';
import { quiz } from '@/content/quiz';
import type { ComparisonMatrix, ComparisonRow, Product } from '@/lib/api/schemas/catalog';
import type { QuizAnswer, QuizDefinition } from '@/lib/api/schemas/discovery';

/** Thrown by `submitQuiz` for an answer referencing an unknown question/option
 *  id — a client bug, unlike a stale compare id, which is expected and
 *  degrades silently instead. Route handlers map this to `validation_failed`. */
export class DiscoveryError extends Error {
  constructor(message: string, readonly code: 'validation_failed' = 'validation_failed') {
    super(message);
    this.name = 'DiscoveryError';
  }
}

function cheapestVariant(product: Product) {
  return product.variants.reduce((min, v) => (v.price < min.price ? v : min), product.variants[0]);
}

function toComparisonRow(product: Product): ComparisonRow {
  const variant = cheapestVariant(product);
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    image: product.images[0],
    color: variant.color,
    colorLabel: variant.colorLabel,
    diameter: product.specs.diameter,
    eyeEnlargement: eyeEnlargementBand(product.specs.diameter),
    // "Lifespan" (spec §10) is the existing replacement schedule, relabeled.
    lifespan: product.replacement,
    price: variant.price,
    currency: variant.currency,
  };
}

export const mockDiscovery = {
  /**
   * `catalog.getProductsByIds` already preserves the caller's id order and
   * silently drops unknown ids — both properties this inherits for free, so
   * a stale compare-tray id (a product that left the catalog) degrades the
   * same way a stale Favorite does (spec §10, M3 precedent) rather than
   * erroring.
   */
  async compare(productIds: string[]): Promise<ComparisonMatrix> {
    const products = await catalog.getProductsByIds(productIds);
    return { products: products.map(toComparisonRow) };
  },

  async getQuizDefinition(): Promise<QuizDefinition> {
    return quiz;
  },

  /**
   * Validates every answer against the real question/option ids, and that no
   * question is answered twice, before scoring — unlike `compare`'s
   * silent-drop of a stale id, a bad quiz answer is a client bug and should
   * error (spec Task 7 Step 4). A duplicate questionId would otherwise let
   * `accumulateWeights` (quiz-scoring.ts) count that option's tag weights
   * twice, silently skewing the ranking.
   */
  async submitQuiz(answers: QuizAnswer[]): Promise<Product[]> {
    const seenQuestionIds = new Set<string>();
    for (const answer of answers) {
      if (seenQuestionIds.has(answer.questionId)) {
        throw new DiscoveryError(`Duplicate answer for question "${answer.questionId}"`);
      }
      seenQuestionIds.add(answer.questionId);
      const question = quiz.questions.find((q) => q.id === answer.questionId);
      const option = question?.options.find((o) => o.id === answer.optionId);
      if (!option) {
        throw new DiscoveryError(`Unknown question/option "${answer.questionId}/${answer.optionId}"`);
      }
    }
    const products = await catalog.listProducts();
    return scoreQuiz(answers, quiz.questions, products);
  },
};

export type Discovery = typeof mockDiscovery;
