import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QuizCard, markQuizTaken } from './quiz-card';
import { vi } from '@/lib/i18n/dictionaries/vi';

const card = () => render(<QuizCard locale="vi" dict={vi} questionCount={6} socialProof="12.400 người đã tìm được lens hợp mắt" />);

describe('QuizCard', () => {
  beforeEach(() => localStorage.clear());

  it('invites a first-timer to the Quiz, stating its real question count', () => {
    card();
    expect(screen.getByRole('heading', { name: 'Chưa biết chọn mẫu nào?' })).toBeInTheDocument();
    expect(screen.getByText(/^6 câu hỏi · 30 giây\./)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Làm quiz chọn lens' })).toHaveAttribute('href', '/vi/quiz');
    expect(screen.getByText('12.400 người đã tìm được lens hợp mắt')).toBeInTheDocument();
  });

  it('offers "Xem lại gợi ý cho bạn" once the Quiz has been taken on this device', async () => {
    markQuizTaken();
    card();
    expect(await screen.findByRole('link', { name: 'Xem lại gợi ý cho bạn' })).toHaveAttribute('href', '/vi/quiz');
  });
});
