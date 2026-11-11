import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
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

const expandedTriggers = () =>
  screen.getAllByRole('button').filter((t) => t.getAttribute('aria-expanded') === 'true');

// A hash set by one test must not leak into the next.
afterEach(() => { window.location.hash = ''; });

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

  /**
   * The deep link the hub's "Xem chi tiết" lands on (#121). A fragment never reaches
   * the server, so this behaviour exists only here — and the card is useless if it
   * drops the reader on a page of collapsed rows to find the question in again.
   */
  it('opens the answer the fragment names, and only that one', async () => {
    window.location.hash = `#faq-${entries[1].slug}`;
    render(<FaqAccordion entries={entries} linksLabel="Xem thêm" />);

    await waitFor(() => expect(expandedTriggers()).toHaveLength(1));
    expect(expandedTriggers()[0]).toHaveTextContent(entries[1].question);
  });

  /** A second card on the same page is a navigation the browser answers in place. */
  it('follows a fragment that changes without a remount', async () => {
    window.location.hash = `#faq-${entries[0].slug}`;
    render(<FaqAccordion entries={entries} linksLabel="Xem thêm" />);
    await waitFor(() => expect(expandedTriggers()[0]).toHaveTextContent(entries[0].question));

    window.location.hash = `#faq-${entries[1].slug}`;
    window.dispatchEvent(new HashChangeEvent('hashchange'));

    await waitFor(() => expect(expandedTriggers()[0]).toHaveTextContent(entries[1].question));
    expect(expandedTriggers()).toHaveLength(1);
  });

  /** The fragment arrives from the URL bar, so it is read rather than trusted. */
  it('opens nothing for a fragment naming no answer', async () => {
    window.location.hash = '#faq-khong-co-cau-nao-nhu-vay';
    render(<FaqAccordion entries={entries} linksLabel="Xem thêm" />);

    await waitFor(() => expect(screen.getAllByRole('button')).toHaveLength(entries.length));
    expect(expandedTriggers()).toHaveLength(0);
  });

  /**
   * A reader who arrives on a fragment and then opens a different row keeps their own
   * choice. The effect depended on `entries`, whose identity changes every time the
   * page re-renders (the prop is built by an inline `.map`), so a `router.refresh()`
   * snapped them back to the fragment's row.
   */
  it('does not snap back to the fragment when the entries prop is rebuilt', async () => {
    const user = userEvent.setup();
    window.location.hash = `#faq-${entries[0].slug}`;
    const { rerender } = render(<FaqAccordion entries={entries} linksLabel="Xem thêm" />);
    await waitFor(() => expect(expandedTriggers()[0]).toHaveTextContent(entries[0].question));

    await user.click(screen.getByRole('button', { name: entries[1].question }));
    expect(expandedTriggers()[0]).toHaveTextContent(entries[1].question);

    // Same content, new array identity — what the server component hands down each render.
    rerender(<FaqAccordion entries={[...entries]} linksLabel="Xem thêm" />);

    expect(expandedTriggers()[0]).toHaveTextContent(entries[1].question);
  });
});
