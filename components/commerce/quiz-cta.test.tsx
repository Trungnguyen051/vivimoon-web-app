import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QuizCta } from './quiz-cta';
import { en } from '@/lib/i18n/dictionaries/en';
import { vi as viDict } from '@/lib/i18n/dictionaries/vi';
import { quiz } from '@/content/quiz';
import { toIntlLocale } from '@/lib/utils/format';
import type { Locale } from '@/lib/i18n/config';

const steps = [
  { id: 'experience', prompt: 'Bạn đã từng đeo lens chưa?', options: ['Chưa bao giờ', 'Vài lần', 'Thường xuyên'] },
  { id: 'look', prompt: 'Bạn muốn look như thế nào?', options: ['Tự nhiên', 'Mắt to', 'Sắc sảo'] },
  { id: 'duration', prompt: 'Đeo lens bao lâu mỗi lần?', options: ['Cả ngày', '4–6 tiếng', 'Dịp đặc biệt'] },
];

describe('QuizCta', () => {
  it('previews all three steps with their options and opens the Quiz', () => {
    render(
      <QuizCta
        eyebrow="TÌM LENS HỢP VỚI BẠN"
        title="Chưa biết chọn lens nào?"
        subtitle="Trả lời vài câu hỏi nhanh"
        socialProof="12.400 người đã tìm được lens hợp mắt"
        ctaLabel="Làm quiz 30 giây"
        href="/vi/quiz"
        steps={steps}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Chưa biết chọn lens nào?' })).toBeInTheDocument();
    expect(screen.getByText('TÌM LENS HỢP VỚI BẠN')).toBeInTheDocument();
    expect(screen.getByText('12.400 người đã tìm được lens hợp mắt')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Làm quiz 30 giây' })).toHaveAttribute('href', '/vi/quiz');

    for (const step of steps) {
      expect(screen.getByText(step.prompt)).toBeInTheDocument();
      for (const option of step.options) expect(screen.getByText(option)).toBeInTheDocument();
    }
  });

  /**
   * The social-proof sentence is assembled: the count comes from the page, the words and
   * their order from the dictionary. Nothing caught the join before — dropping the count
   * would have rendered the bare fragment "người đã tìm được lens hợp mắt" with a green
   * suite — and a locale's digit grouping is exactly the kind of thing a literal got wrong.
   */
  it.each([['en', en, '12,400'], ['vi', viDict, '12.400']])('%s states the match count in its own number format', (locale, dict, grouped) => {
    const sentence = dict.home.quiz.socialProof.replace('{count}', new Intl.NumberFormat(toIntlLocale(locale as Locale)).format(12_400));

    expect(dict.home.quiz.socialProof).toContain('{count}');
    expect(sentence).toContain(grouped);
    expect(sentence).not.toContain('{count}');
  });

  /**
   * The design's body copy promises three questions; the Quiz asks six, and none
   * of the three previewed questions is among them (#35). The cards are a
   * presentational preview and ship as designed, but a shopper reads the teaser
   * seconds before the Quiz contradicts it — so the teaser states no count at
   * all. Should anyone state one later, in digits or words, it has to be the real
   * one, and the Quiz's question set is provisional (content/quiz.ts), so this
   * reads the count rather than hard-coding it.
   */
  const NUMERALS: Record<string, number> = {
    one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
    một: 1, hai: 2, ba: 3, bốn: 4, năm: 5, sáu: 6, bảy: 7, tám: 8, chín: 9, mười: 10,
  };

  /** Every count this copy pins on the Quiz: a numeral within three words of "questions" / "câu hỏi" is counting them. */
  function claimedCounts(claim: string): number[] {
    const words = claim.toLowerCase().match(/[\p{L}\d]+/gu) ?? [];

    return words.flatMap((word, i) => {
      const noun = /^questions?$/.test(word) ? i : word === 'hỏi' && words[i - 1] === 'câu' ? i - 1 : -1;
      if (noun < 0) return [];

      return words
        .slice(Math.max(0, noun - 3), noun)
        .map((w) => (/^\d+$/.test(w) ? Number(w) : NUMERALS[w]))
        .filter((n) => n !== undefined);
    });
  }

  it.each([['en', en], ['vi', viDict]])('%s teaser claims no question count the Quiz contradicts', (_locale, dict) => {
    const claims = [dict.home.quiz.eyebrow, dict.home.quiz.title, dict.home.quiz.subtitle, dict.home.quiz.cta, dict.home.quiz.socialProof];

    for (const claim of claims) {
      expect(claim.trim()).not.toBe('');
      for (const count of claimedCounts(claim)) expect(count).toBe(quiz.questions.length);
    }
  });
});
