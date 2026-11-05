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

  /**
   * The drawer offers the same four Lens Facets the desktop panel does, from the same
   * data (#87). #113 turns these rows into sections carrying their values; until then
   * each leads to the catalog with its own filter ready.
   */
  it('offers the four Lens Facets, each leading somewhere real', async () => {
    await openDrawer();

    expect(await screen.findByRole('link', { name: viDict.nav.facets.color }))
      .toHaveAttribute('href', '/vi/collection/all-lenses#filter-color');
    expect(screen.getByRole('link', { name: viDict.nav.facets.material }))
      .toHaveAttribute('href', '/vi/collection/all-lenses#filter-material');
    // The collections it used to list keep their routes but lose this entry (#114).
    expect(screen.queryByRole('link', { name: viDict.collection.newArrivals })).not.toBeInTheDocument();
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
