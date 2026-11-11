import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReadingThemeChips } from './reading-theme-chips';

const chips = [
  { id: 'all', label: 'Tất cả', href: '/vi/articles', active: false },
  { id: 'beginner', label: 'Người mới đeo lens', href: '/vi/articles?theme=beginner', active: true },
  { id: 'care', label: 'Chăm sóc lens', href: '/vi/articles?theme=care', active: false },
];

describe('ReadingThemeChips', () => {
  /**
   * Links, not buttons: filtering has to work before hydration, and a narrowed index
   * has to be shareable. A chip rendered as a button would pass a visual review and
   * fail both.
   */
  it('renders every chip as a link to its own filtered index', () => {
    render(<ReadingThemeChips chips={chips} label="Lọc bài viết theo chủ đề" />);

    for (const chip of chips) {
      expect(screen.getByRole('link', { name: chip.label })).toHaveAttribute('href', chip.href);
    }
  });

  /**
   * The selected chip is announced, not only coloured — a shopper who cannot see the
   * fill still needs to know which of six is applied.
   */
  it('marks the active chip as current, and only that one', () => {
    render(<ReadingThemeChips chips={chips} label="Lọc bài viết theo chủ đề" />);

    expect(screen.getByRole('link', { name: 'Người mới đeo lens' })).toHaveAttribute('aria-current', 'true');
    expect(screen.getByRole('link', { name: 'Tất cả' })).not.toHaveAttribute('aria-current');
  });

  it('names the filter row from the dictionary', () => {
    render(<ReadingThemeChips chips={chips} label="Lọc bài viết theo chủ đề" />);

    expect(screen.getByRole('navigation', { name: 'Lọc bài viết theo chủ đề' })).toBeInTheDocument();
  });
});
