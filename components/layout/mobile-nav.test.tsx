import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MobileNav } from './mobile-nav';
import { vi as viDict } from '@/lib/i18n/dictionaries/vi';

// The drawer also mounts LocaleSwitcher, which reaches for the router.
vi.mock('next/navigation', () => ({ usePathname: () => '/vi', useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));

/**
 * The drawer reads the same `getNavItems` source as the desktop nav, so the
 * structure can only diverge by someone flattening it here. That is exactly
 * what this pins on the surface a phone actually shows: the collections stay
 * behind Sản Phẩm, and every top-level item leads somewhere (#40, #72).
 */
describe('MobileNav', () => {
  async function openDrawer() {
    render(<MobileNav locale="vi" dict={viDict} />);
    await userEvent.click(screen.getByRole('button', { name: viDict.common.menu }));
  }

  it('keeps the collections behind Sản Phẩm', async () => {
    await openDrawer();

    expect(screen.queryByRole('link', { name: viDict.collection.newArrivals })).not.toBeInTheDocument();

    await userEvent.click(await screen.findByRole('button', { name: viDict.nav.products }));

    expect(await screen.findByRole('link', { name: viDict.collection.newArrivals }))
      .toHaveAttribute('href', '/vi/collection/new-arrivals');
    expect(screen.getByRole('link', { name: viDict.nav.sale })).toHaveAttribute('href', '/vi/collection/sale');
  });

  it('renders every top-level item as a link', async () => {
    await openDrawer();

    expect(await screen.findByRole('link', { name: viDict.nav.about })).toHaveAttribute('href', '/vi/about');
    expect(screen.getByRole('link', { name: viDict.nav.orderTracking })).toHaveAttribute('href', '/vi/orders/track');
    expect(screen.getByRole('link', { name: viDict.nav.knowledge })).toHaveAttribute('href', '/vi/articles');
    // Hỗ trợ was the last inert item until #72 gave it a route.
    expect(screen.getByRole('link', { name: viDict.nav.support })).toHaveAttribute('href', '/vi/support');
  });
});
