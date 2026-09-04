import type { QuizAnswer, QuizQuestion } from '@/lib/api/schemas/discovery';
import type { Product } from '@/lib/api/schemas/catalog';

export const QUIZ_RESULTS_CAP = 6;

/** The same tag vocabulary `content/quiz.ts` weights options against. */
function productTags(product: Product): string[] {
  return [`type:${product.type}`, `replacement:${product.replacement}`, ...product.badges.map((b) => `badge:${b}`)];
}

function accumulateWeights(answers: QuizAnswer[], questions: QuizQuestion[]): Record<string, number> {
  const weights: Record<string, number> = {};
  for (const answer of answers) {
    const option = questions
      .find((q) => q.id === answer.questionId)
      ?.options.find((o) => o.id === answer.optionId);
    if (!option) continue;
    for (const [tag, weight] of Object.entries(option.tags)) {
      weights[tag] = (weights[tag] ?? 0) + weight;
    }
  }
  return weights;
}

/**
 * Sums the tag weights of each chosen option, then scores every product by
 * matching its own derived tags (type/replacement/badges) against those
 * weights. Pure and I/O-free — takes `products` as a parameter rather than
 * importing the catalog, so it's testable against a small fixture list.
 *
 * An empty `answers[]` yields all-zero scores, which degrades to a
 * deterministic reviewCount-descending order rather than an arbitrary or
 * empty result — the results screen is never blank.
 */
export function scoreQuiz(answers: QuizAnswer[], questions: QuizQuestion[], products: Product[]): Product[] {
  const weights = accumulateWeights(answers, questions);
  return [...products]
    .map((product) => ({
      product,
      score: productTags(product).reduce((sum, tag) => sum + (weights[tag] ?? 0), 0),
    }))
    .sort((a, b) => b.score - a.score || b.product.reviewCount - a.product.reviewCount)
    .slice(0, QUIZ_RESULTS_CAP)
    .map((r) => r.product);
}
