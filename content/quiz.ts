import type { QuizDefinition } from '@/lib/api/schemas/discovery';

/**
 * PROVISIONAL — real question set and tag weights pending Vivimoon (spec
 * §11). Owner: Vivimoon. Six placeholder questions, tag weights drawn from
 * real product fields (`type`/`replacement`/`badges` — see
 * `lib/products/quiz-scoring.ts`) so scoring against the real catalog is
 * meaningful even with placeholder copy. Replacing the questions or
 * re-tuning weights later is a data edit in this one file.
 */
export const quiz: QuizDefinition = {
  questions: [
    {
      id: 'lifestyle',
      prompt: 'How active is your day-to-day?',
      options: [
        { id: 'lifestyle-onthego', label: 'Always on the go — fresh lenses every day', tags: { 'replacement:daily': 2 } },
        { id: 'lifestyle-routine', label: 'Steady routine — biweekly works fine', tags: { 'replacement:biweekly': 2 } },
        { id: 'lifestyle-lowkey', label: 'Low maintenance — monthly is easiest', tags: { 'replacement:monthly': 2 } },
      ],
    },
    {
      id: 'look',
      prompt: 'What look are you going for?',
      options: [
        { id: 'look-natural', label: 'Natural, barely-there clarity', tags: { 'type:clear': 2 } },
        { id: 'look-color', label: 'A noticeable color change', tags: { 'type:colored': 2 } },
      ],
    },
    {
      id: 'discovery',
      prompt: 'How do you like to shop?',
      options: [
        { id: 'discovery-new', label: 'I love trying the newest releases', tags: { 'badge:new': 2 } },
        { id: 'discovery-proven', label: 'I stick to proven bestsellers', tags: { 'badge:bestseller': 2 } },
      ],
    },
    {
      id: 'budget',
      prompt: 'What matters most on price?',
      options: [
        { id: 'budget-deal', label: 'Getting the best deal', tags: { 'badge:sale': 2 } },
        { id: 'budget-noPref', label: "Price isn't my main concern", tags: {} },
      ],
    },
    {
      id: 'wear',
      prompt: 'How long do you usually wear lenses per day?',
      options: [
        { id: 'wear-short', label: 'A few hours here and there', tags: { 'replacement:daily': 1 } },
        { id: 'wear-allday', label: 'All day, every day', tags: { 'replacement:monthly': 1, 'type:clear': 1 } },
      ],
    },
    {
      id: 'occasion',
      prompt: "What's the occasion?",
      options: [
        { id: 'occasion-everyday', label: 'Everyday wear', tags: { 'type:clear': 1, 'replacement:daily': 1 } },
        { id: 'occasion-special', label: 'A special look for photos or events', tags: { 'type:colored': 1, 'badge:new': 1 } },
      ],
    },
  ],
};
