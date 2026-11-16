import type { QuizAnswer, QuizQuestion } from '@/lib/api/schemas/discovery';
import type { Product } from '@/lib/api/schemas/catalog';

import { MATERIAL_VALUES } from './lens-facets';

/** A lens is a Quiz Match when it scores at least this share of the best score (CONTEXT.md "Quiz Match"). */
export const QUIZ_MATCH_SHARE = 0.6;

/** Tag kinds a lens states exactly one of, so the answers can only earn the best weight among them. */
const SINGLE_VALUED = new Set(['productLine', 'replacement', 'material']);

/** The same tag vocabulary `content/quiz.ts` weights options against. */
function productTags(product: Product): string[] {
  const material = MATERIAL_VALUES.find((m) => m.material === product.specs.material)?.id;
  return [
    `productLine:${product.productLine}`,
    `replacement:${product.replacement}`,
    ...product.badges.map((b) => `badge:${b}`),
    ...(product.makeupStyles ?? []).map((m) => `makeupStyle:${m}`),
    ...(product.occasions ?? []).map((o) => `occasion:${o}`),
    ...(material ? [`material:${material}`] : []),
  ];
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
 * Sums the tag weights of each chosen option, scores every product by matching its own
 * derived tags against those weights, and keeps the Quiz Matches, best first. Pure and
 * I/O-free — takes `products` as a parameter rather than importing the catalog, so it's
 * testable against a small fixture list.
 *
 * The cutoff is relative, so the best lens always matches. An empty `answers[]` scores
 * everything zero, which matches every lens in reviewCount order — never a blank screen.
 *
 * `bestPercent` is the best score against the most those answers could give one lens.
 */
export function quizMatches(
  answers: QuizAnswer[], questions: QuizQuestion[], products: Product[],
): { matches: { product: Product; score: number }[]; bestPercent: number } {
  const weights = accumulateWeights(answers, questions);
  const scored = products
    .map((product) => ({
      product,
      score: productTags(product).reduce((sum, tag) => sum + (weights[tag] ?? 0), 0),
    }))
    .sort((a, b) => b.score - a.score || b.product.reviewCount - a.product.reviewCount);
  const best = scored[0]?.score ?? 0;

  const byKind: Record<string, number> = {};
  for (const [tag, weight] of Object.entries(weights)) {
    const kind = tag.split(':')[0];
    byKind[kind] = SINGLE_VALUED.has(kind) ? Math.max(byKind[kind] ?? 0, weight) : (byKind[kind] ?? 0) + weight;
  }
  const most = Object.values(byKind).reduce((sum, w) => sum + w, 0);

  return {
    matches: scored.filter((s) => s.score >= best * QUIZ_MATCH_SHARE),
    bestPercent: most > 0 ? Math.round((best / most) * 100) : 0,
  };
}

/** The Quiz Matches as products, best first. */
export function scoreQuiz(answers: QuizAnswer[], questions: QuizQuestion[], products: Product[]): Product[] {
  return quizMatches(answers, questions, products).matches.map((m) => m.product);
}

/** The answers a `quiz=` list of option ids stands for: at most one per question, unknown ids ignored. */
export function answersFromOptionIds(optionIds: string[], questions: QuizQuestion[]): QuizAnswer[] {
  return questions.flatMap((q) => {
    const option = q.options.find((o) => optionIds.includes(o.id));
    return option ? [{ questionId: q.id, optionId: option.id }] : [];
  });
}
