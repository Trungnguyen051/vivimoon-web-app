import { describe, it, expect } from 'vitest';
import type { Product } from '@/lib/api/schemas/catalog';
import { vi } from '@/lib/i18n/dictionaries/vi';
import { en } from '@/lib/i18n/dictionaries/en';
import { quiz } from '@/content/quiz';
import { quizReasons } from './quiz-reasons';

const lens = {
  replacement: 'monthly',
  specs: { material: 'Hydrogel', waterContent: '45%', baseCurve: '8.6mm', diameter: '14.2mm', graphicDiameter: '13.3mm', origin: '' },
} as Product;
const answers = [
  { questionId: 'experience', optionId: 'experience-never' },
  { questionId: 'look', optionId: 'look-natural' },
  { questionId: 'duration', optionId: 'duration-allDay' },
];

describe('quizReasons (#249)', () => {
  it('gives one reason per answer, filled from the lens’s specs', () => {
    expect(quizReasons(lens, answers, vi)).toEqual([
      'Dòng Khoá ẩm – êm, dễ đeo cho người mới',
      'GDIA 13.3mm – giãn nhẹ, tự nhiên',
      'Nước 45% – đeo êm cả ngày',
    ]);
  });

  it('follows the answers', () => {
    const other = [answers[0], { questionId: 'look', optionId: 'look-western' }, { questionId: 'duration', optionId: 'duration-hours' }];
    expect(quizReasons(lens, other, vi).slice(1)).toEqual(['GDIA 13.3mm – rõ nét, chuẩn look Tây', 'Thay 1 tháng – hợp đeo 4–6 tiếng mỗi lần']);
  });

  it('falls back to the lens diameter when it states no graphic diameter', () => {
    const clear = { ...lens, specs: { ...lens.specs, graphicDiameter: undefined } } as Product;
    expect(quizReasons(clear, [answers[1]], vi)).toEqual(['DIA 14.2mm – giãn nhẹ, tự nhiên']);
  });

  it('drops a reason whose spec the lens does not state, rather than printing a gap', () => {
    const bare = { ...lens, specs: { ...lens.specs, material: 'Unknown', waterContent: '' } } as Product;
    expect(quizReasons(bare, answers, vi)).toEqual(['GDIA 13.3mm – giãn nhẹ, tự nhiên']);
  });

  it('every Quiz option has a reason in both locales', () => {
    const ids = quiz.questions.flatMap((q) => q.options.map((o) => o.id)).sort();
    expect(Object.keys(vi.quiz.reasons).sort()).toEqual(ids);
    expect(Object.keys(en.quiz.reasons).sort()).toEqual(ids);
  });
});
