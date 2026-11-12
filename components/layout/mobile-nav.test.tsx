import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MobileNav } from './mobile-nav';
import { vi as viDict } from '@/lib/i18n/dictionaries/vi';
import { LENS_FACETS, facetValueHref } from '@/lib/products/lens-facets';
import { valueLabel } from './facet-value';

// The drawer also mounts LocaleSwitcher, which reaches for the router.
vi.mock('next/navigation', () => ({ usePathname: () => '/vi', useSearchParams: () => new URLSearchParams(), useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));

/** A label may carry regex metacharacters — `14.0mm`, `Giá: thấp` — so it is matched literally. */
const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

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
   * data (#87). There is no hover on touch, so a facet is a section to expand rather
   * than a row that only leads away — expansion is the whole interaction (#113).
   */
  it('shows one collapsed section per Lens Facet, and no values until asked', async () => {
    await openDrawer();

    for (const facet of LENS_FACETS) {
      const trigger = await screen.findByRole('button', { name: viDict.nav.facets[facet.id] });
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    }

    // Collapsed is four rows — the drawer does not grow longer for the privilege.
    expect(LENS_FACETS).toHaveLength(4);
    expect(screen.queryByRole('link', { name: viDict.home.shopByFilter.colors.brown })).not.toBeInTheDocument();
    // The collections it used to list keep their routes but lose this entry (#114).
    expect(screen.queryByRole('link', { name: viDict.collection.newArrivals })).not.toBeInTheDocument();
  });

  it('reveals a facet\'s values when expanded and hides them again when collapsed', async () => {
    await openDrawer();
    const trigger = await screen.findByRole('button', { name: viDict.nav.facets.expiry });

    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', { name: viDict.filters.replacements.monthly }))
      .toHaveAttribute('href', '/vi/collection/all-lenses?replacement=monthly');

    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  /**
   * Every value the desktop panel offers is reachable here and opens the same place.
   * Walked from `LENS_FACETS` rather than spelled out, so a value added to the data
   * and forgotten in this drawer fails rather than passing unnoticed.
   */
  it('opens the catalog narrowed to every value, for every facet', async () => {
    await openDrawer();

    for (const facet of LENS_FACETS) {
      await userEvent.click(await screen.findByRole('button', { name: viDict.nav.facets[facet.id] }));

      for (const value of facet.values) {
        expect(
          screen.getByRole('link', { name: new RegExp(escapeRegExp(valueLabel(value, viDict))) }),
          `no link for ${facet.id} value "${value.id}"`,
        ).toHaveAttribute('href', facetValueHref(value, 'vi'));
      }
    }
  });

  /**
   * A swatch is decoration; the colour's name is what carries it to a screen reader.
   * Không màu is among them — it is a value of this facet, not an absence of one.
   */
  it('names every colour, Không màu included, and leaves the swatches to the eye', async () => {
    await openDrawer();
    await userEvent.click(await screen.findByRole('button', { name: viDict.nav.facets.color }));

    const clear = screen.getByRole('link', { name: viDict.home.shopByFilter.colors.clear });
    // Không màu keeps the homepage's own link, which selects the trong suốt Product
    // Line by absence of colour rather than by a colour set.
    expect(clear).toHaveAttribute('href', '/vi/collection/all-lenses?productLine=trongSuot');
    expect(screen.getByRole('link', { name: viDict.home.shopByFilter.colors.brown })).toBeInTheDocument();
    // The swatches sit inside the link and must not be read as part of its name.
    expect(clear.querySelector('[aria-hidden="true"]')).not.toBeNull();
  });

  it('opens a section from the keyboard', async () => {
    await openDrawer();
    const trigger = await screen.findByRole('button', { name: viDict.nav.facets.material });

    trigger.focus();
    await userEvent.keyboard('{Enter}');

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', { name: viDict.nav.facets.materials.moisture })).toBeInTheDocument();
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
