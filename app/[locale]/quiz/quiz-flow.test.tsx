import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuizFlow } from './quiz-flow';
import { apiRequest } from '@/lib/api/client';
import { en } from '@/lib/i18n/dictionaries/en';
import { vi as viDict } from '@/lib/i18n/dictionaries/vi';
import type { QuizDefinition } from '@/lib/api/schemas/discovery';

const push = vi.fn();
vi.mock('@/lib/api/client', () => ({ apiRequest: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }), usePathname: () => '/en/quiz' }));
const mockedApiRequest = vi.mocked(apiRequest);

const definition: QuizDefinition = {
  questions: [
    {
      id: 'q1',
      prompt: { en: 'First question?', vi: 'Câu hỏi thứ nhất?' },
      options: [
        { id: 'q1-a', label: { en: 'Option A', vi: 'Lựa chọn A' }, tags: { 'productLine:coMau': 2 } },
        { id: 'q1-b', label: { en: 'Option B', vi: 'Lựa chọn B' }, tags: { 'productLine:trongSuot': 2 } },
      ],
    },
    {
      id: 'q2',
      prompt: { en: 'Second question?', vi: 'Câu hỏi thứ hai?' },
      options: [
        { id: 'q2-a', label: { en: 'Option C', vi: 'Lựa chọn C' }, tags: { 'replacement:daily': 2 } },
        { id: 'q2-b', label: { en: 'Option D', vi: 'Lựa chọn D' }, tags: { 'replacement:monthly': 2 } },
      ],
    },
  ],
};

/** The submit endpoint answering with `n` matches; only their number is read. */
const matches = (n: number) => ({ ok: true as const, data: { recommendations: Array.from({ length: n }, () => ({})) } });

beforeEach(() => {
  push.mockClear();
  mockedApiRequest.mockReset();
  mockedApiRequest.mockResolvedValue(matches(2) as never);
  localStorage.clear();
});

async function answerBoth(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('radio', { name: 'Option A' }));
  await user.click(screen.getByRole('button', { name: en.quiz.next }));
  await user.click(screen.getByRole('radio', { name: 'Option C' }));
}

