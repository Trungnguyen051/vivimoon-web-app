import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MegaNav } from './mega-nav';
import { vi as viDict } from '@/lib/i18n/dictionaries/vi';

const pathname = vi.hoisted(() => ({ current: '/vi' }));
vi.mock('next/navigation', () => ({ usePathname: () => pathname.current }));

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

  /**
   * The underline says where you are. Its hard case is Sản Phẩm, which is not a
   * route of its own: browsing a collection has to light up the trigger, or the
   * row marks nothing at all for five of the storefront's pages (#74).
   */
  describe('the current-route indicator', () => {
    afterEach(() => {
      pathname.current = '/vi';
    });

    it('marks the top-level item you are on', () => {
      pathname.current = '/vi/articles';
      render(<MegaNav locale="vi" dict={viDict} />);

      expect(screen.getByRole('link', { name: viDict.nav.knowledge })).toHaveAttribute('aria-current', 'page');
      expect(screen.getByRole('link', { name: viDict.nav.about })).not.toHaveAttribute('aria-current');
    });

    it('marks Sản Phẩm while you are inside any of its collections', () => {
      pathname.current = '/vi/collection/daily-lenses';
      render(<MegaNav locale="vi" dict={viDict} />);

      expect(screen.getByRole('button', { name: viDict.nav.products })).toHaveAttribute('aria-current', 'true');
    });

    it('marks nothing on a page with no nav entry', () => {
      pathname.current = '/vi/cart';
      render(<MegaNav locale="vi" dict={viDict} />);

      for (const link of screen.getAllByRole('link')) {
        expect(link).not.toHaveAttribute('aria-current');
      }
      expect(screen.getByRole('button', { name: viDict.nav.products })).not.toHaveAttribute('aria-current');
    });
  });
});
