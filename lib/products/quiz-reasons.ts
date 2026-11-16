import type { Product } from '@/lib/api/schemas/catalog';
import type { QuizAnswer } from '@/lib/api/schemas/discovery';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { lineLabel } from './plp-card';

/**
 * Why a lens suits a set of Quiz answers (#249): one line per answer, built from the
 * lens's own specs. Each option's sentence lives in the dictionary (`quiz.reasons`) and
 * names the spec it speaks about as a `{placeholder}`, so no reason is authored per lens.
 * A reason whose spec the lens doesn't state is dropped rather than printed with a gap.
 */
export function quizReasons(product: Product, answers: QuizAnswer[], dict: Dictionary): string[] {
  const { specs } = product;
  const dia = specs.graphicDiameter ? `GDIA ${specs.graphicDiameter}` : specs.diameter ? `DIA ${specs.diameter}` : undefined;
  const values: Record<string, string | undefined> = {
    line: lineLabel(product, dict),
    material: specs.material,
    dia,
    water: specs.waterContent,
    replacement: dict.filters.replacements[product.replacement],
  };
  const templates: Record<string, string | undefined> = dict.quiz.reasons;

  return answers.flatMap(({ optionId }) => {
    const template = templates[optionId];
    if (!template) return [];
    let complete = true;
    const reason = template.replace(/\{(\w+)\}/g, (_, key: string) => {
      if (!values[key]) complete = false;
      return values[key] ?? '';
    });
    return complete ? [reason] : [];
  });
}
