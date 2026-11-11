import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FaqAccordion, type FaqAnswer } from './faq-accordion';

const entries: FaqAnswer[] = [
  {
    slug: 'thoi-gian-giao-hang',
    question: 'Bao lâu thì tôi nhận được hàng?',
    paragraphs: ['Nội thành 1–2 ngày làm việc.'],
    links: [{ href: '/vi/orders/track', label: 'Tra cứu đơn hàng' }],
  },
  {
    slug: 'phi-van-chuyen',
    question: 'Phí vận chuyển tính thế nào?',
    paragraphs: ['Miễn phí cho đơn từ 300.000₫.'],
    links: [],
  },
];

describe('FaqAccordion', () => {
  /**
   * The point of `hiddenUntilFound`. A closed answer that is absent from the document
   * is one a crawler never indexes and the reader's own Ctrl+F never finds — on a page
   * that exists to answer questions. Asserting the text is present while the row is
   * collapsed is the externally visible form of that guarantee; asserting the prop
   * would only restate the source.
   */
  it('keeps every answer in the document while its row is collapsed', () => {
    render(<FaqAccordion entries={entries} linksLabel="Xem thêm" />);

    for (const entry of entries) {
      expect(screen.getByRole('button', { name: entry.question })).toHaveAttribute('aria-expanded', 'false');
      expect(screen.getByText(entry.paragraphs[0])).toBeInTheDocument();
    }
  });

  it('opens one answer at a time', async () => {
    const user = userEvent.setup();
    render(<FaqAccordion entries={entries} linksLabel="Xem thêm" />);
    const [first, second] = entries.map((e) => screen.getByRole('button', { name: e.question }));

    await user.click(first);
    expect(first).toHaveAttribute('aria-expanded', 'true');

    // The design's own note on this section: opening the second closes the first,
    // rather than accumulating a wall of prose between the reader and question 26.
    await user.click(second);
    expect(second).toHaveAttribute('aria-expanded', 'true');
    expect(first).toHaveAttribute('aria-expanded', 'false');
  });

  /**
   * Queried after opening, deliberately: while a row is collapsed its panel carries
   * `hidden="until-found"` and is out of the accessibility tree, which is the correct
   * state — the label matters to the reader who has actually opened the answer.
   */
  it('labels the link list, so it does not reach a screen reader unnamed', async () => {
    const user = userEvent.setup();
    render(<FaqAccordion entries={entries} linksLabel="Xem thêm" />);

    await user.click(screen.getByRole('button', { name: entries[0].question }));
    expect(screen.getByRole('list', { name: 'Xem thêm' })).toBeInTheDocument();
  });
});
