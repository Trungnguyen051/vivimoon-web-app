import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MegaNav } from './mega-nav';
import { vi as viDict } from '@/lib/i18n/dictionaries/vi';

vi.mock('next/navigation', () => ({ usePathname: () => '/vi' }));

/**
 * The decision here would regress silently and look fine on screen: the five
 * collections live *under* Sản Phẩm rather than in the top row, so a flattening
 * refactor would still render five links and pass a naive check.
 *
 * Every item is navigable now — #42 gave Kiến thức a route and #72 gave Hỗ trợ
 * one, which emptied the inert `text` variant and retired it. What stops a nav
 * item pointing at a route nobody built is `tests/nav-destinations.test.ts`.
 */
describe('MegaNav', () => {
  it('nests every collection under Sản Phẩm rather than in the top row', async () => {
    render(<MegaNav locale="vi" dict={viDict} />);

    const collections = [
      [viDict.collection.newArrivals, '/vi/collection/new-arrivals'],
      [viDict.collection.bestsellers, '/vi/collection/bestsellers'],
      [viDict.collection.colored, '/vi/collection/colored-lenses'],
      [viDict.collection.daily, '/vi/collection/daily-lenses'],
      [viDict.nav.sale, '/vi/collection/sale'],
    ];

    for (const [label] of collections) {
      expect(screen.queryByRole('link', { name: label })).not.toBeInTheDocument();
    }

    await userEvent.click(screen.getByRole('button', { name: viDict.nav.products }));

    for (const [label, href] of collections) {
      expect(await screen.findByRole('link', { name: label })).toHaveAttribute('href', href);
    }
  });

  it('opens Sản Phẩm from the keyboard', async () => {
    render(<MegaNav locale="vi" dict={viDict} />);

    // Tab order is the design order, so Về Vivimoon takes focus before Sản Phẩm.
    await userEvent.tab();
    expect(screen.getByRole('link', { name: viDict.nav.about })).toHaveFocus();

    await userEvent.tab();
    expect(screen.getByRole('button', { name: viDict.nav.products })).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    expect(await screen.findByRole('link', { name: viDict.collection.newArrivals })).toBeInTheDocument();
  });

  it('renders every top-level item as a link', () => {
    render(<MegaNav locale="vi" dict={viDict} />);

    expect(screen.getByRole('link', { name: viDict.nav.about })).toHaveAttribute('href', '/vi/about');
    expect(screen.getByRole('link', { name: viDict.nav.orderTracking })).toHaveAttribute('href', '/vi/orders/track');
    expect(screen.getByRole('link', { name: viDict.nav.knowledge })).toHaveAttribute('href', '/vi/articles');
    // Hỗ trợ was the last inert item until #72 gave it a route.
    expect(screen.getByRole('link', { name: viDict.nav.support })).toHaveAttribute('href', '/vi/support');
  });
});
