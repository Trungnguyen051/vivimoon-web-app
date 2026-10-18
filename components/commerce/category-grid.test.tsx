import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CategoryGrid } from './category-grid';

/**
 * The homepage points several tiles at one collection (every "moment" goes to
 * bestsellers, every make-up look to colored-lenses), so href is not a tile's
 * identity. Keying on it made React treat the tiles as one child — a duplicate-key
 * warning, and omitted or duplicated tiles once the list reconciles.
 */
describe('CategoryGrid', () => {
  afterEach(() => vi.restoreAllMocks());

  it('gives each tile a distinct key when several share one destination', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <CategoryGrid
        items={[
          { label: 'Grad photos', href: '/en/collection/bestsellers', image: '/images/moment-grad.png' },
          { label: 'Parties', href: '/en/collection/bestsellers', image: '/images/moment-party.png' },
          { label: 'Wedding', href: '/en/collection/bestsellers', image: '/images/moment-wedding.png' },
        ]}
      />,
    );

    expect(consoleError.mock.calls.flat().join(' ')).not.toMatch(/same key/i);
    expect(screen.getAllByRole('link')).toHaveLength(3);
    for (const label of ['Grad photos', 'Parties', 'Wedding']) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it('renders the header block only when given a title', () => {
    const items = [{ label: 'Daily', href: '/en/collection/daily-lenses', image: '/images/cat-daily.jpg' }];

    const { unmount } = render(<CategoryGrid items={items} />);
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    unmount();

    render(<CategoryGrid items={items} title="Lens for every moment" seeMoreHref="/en/collection/bestsellers" seeMoreLabel="VIEW ALL" />);
    expect(screen.getByRole('heading', { name: 'Lens for every moment' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'VIEW ALL' })).toBeInTheDocument();
  });
});
