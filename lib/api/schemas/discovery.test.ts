import { describe, it, expect } from 'vitest';
import { quizDefinitionSchema, quizSubmitRequestSchema } from './discovery';

const validDefinition = {
  questions: [
    {
      id: 'q1',
      prompt: 'Look?',
      options: [
        { id: 'q1-a', label: 'Colored', tags: { 'type:colored': 2 } },
        { id: 'q1-b', label: 'Clear', tags: { 'type:clear': 2 } },
      ],
    },
  ],
};

describe('quizDefinitionSchema', () => {
  it('accepts a valid definition', () => {
    expect(quizDefinitionSchema.parse(validDefinition).questions).toHaveLength(1);
  });

  it('rejects a question with fewer than 2 options', () => {
    const bad = { questions: [{ ...validDefinition.questions[0], options: [validDefinition.questions[0].options[0]] }] };
    expect(() => quizDefinitionSchema.parse(bad)).toThrow();
  });

  it('accepts an arbitrary string-keyed tag record', () => {
    const withExtra = {
      questions: [
        {
          id: 'q1',
          prompt: 'p',
          options: [
            { id: 'a', label: 'A', tags: { 'badge:new': 1, 'replacement:daily': 3 } },
            { id: 'b', label: 'B', tags: {} },
          ],
        },
      ],
    };
    expect(quizDefinitionSchema.parse(withExtra)).toBeTruthy();
  });
});

describe('quizSubmitRequestSchema', () => {
  it('rejects an empty answers array', () => {
    expect(() => quizSubmitRequestSchema.parse({ answers: [] })).toThrow();
  });

  it('accepts a list of question/option id pairs', () => {
    const parsed = quizSubmitRequestSchema.parse({ answers: [{ questionId: 'q1', optionId: 'q1-a' }] });
    expect(parsed.answers).toHaveLength(1);
  });
});
