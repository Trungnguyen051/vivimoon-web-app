import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CategoryGrid } from './category-grid';

/**
 * Every field a tile carries is content, and content repeats: the homepage
 * points several tiles at one collection, two tiles can share a creative while
 * the real photography is pending, and two labels can collide in translation.
 * Keying on any of them drops or duplicates tiles on reconciliation — the bug
 * #30 shipped — so a tile carries an explicit `id`, as HeroCarousel's Slide does.
 */
describe('CategoryGrid', () => {
  afterEach(() => vi.restoreAllMocks());

  it('keys tiles by identity even when every content field matches', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <CategoryGrid
        items={[
          { id: 'grad', label: 'Dự tiệc', href: '/vi/collection/bestsellers', image: '/images/placeholder.jpg' },
          { id: 'wedding', label: 'Dự tiệc', href: '/vi/collection/bestsellers', image: '/images/placeholder.jpg' },
          { id: 'party', label: 'Dự tiệc', href: '/vi/collection/bestsellers', image: '/images/placeholder.jpg' },
        ]}
      />,
    );

    expect(consoleError.mock.calls.flat().join(' ')).not.toMatch(/same key/i);
    expect(screen.getAllByRole('link')).toHaveLength(3);
  });

  it('renders the header block only when given a title', () => {
    const items = [{ id: 'daily', label: 'Daily', href: '/en/collection/daily-lenses', image: '/images/cat-daily.jpg' }];

    const { unmount } = render(<CategoryGrid items={items} />);
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    unmount();

    render(<CategoryGrid items={items} title="Lens for every moment" seeMoreHref="/en/collection/bestsellers" seeMoreLabel="VIEW ALL PRODUCTS" />);
    expect(screen.getByRole('heading', { name: 'Lens for every moment' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'VIEW ALL PRODUCTS' })).toBeInTheDocument();
  });
});
