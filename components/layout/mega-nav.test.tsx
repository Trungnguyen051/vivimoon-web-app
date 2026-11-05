import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MegaNav } from './mega-nav';
import { vi as viDict } from '@/lib/i18n/dictionaries/vi';
import { DIAMETER_BUCKETS, diameterBucketLabel } from '@/lib/products/lens-facets';

const FACETS = viDict.nav.facets;
/** Opens Sản Phẩm and hands back the panel's own first value. */
async function openProducts() {
  render(<MegaNav locale="vi" dict={viDict} />);
  await userEvent.click(screen.getByRole('button', { name: viDict.nav.products }));
  return screen.findByRole('link', { name: viDict.home.shopByFilter.colors.brown });
}

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
  it('shows Màu sắc\'s values the moment it opens', async () => {
    await openProducts();

    // Every facet is offered...
    for (const facet of [FACETS.color, FACETS.diameter, FACETS.expiry, FACETS.material]) {
      expect(screen.getByRole('link', { name: facet })).toBeInTheDocument();
    }
    // ...and one of them is already showing, because a panel that waits to be
    // aimed at is useless before you aim.
    expect(screen.getByRole('link', { name: viDict.home.shopByFilter.colors.clear })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: viDict.filters.replacements.daily })).not.toBeInTheDocument();
  });

  it('swaps the values beside a facet you hover', async () => {
    await openProducts();

    await userEvent.hover(screen.getByRole('link', { name: FACETS.expiry }));

    expect(await screen.findByRole('link', { name: viDict.filters.replacements.daily })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: viDict.home.shopByFilter.colors.brown })).not.toBeInTheDocument();
  });

  /**
   * One DOM serves both input modes, so arrowing must do what hovering does. A separate
   * flattened structure for keyboard users was rejected as two things that can drift.
   */
  it('moves between facets with the arrow keys, swapping as it goes', async () => {
    await openProducts();

    screen.getByRole('link', { name: FACETS.color }).focus();
    await userEvent.keyboard('{ArrowDown}');

    expect(screen.getByRole('link', { name: FACETS.diameter })).toHaveFocus();
    expect(await screen.findByRole('link', { name: diameterBucketLabel(DIAMETER_BUCKETS[0]) })).toBeInTheDocument();

    await userEvent.keyboard('{ArrowUp}');
    expect(screen.getByRole('link', { name: FACETS.color })).toHaveFocus();
    expect(await screen.findByRole('link', { name: viDict.home.shopByFilter.colors.brown })).toBeInTheDocument();
  });

  it('says which facet is showing rather than only colouring it', async () => {
    await openProducts();

    expect(screen.getByRole('link', { name: FACETS.color })).toHaveAttribute('aria-current', 'true');
    expect(screen.getByRole('link', { name: FACETS.material })).not.toHaveAttribute('aria-current');
  });

  /** The arrow beside a facet leads somewhere: the catalog, with that filter ready. */
  it('points each facet name at the catalog with its own filter focused', async () => {
    await openProducts();

    expect(screen.getByRole('link', { name: FACETS.material }))
      .toHaveAttribute('href', '/vi/collection/all-lenses#filter-material');
  });

  it('lets the keyboard reach the values of the facet it is on', async () => {
    await openProducts();

    screen.getByRole('link', { name: FACETS.color }).focus();
    // One stop for the whole column — Tab leaves it for the values, rather than
    // walking the other three facets first.
    await userEvent.tab();

    expect(screen.getByRole('link', { name: viDict.home.shopByFilter.colors.brown })).toHaveFocus();
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

    // The collections it used to list are gone; what it leads to now is the whole
    // catalog and the coloured-lens collection, by way of its facets (#87).
    it.each(['/vi/collection/all-lenses', '/vi/collection/colored-lenses'])(
      'marks Sản Phẩm while you are inside %s',
      (path) => {
        pathname.current = path;
        render(<MegaNav locale="vi" dict={viDict} />);

        expect(screen.getByRole('button', { name: viDict.nav.products })).toHaveAttribute('aria-current', 'true');
      }
    );

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
