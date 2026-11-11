import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import SupportFaqPage from './page';
import { faqEntries } from '@/content/mock';
import { vi as viDict } from '@/lib/i18n/dictionaries/vi';

/**
 * The page agreeing with `filterFaqEntries`, which is where the two rules themselves
 * are held (`lib/support/faq-filter.test.ts`). What is pinned here is the wiring: the
 * box is a GET form, the sidebar survives a query, and nothing matched says so.
 */
async function renderFaq(query: Record<string, string> = {}) {
  return render(
    await SupportFaqPage({
      params: Promise.resolve({ locale: 'vi' }),
      searchParams: Promise.resolve(query),
    }),
  );
}

const sidebar = () => screen.getByRole('navigation', { name: viDict.support.faq.topicNav });

describe('the FAQ page search', () => {
  it('searches with no JavaScript: a GET form that sets ?q=', async () => {
    await renderFaq();
    const box = screen.getByRole('searchbox', { name: viDict.support.faq.searchLabel });
    const form = box.closest('form')!;

    expect(box).toHaveAttribute('name', 'q');
    expect(form).toHaveAttribute('action', '/vi/support/faq');
    // GET is the default; a `method` of post would put the query in a body no URL carries.
    expect(form.getAttribute('method')).not.toBe('post');
    // No hidden category: submitting a query deliberately drops the active Topic.
    expect(form.querySelector('input[name="category"]')).toBeNull();
  });

  it('shows only the matching questions, and keeps what was typed in the box', async () => {
    const match = faqEntries[0];
    await renderFaq({ q: match.question.vi });

    expect(screen.getByRole('searchbox', { name: viDict.support.faq.searchLabel }))
      .toHaveValue(match.question.vi);
    expect(screen.getByText(match.question.vi)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(viDict.support.faq.resultsFor))).toBeInTheDocument();
  });

  /** The sidebar is how a reader leaves a query, so it cannot go away while one is on. */
  it('keeps the sidebar usable while a query is active', async () => {
    await renderFaq({ q: 'giao hàng' });

    expect(within(sidebar()).getAllByRole('link').length).toBeGreaterThan(1);
    expect(within(sidebar()).getByRole('link', { name: viDict.support.faq.allTopics }))
      .toHaveAttribute('href', '/vi/support/faq');
  });

  /**
   * Picking a Topic clears the query, the mirror of a query replacing the Topic. A
   * sidebar link that carried `?q=` forward would filter inside a search and report a
   * Topic it is not showing.
   */
  it('offers Topic links that carry no query forward', async () => {
    await renderFaq({ q: 'giao hàng' });

    for (const link of within(sidebar()).getAllByRole('link')) {
      expect(link.getAttribute('href')).not.toContain('q=');
    }
  });

  it('says nothing matched rather than leaving a blank column', async () => {
    await renderFaq({ q: 'khong-co-cau-nao-nhu-vay' });

    expect(screen.getByText(viDict.support.faq.noResults)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: viDict.support.faq.clearSearch }))
      .toHaveAttribute('href', '/vi/support/faq');
    // The sidebar is still there to leave by.
    expect(within(sidebar()).getAllByRole('link').length).toBeGreaterThan(1);
  });

  it('still browses by Topic when no query is set', async () => {
    const topic = faqEntries[0].topic;
    await renderFaq({ category: topic });

    expect(screen.getByRole('heading', { level: 2, name: viDict.support.topics[topic] })).toBeInTheDocument();
    expect(screen.queryByText(viDict.support.faq.noResults)).not.toBeInTheDocument();
  });

  /** A stale bookmark from a renamed Topic shows a page of answers, not a 404. */
  it('falls back to everything on an unrecognised category', async () => {
    await renderFaq({ category: 'no-such-topic' });

    expect(screen.queryByText(viDict.support.faq.noResults)).not.toBeInTheDocument();
    expect(screen.getByText(faqEntries[0].question.vi)).toBeInTheDocument();
  });

  /**
   * A param can repeat — one link clicked twice, or typed by hand. The page declared
   * `q?: string` and called `.trim()` on it, which type-checked and threw a 500 the
   * first time `?q=lens&q=lens` arrived.
   */
  it('survives a repeated query param', async () => {
    await renderFaq({ q: ['giao hàng', 'giao hàng'] as unknown as string });

    expect(screen.getByRole('searchbox', { name: viDict.support.faq.searchLabel }))
      .toHaveValue('giao hàng');
    expect(screen.queryByText(viDict.support.faq.noResults)).not.toBeInTheDocument();
  });

  /**
   * The results are drawn from every Topic while a query runs, so no chip may announce
   * itself as the current page — including "All", which would claim an unfiltered list.
   */
  it('marks no Topic current while a query is running', async () => {
    await renderFaq({ q: 'giao hàng', category: 'nguoi-moi-deo-lens' });

    for (const link of within(sidebar()).getAllByRole('link')) {
      expect(link).not.toHaveAttribute('aria-current');
    }
  });

  /** And still marks one when browsing, which is the state that chip describes. */
  it('marks the browsed Topic current when no query is running', async () => {
    await renderFaq({ category: 'giao-hang' });

    expect(within(sidebar()).getByRole('link', { name: viDict.support.topics['giao-hang'] }))
      .toHaveAttribute('aria-current', 'page');
  });

  /**
   * An empty Topic is not a search that found nothing. Telling a reader their search
   * matched nothing when they never made one is the page misreading itself.
   */
  it('says a Topic is empty in its own words, not the search\'s', async () => {
    await renderFaq({ q: 'khong-co-cau-nao-nhu-vay' });
    expect(screen.getByText(viDict.support.faq.noResults)).toBeInTheDocument();
    expect(screen.queryByText(viDict.support.faq.noneInTopic)).not.toBeInTheDocument();
  });

  /** The accordion draws its own top rule, so it must not render beside the empty card. */
  it('renders no accordion when nothing matched', async () => {
    const { container } = await renderFaq({ q: 'khong-co-cau-nao-nhu-vay' });

    expect(container.querySelector('[data-slot="accordion"]')).toBeNull();
  });
});
