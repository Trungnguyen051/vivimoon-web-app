import { z } from 'zod';
import { productSchema } from './catalog';

// Quiz (spec §4, §11). Lands under `discovery` per spec §5's Group C, same
// split as the comparison matrix: schemas here, resource key `discovery`.
export const quizOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
  // Tag weights drawn from real product fields (type/replacement/badges) —
  // e.g. "type:colored": 2. Keys are free-form so content stays a data edit.
  tags: z.record(z.string(), z.number()),
});

export const quizQuestionSchema = z.object({
  id: z.string(),
  prompt: z.string(),
  options: z.array(quizOptionSchema).min(2),
});

export const quizDefinitionSchema = z.object({
  questions: z.array(quizQuestionSchema).min(1),
});

export const quizAnswerSchema = z.object({
  questionId: z.string(),
  optionId: z.string(),
});

export const quizSubmitRequestSchema = z.object({
  answers: z.array(quizAnswerSchema).min(1),
});

export const quizSubmitResponseSchema = z.object({
  recommendations: z.array(productSchema),
});

export type QuizOption = z.infer<typeof quizOptionSchema>;
export type QuizQuestion = z.infer<typeof quizQuestionSchema>;
export type QuizDefinition = z.infer<typeof quizDefinitionSchema>;
export type QuizAnswer = z.infer<typeof quizAnswerSchema>;
export type QuizSubmitRequest = z.infer<typeof quizSubmitRequestSchema>;
export type QuizSubmitResponse = z.infer<typeof quizSubmitResponseSchema>;
