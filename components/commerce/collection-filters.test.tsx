import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CollectionFilters, CollectionFiltersSheet, CollectionLoadMore, CollectionSort } from './collection-filters';
import { vi as viDict } from '@/lib/i18n/dictionaries/vi';
import { LENS_FACETS, facetAnchorId } from '@/lib/products/lens-facets';
import type { FacetCounts } from '@/lib/api/resources/catalog';

const push = vi.fn();
let search = '';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  usePathname: () => '/vi/collection/all-lenses',
  useSearchParams: () => new URLSearchParams(search),
}));

const t = viDict.filters.sidebar;

const counts: FacetCounts = {
  productLine: { trongSuot: 6, coMau: 14, vanNhu: 2 },
  replacement: { daily: 4, monthly: 12, threeMonth: 3, sixMonth: 5 },
  brandId: { vivimoon: 24 },
  color: { brown: 9, gray: 7, black: 0 },
  diameter: { '14.2-14.2': 12, '14-14': 4, '14.5-14.5': 6 },
  material: { Hydrogel: 10, 'Silicone Hydrogel': 14 },
  makeupStyle: { natural: 15, pink: 6, orange: 5, smoky: 7 },
  series: { lenspresso: 8, eyeconic: 7, clear: 6 },
  occasion: { graduation: 5, wedding: 4, party: 7, date: 7, travel: 9, photoshoot: 6 },
  price: { 'under-200k': 24, '200k-300k': 0, 'over-300k': 0 },
};

const renderFilters = () => render(<CollectionFilters dict={viDict} counts={counts} />);
const lastUrl = () => decodeURIComponent(push.mock.lastCall![0] as string);

describe('CollectionFilters (#194)', () => {
  beforeEach(() => {
    push.mockClear();
    search = '';
  });

  it('renders every group in the frame’s order', () => {
    renderFilters();
    const groups = screen.getAllByRole('button', { expanded: true }).map((b) => b.textContent);
    expect(groups).toEqual([
      t.lensLine, viDict.nav.facets.color, viDict.nav.facets.expiry, viDict.nav.facets.diameter,
      t.makeupStyle, t.series, t.occasion, t.price,
    ]);
  });

  it('shows every option with its count', () => {
    renderFilters();
    expect(screen.getByRole('checkbox', { name: `${viDict.filters.replacements.monthly} (12)` })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: `${t.makeupStyles.pink} (6)` })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '14.2mm (12)' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: new RegExp(viDict.nav.facets.materials.breathable) })).toHaveAccessibleName(
      expect.stringContaining('(14)'),
    );
  });

  it('keeps a dead-end option out of reach unless it is already picked', () => {
    renderFilters();
    expect(screen.getByRole('button', { name: `${viDict.filters.colors.black} (0)` })).toBeDisabled();
  });

  it('adds a pick to the facet’s set, shares it through the URL and keeps the scroll', async () => {
    search = 'replacement=daily&show=16';
    renderFilters();

    await userEvent.click(screen.getByRole('checkbox', { name: /^1 tháng/ }));

    // Paging restarts, since the result it counted is gone.
    expect(lastUrl()).toBe('/vi/collection/all-lenses?replacement=daily,monthly');
    expect(push.mock.lastCall![1]).toEqual({ scroll: false });
  });

  it('removes a pick that is clicked again', async () => {
    search = 'makeupStyle=pink,orange';
    renderFilters();

    const pink = screen.getByRole('button', { name: /^Tone hồng/ });
    expect(pink).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(pink);

    expect(lastUrl()).toBe('/vi/collection/all-lenses?makeupStyle=orange');
  });

  it('offers Trong suốt among the colours, as the clear Product Line', async () => {
    renderFilters();
    await userEvent.click(screen.getByRole('button', { name: `${viDict.filters.productLines.trongSuot} (6)` }));
    expect(lastUrl()).toBe('/vi/collection/all-lenses?productLine=trongSuot');
  });

  it('applies a price preset as a min/max pair, and clears it when picked again', async () => {
    const withMid = { ...counts, price: { ...counts.price, '200k-300k': 3 } };
    const { unmount } = render(<CollectionFilters dict={viDict} counts={withMid} />);
    await userEvent.click(screen.getByRole('button', { name: `${t.pricePresets['200k-300k']} (3)` }));
    expect(lastUrl()).toBe('/vi/collection/all-lenses?minPrice=200000&maxPrice=300000');
    unmount();

    search = 'minPrice=200000&maxPrice=300000';
    render(<CollectionFilters dict={viDict} counts={withMid} />);
    await userEvent.click(screen.getByRole('button', { name: /^200K – 300K/ }));
    expect(lastUrl()).toBe('/vi/collection/all-lenses');
  });

  it('applies a typed price range on Enter', async () => {
    renderFilters();
    await userEvent.type(screen.getByRole('textbox', { name: t.priceFrom }), '150000');
    await userEvent.type(screen.getByRole('textbox', { name: t.priceTo }), '250000{Enter}');
    expect(lastUrl()).toBe('/vi/collection/all-lenses?minPrice=150000&maxPrice=250000');
  });

  it('collapses a group as drawn', async () => {
    renderFilters();
    const trigger = screen.getByRole('button', { name: t.occasion });
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('clears every filter but keeps the sort', async () => {
    search = 'color=brown&series=eyeconic&sort=price-asc&show=16';
    renderFilters();
    await userEvent.click(screen.getByRole('button', { name: t.clearAll }));
    expect(lastUrl()).toBe('/vi/collection/all-lenses?sort=price-asc');
  });

  it('offers no clear link when nothing is filtered', () => {
    search = 'sort=newest';
    renderFilters();
    expect(screen.queryByRole('button', { name: t.clearAll })).not.toBeInTheDocument();
  });

  /**
   * The Sản Phẩm menu links a diameter bucket (`14.3-14.5`) the width chips don't list.
   * It must still show, picked, so the shopper can see and undo what narrowed the grid.
   */
  it('shows a menu bucket the shopper arrived with as a picked chip', () => {
    search = 'diameter=14.3-14.5';
    render(<CollectionFilters dict={viDict} counts={{ ...counts, diameter: { ...counts.diameter, '14.3-14.5': 3 } }} />);
    expect(screen.getByRole('button', { name: '14.3 - 14.5mm (3)' })).toHaveAttribute('aria-pressed', 'true');
  });

  /**
   * A facet name in the menu opens this page aimed at that facet's group, via a fragment.
   * The id comes from the same function the menu's href is built from, so they can't drift.
   */
  it.each(LENS_FACETS.map((facet) => facet.id))('gives %s a control the menu can aim at', (facetId) => {
    const { container } = renderFilters();
    const control = container.querySelector(`#${facetAnchorId(facetId)}`);
    expect(control, `nothing answers #${facetAnchorId(facetId)}`).not.toBeNull();
    expect(control!.tagName.toLowerCase()).toBe('button');
  });

  it('links the lens-line comparison', () => {
    renderFilters();
    expect(screen.getByRole('link', { name: t.compareLines })).toHaveAttribute(
      'href', '/vi/articles/silicone-hydrogel-vs-lens-thuong',
    );
  });
});

