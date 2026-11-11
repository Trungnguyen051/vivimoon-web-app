import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import SupportPage from './page';
import { faqEntries } from '@/content/mock';
import { vi as viDict } from '@/lib/i18n/dictionaries/vi';
import { en } from '@/lib/i18n/dictionaries/en';
import { locales } from '@/lib/i18n/config';
import { filterFaqEntries } from '@/lib/support/faq-filter';
import { FEATURED_LIMIT } from '@/lib/api/resources/support/mock';

const hub = viDict.support.hub;
const featured = faqEntries.filter((entry) => entry.featured);

async function renderHub() {
  return render(await SupportPage({ params: Promise.resolve({ locale: 'vi' }) }));
}

describe('the Support hub', () => {
  it('asks the hero question and offers a box that searches the FAQ page', async () => {
    await renderHub();
    const box = screen.getByRole('searchbox', { name: hub.searchLabel });

    expect(screen.getByRole('heading', { level: 1, name: hub.heroTitle })).toBeInTheDocument();
    expect(box).toHaveAttribute('name', 'q');
    expect(box.closest('form')).toHaveAttribute('action', '/vi/support/faq');
  });

  it('offers the common searches as links carrying their own query', async () => {
    await renderHub();
    const chips = screen.getByRole('navigation', { name: hub.commonSearches });

    expect(within(chips).getAllByRole('link')).toHaveLength(hub.chips.length);
    for (const chip of hub.chips) {
      expect(within(chips).getByRole('link', { name: chip }))
        .toHaveAttribute('href', `/vi/support/faq?q=${encodeURIComponent(chip)}`);
    }
  });

  it('renders the five featured questions with their authored short answers', async () => {
    await renderHub();

    expect(featured).toHaveLength(5);
    for (const entry of featured) {
      expect(screen.getByRole('heading', { level: 3, name: entry.question.vi })).toBeInTheDocument();
      expect(screen.getByText(entry.shortAnswer.vi)).toBeInTheDocument();
    }
  });

  /**
   * The short answer is authored, never a truncation — a sentence cut mid-word on the
   * first screen of the help section reads as a bug rather than as a summary.
   */
  it('shows a short answer that is not a prefix of the full one', async () => {
    for (const entry of featured) {
      const full = entry.answer.vi.join(' ');
      expect(entry.shortAnswer.vi.trim()).not.toBe('');
      expect(full.startsWith(entry.shortAnswer.vi)).toBe(false);
      expect(entry.shortAnswer.vi.endsWith('…')).toBe(false);
    }
  });

  it('points every card at its own answer, with the Topic the sidebar will show', async () => {
    await renderHub();
    const links = screen.getAllByRole('link', { name: hub.seeDetail });

    expect(links).toHaveLength(featured.length);
    links.forEach((link, i) => {
      const entry = featured[i];
      expect(link).toHaveAttribute('href', `/vi/support/faq?category=${entry.topic}#faq-${entry.slug}`);
    });
  });

  it('opens the unfiltered FAQ page from the see-all control', async () => {
    await renderHub();

    expect(screen.getByRole('link', { name: hub.seeAllFaq })).toHaveAttribute('href', '/vi/support/faq');
  });

  /** The stub it replaced is gone, and so is the copy that served it. */
  it('no longer says the hub is coming', async () => {
    await renderHub();

    expect('comingSoon' in viDict.support).toBe(false);
  });

  /**
   * A chip is an entry point, and one that lands on "no questions match" is worse than
   * one fewer. These are measured against the real filter rather than translated from
   * the other locale's list: `returns` and `prescription` both read fine and found
   * nothing useful, because the words appear only inside full answers — which the
   * search deliberately does not read (ADR-0020).
   */
  it.each(locales)('%s: every common-search chip finds at least one answer', (locale) => {
    const dict = locale === 'vi' ? viDict : en;

    for (const chip of dict.support.hub.chips) {
      expect(
        filterFaqEntries(faqEntries, { q: chip }).length,
        `${locale} chip "${chip}" lands on an empty FAQ page`,
      ).toBeGreaterThan(0);
    }
  });

  /** The row is drawn five across, so the resource must not hand back a sixth. */
  it('shows no more cards than the row has places', async () => {
    await renderHub();

    expect(screen.getAllByRole('link', { name: hub.seeDetail }).length)
      .toBeLessThanOrEqual(FEATURED_LIMIT);
  });
});
