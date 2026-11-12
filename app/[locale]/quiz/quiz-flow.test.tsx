import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuizFlow } from './quiz-flow';
import { apiRequest } from '@/lib/api/client';
import { en } from '@/lib/i18n/dictionaries/en';
import { vi as viDict } from '@/lib/i18n/dictionaries/vi';
import type { QuizDefinition } from '@/lib/api/schemas/discovery';
import type { Product } from '@/lib/types';

vi.mock('@/lib/api/client', () => ({ apiRequest: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }), usePathname: () => '/en/quiz' }));
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

function product(id: string): Product {
  return {
    id, slug: id, name: `Product ${id}`, brandId: 'vivimoon', brandName: 'Vivimoon',
    productLine: 'trongSuot', replacement: 'daily', description: 'd', images: ['/a.jpg'], badges: [],
    specs: { material: 'M', waterContent: '50%', baseCurve: '8.6mm', diameter: '14.2mm', origin: 'M' },
    requiresRx: true,
    variants: [{ id: `${id}-v1`, sku: 'S', price: 50_000, currency: 'VND', stock: 1 }],
    rating: 4.5, reviewCount: 0,
  };
}

beforeEach(() => {
  mockedApiRequest.mockReset();
  localStorage.clear();
});

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
    expect(screen.getByText('1 / 2')).toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: 'Option A' }));
    await user.click(screen.getByRole('button', { name: en.quiz.next }));
    expect(screen.getByText('2 / 2')).toBeInTheDocument();
    expect(screen.getByText('Second question?')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: en.quiz.back }));
    expect(screen.getByText('1 / 2')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Option A' })).toHaveAttribute('aria-checked', 'true');
  });

  it('submits on the last question and renders recommendations via the product grid', async () => {
    mockedApiRequest.mockResolvedValue({ ok: true, data: { recommendations: [product('rec-1'), product('rec-2')] } });
    const user = userEvent.setup();
    render(<QuizFlow definition={definition} locale="en" dict={en} />);

    await user.click(screen.getByRole('radio', { name: 'Option A' }));
    await user.click(screen.getByRole('button', { name: en.quiz.next }));
    await user.click(screen.getByRole('radio', { name: 'Option C' }));
    await user.click(screen.getByRole('button', { name: en.quiz.submit }));

    expect(mockedApiRequest).toHaveBeenCalledWith('/api/quiz/submit', {
      method: 'POST',
      body: { answers: [{ questionId: 'q1', optionId: 'q1-a' }, { questionId: 'q2', optionId: 'q2-a' }] },
    });
    expect(await screen.findByText('Product rec-1')).toBeInTheDocument();
    expect(screen.getByText('Product rec-2')).toBeInTheDocument();
  });

  it('saves the picks on this device, so the PLP card can offer them again', async () => {
    mockedApiRequest.mockResolvedValue({ ok: true, data: { recommendations: [product('rec-1'), product('rec-2')] } });
    const user = userEvent.setup();
    render(<QuizFlow definition={definition} locale="en" dict={en} />);

    await user.click(screen.getByRole('radio', { name: 'Option A' }));
    await user.click(screen.getByRole('button', { name: en.quiz.next }));
    await user.click(screen.getByRole('radio', { name: 'Option C' }));
    expect(localStorage.getItem('vivimoon:quiz-results')).toBeNull();
    await user.click(screen.getByRole('button', { name: en.quiz.submit }));

    await screen.findByText('Product rec-1');
    expect(localStorage.getItem('vivimoon:quiz-results')).toBe('rec-1,rec-2');
  });

  it('opens on the saved picks when revisited, and retaking starts at question 1', async () => {
    const user = userEvent.setup();
    render(<QuizFlow definition={definition} locale="vi" dict={viDict} savedResults={[product('rec-1')]} />);

    expect(screen.getByRole('heading', { name: viDict.quiz.resultsTitle })).toBeInTheDocument();
    expect(screen.getByText('Product rec-1')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: viDict.quiz.retake }));
    expect(screen.getByText('Câu hỏi thứ nhất?')).toBeInTheDocument();
  });

  it('starts a fresh quiz when none of the saved picks still exist', () => {
    render(<QuizFlow definition={definition} locale="en" dict={en} savedResults={[]} />);
    expect(screen.getByText('First question?')).toBeInTheDocument();
  });

  it('links from the results to every lens, marked as coming from the quiz', () => {
    render(<QuizFlow definition={definition} locale="vi" dict={viDict} savedResults={[product('rec-1')]} />);
    expect(screen.getByRole('link', { name: 'Xem tất cả mẫu lens' }))
      .toHaveAttribute('href', '/vi/collection/all-lenses?from=quiz');
  });

  it('a rapid double-click on submit fires only one request, not two', async () => {
    mockedApiRequest.mockResolvedValue({ ok: true, data: { recommendations: [product('rec-1')] } });
    const user = userEvent.setup();
    render(<QuizFlow definition={definition} locale="en" dict={en} />);

    await user.click(screen.getByRole('radio', { name: 'Option A' }));
    await user.click(screen.getByRole('button', { name: en.quiz.next }));
    await user.click(screen.getByRole('radio', { name: 'Option C' }));

    const submitButton = screen.getByRole('button', { name: en.quiz.submit });
    // Two clicks in the same synchronous tick (fireEvent, not userEvent, so
    // nothing awaits between them) — the ref guard, not just `isPending`
    // state, is what has to catch the second one before any re-render.
    fireEvent.click(submitButton);
    fireEvent.click(submitButton);

    await screen.findByText('Product rec-1');
    expect(mockedApiRequest).toHaveBeenCalledTimes(1);
  });

  it('retaking the quiz after results returns to the first question with a clean slate', async () => {
    mockedApiRequest.mockResolvedValue({ ok: true, data: { recommendations: [product('rec-1')] } });
    const user = userEvent.setup();
    render(<QuizFlow definition={definition} locale="en" dict={en} />);

    await user.click(screen.getByRole('radio', { name: 'Option A' }));
    await user.click(screen.getByRole('button', { name: en.quiz.next }));
    await user.click(screen.getByRole('radio', { name: 'Option C' }));
    await user.click(screen.getByRole('button', { name: en.quiz.submit }));
    await screen.findByText('Product rec-1');

    await user.click(screen.getByRole('button', { name: en.quiz.retake }));
    expect(screen.getByText('First question?')).toBeInTheDocument();
    expect(screen.getByText('1 / 2')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Option A' })).toHaveAttribute('aria-checked', 'false');
  });

  it('asks in the locale it is rendered in', () => {
    render(<QuizFlow definition={definition} locale="vi" dict={viDict} />);
    expect(screen.getByRole('heading', { name: 'Câu hỏi thứ nhất?' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Lựa chọn A' })).toBeInTheDocument();
    expect(screen.queryByText('First question?')).not.toBeInTheDocument();
  });

  it('shows the dictionary error, never the server message, when submit fails', async () => {
    mockedApiRequest.mockResolvedValue({ ok: false, error: { code: 'validation', message: 'Unknown option id q2-z' } });
    const user = userEvent.setup();
    render(<QuizFlow definition={definition} locale="en" dict={en} />);

    await user.click(screen.getByRole('radio', { name: 'Option A' }));
    await user.click(screen.getByRole('button', { name: en.quiz.next }));
    await user.click(screen.getByRole('radio', { name: 'Option C' }));
    await user.click(screen.getByRole('button', { name: en.quiz.submit }));

    expect(await screen.findByRole('alert')).toHaveTextContent(en.quiz.error);
    expect(screen.queryByText(/Unknown option/)).not.toBeInTheDocument();
  });
});