describe('CollectionFiltersSheet (#194)', () => {
  it('opens the same groups from the mobile "Bộ lọc" button', async () => {
    render(<CollectionFiltersSheet dict={viDict} counts={counts} />);
    await userEvent.click(screen.getByRole('button', { name: t.title }));
    const sheet = await screen.findByRole('dialog');
    expect(within(sheet).getByRole('button', { name: t.price })).toBeInTheDocument();
    expect(within(sheet).getByRole('button', { name: t.lensLine })).toBeInTheDocument();
  });
});

describe('CollectionSort (#194)', () => {
  beforeEach(() => {
    push.mockClear();
    search = '';
  });

  it('reads best-selling by default', () => {
    render(<CollectionSort dict={viDict} />);
    expect(screen.getByRole('combobox', { name: viDict.filters.sort })).toHaveTextContent('Sắp xếp: Bán chạy');
  });

  it.each(['newest', 'price-asc', 'price-desc'] as const)('sorts by %s through the URL, restarting the paging', async (sort) => {
    search = 'color=brown&show=16';
    render(<CollectionSort dict={viDict} />);
    await userEvent.click(screen.getByRole('combobox', { name: viDict.filters.sort }));
    await userEvent.click(await screen.findByRole('option', { name: viDict.filters.sorts[sort] }));
    expect(lastUrl()).toBe(`/vi/collection/all-lenses?color=brown&sort=${sort}`);
  });
});

describe('CollectionLoadMore (#194)', () => {
  beforeEach(() => {
    push.mockClear();
    search = 'color=brown';
  });

  it('says how many are showing and loads the next eight without scrolling', async () => {
    render(<CollectionLoadMore dict={viDict} shown={8} total={20} />);
    expect(screen.getByText('Đang xem 8 / 20 sản phẩm')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: t.loadMore }));
    expect(lastUrl()).toBe('/vi/collection/all-lenses?color=brown&show=16');
    expect(push.mock.lastCall![1]).toEqual({ scroll: false });
  });

  it('offers no button once everything is showing', () => {
    render(<CollectionLoadMore dict={viDict} shown={20} total={20} />);
    expect(within(document.body).getByText('Đang xem 20 / 20 sản phẩm')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: t.loadMore })).not.toBeInTheDocument();
  });
});