describe('QuizFlow', () => {
  it('blocks advancing to the next question until the current one is answered', async () => {
    const user = userEvent.setup();
    render(<QuizFlow definition={definition} locale="en" dict={en} />);
    const nextButton = screen.getByRole('button', { name: en.quiz.next });
    expect(nextButton).toBeDisabled();
    await user.click(screen.getByRole('radio', { name: 'Option A' }));
    expect(nextButton).toBeEnabled();
  });

  it('advances the progress indicator on next and keeps the prior answer selected on back', async () => {
    const user = userEvent.setup();
    render(<QuizFlow definition={definition} locale="en" dict={en} />);
    expect(screen.getByText('Step 1/2')).toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: 'Option A' }));
    await user.click(screen.getByRole('button', { name: en.quiz.next }));
    expect(screen.getByText('Step 2/2')).toBeInTheDocument();
    expect(screen.getByText('Second question?')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: en.quiz.back }));
    expect(screen.getByText('Step 1/2')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Option A' })).toHaveAttribute('aria-checked', 'true');
  });

  it('scores the answers once the last one is picked, and the button states the match count (#247)', async () => {
    const user = userEvent.setup();
    render(<QuizFlow definition={definition} locale="en" dict={en} />);

    await user.click(screen.getByRole('radio', { name: 'Option A' }));
    await user.click(screen.getByRole('button', { name: en.quiz.next }));
    expect(mockedApiRequest).not.toHaveBeenCalled();
    await user.click(screen.getByRole('radio', { name: 'Option C' }));

    expect(await screen.findByRole('button', { name: 'See 2 lenses that suit you' })).toBeInTheDocument();
    expect(mockedApiRequest).toHaveBeenCalledWith('/api/quiz/submit', {
      method: 'POST',
      body: { answers: [{ questionId: 'q1', optionId: 'q1-a' }, { questionId: 'q2', optionId: 'q2-a' }] },
    });
  });

  it('finishing opens the matches as a listing, with the answers in the address (#248)', async () => {
    const user = userEvent.setup();
    render(<QuizFlow definition={definition} locale="vi" dict={viDict} />);

    await user.click(screen.getByRole('radio', { name: 'Lựa chọn A' }));
    await user.click(screen.getByRole('button', { name: viDict.quiz.next }));
    await user.click(screen.getByRole('radio', { name: 'Lựa chọn D' }));
    await user.click(await screen.findByRole('button', { name: 'Xem 2 mẫu lens hợp với bạn' }));

    expect(push).toHaveBeenCalledWith('/vi/collection/all-lenses?quiz=q1-a,q2-b');
  });

  it('still opens the results when the count never arrives', async () => {
    mockedApiRequest.mockResolvedValue({ ok: false, error: { code: 'internal', message: 'boom' } } as never);
    const user = userEvent.setup();
    render(<QuizFlow definition={definition} locale="en" dict={en} />);
    await answerBoth(user);

    await user.click(screen.getByRole('button', { name: en.quiz.submit }));
    expect(push).toHaveBeenCalledWith('/en/collection/all-lenses?quiz=q1-a,q2-a');
  });

  it('remembers the answers on this device, so the PLP card can offer the matches again', async () => {
    const user = userEvent.setup();
    render(<QuizFlow definition={definition} locale="en" dict={en} />);
    await answerBoth(user);
    expect(localStorage.getItem('vivimoon:quiz-answers')).toBeNull();

    await user.click(await screen.findByRole('button', { name: /See 2 lenses/ }));
    expect(localStorage.getItem('vivimoon:quiz-answers')).toBe('q1-a,q2-a');
  });

  it('"Sửa câu trả lời" reopens on the last step with the answers picked (#248)', async () => {
    const user = userEvent.setup();
    render(<QuizFlow definition={definition} locale="en" dict={en} initialAnswers={['q1-b', 'q2-a', 'junk']} />);

    expect(screen.getByText('Step 2/2')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Option C' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByText(en.quiz.recap)).toHaveTextContent('Option B');

    await user.click(screen.getByRole('button', { name: en.quiz.back }));
    expect(screen.getByRole('radio', { name: 'Option B' })).toHaveAttribute('aria-checked', 'true');
  });

  it('starts at question 1 with nothing picked when the given answers are incomplete', () => {
    render(<QuizFlow definition={definition} locale="en" dict={en} initialAnswers={['q2-a']} />);
    expect(screen.getByText('Step 1/2')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Option A' })).toHaveAttribute('aria-checked', 'false');
  });

  it('asks in the locale it is rendered in', () => {
    render(<QuizFlow definition={definition} locale="vi" dict={viDict} />);
    expect(screen.getByRole('heading', { name: 'Câu hỏi thứ nhất?' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Lựa chọn A' })).toBeInTheDocument();
    expect(screen.queryByText('First question?')).not.toBeInTheDocument();
  });

  it('recaps the earlier answers and offers ways out on every step (#247)', async () => {
    const user = userEvent.setup();
    render(<QuizFlow definition={definition} locale="vi" dict={viDict} />);
    expect(screen.queryByText(viDict.quiz.recap)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: viDict.quiz.exit })).toHaveAttribute('href', '/vi');
    expect(screen.getByRole('link', { name: viDict.quiz.skip })).toHaveAttribute('href', '/vi/collection/all-lenses?from=quiz');

    await user.click(screen.getByRole('radio', { name: 'Lựa chọn A' }));
    await user.click(screen.getByRole('button', { name: viDict.quiz.next }));
    expect(screen.getByText(viDict.quiz.recap)).toHaveTextContent('Lựa chọn A');
  });
  it('shows each option’s sub-label and the question’s helper line, without changing what an option is called (#263)', () => {
    const described: QuizDefinition = {
      questions: [{
        ...definition.questions[0],
        helper: { en: 'Used to pick your line', vi: 'Dùng để chọn dòng lens' },
        options: [
          { ...definition.questions[0].options[0], sublabel: { en: 'School or work', vi: 'Đi học, đi làm' } },
          definition.questions[0].options[1],
        ],
      }],
    };
    render(<QuizFlow definition={described} locale="vi" dict={viDict} />);

    expect(screen.getByText('Dùng để chọn dòng lens')).toBeInTheDocument();
    const option = screen.getByRole('radio', { name: 'Lựa chọn A' });
    expect(option).toHaveAccessibleDescription('Đi học, đi làm');
    expect(screen.getByRole('radio', { name: 'Lựa chọn B' })).not.toHaveAccessibleDescription();
  });
});
