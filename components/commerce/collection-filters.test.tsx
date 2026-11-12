import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  CollectionFilters, CollectionFiltersSheet, CollectionImageView, CollectionLoadMore, CollectionSort, DefaultRxAutoApply, YourRxSheet,
} from './collection-filters';
import { useSessionStore } from '@/features/session/session-store';
import { GUEST_RX_KEY, useGuestRxStore } from '@/features/session/default-rx';
import { vi as viDict } from '@/lib/i18n/dictionaries/vi';
import { LENS_FACETS, facetAnchorId } from '@/lib/products/lens-facets';
import type { FacetCounts } from '@/lib/api/resources/catalog';

const push = vi.fn();
const replace = vi.fn();
let search = '';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace }),
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

  it('applies a typed price range when focus leaves the fields (phone number pads have no Enter)', async () => {
    renderFilters();
    await userEvent.type(screen.getByRole('textbox', { name: t.priceFrom }), '150000');
    await userEvent.tab(); // moving between the two fields does not apply yet
    expect(push).not.toHaveBeenCalled();
    await userEvent.type(screen.getByRole('textbox', { name: t.priceTo }), '250000');
    await userEvent.tab();
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

  it('does not count a malformed rx as a filter — the server ignores it too (review of #216)', () => {
    search = 'rx=abc';
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

describe('"Độ của bạn" (#196)', () => {
  const y = t.yourRx;
  const pickPower = async (eye: string, option: string) => {
    await userEvent.click(screen.getByRole('combobox', { name: eye }));
    await userEvent.click(await screen.findByRole('option', { name: option }));
  };

  beforeEach(() => {
    push.mockClear();
    replace.mockClear();
    search = '';
    localStorage.clear();
    sessionStorage.clear();
    useSessionStore.setState({ user: null, status: 'anonymous' });
    useGuestRxStore.setState({ rx: null, loaded: false });
  });

  it('narrows the grid once both eyes are set, and saves a guest’s Default Rx on the device', async () => {
    search = 'color=brown&show=16';
    renderFilters();
    expect(screen.getByRole('heading', { name: y.title })).toBeInTheDocument();
    await pickPower(viDict.rx.leftEye, '-2.50');
    expect(push).not.toHaveBeenCalled();

    await pickPower(viDict.rx.rightEye, '-3.00');
    expect(lastUrl()).toBe('/vi/collection/all-lenses?color=brown&rx=-2.5,-3');
    expect(JSON.parse(localStorage.getItem(GUEST_RX_KEY)!)).toEqual({ left: -2.5, right: -3 });
  });

  it('offers "Giống mắt trái" for the right eye, and heads the list with the steps it really uses', async () => {
    renderFilters();
    await pickPower(viDict.rx.leftEye, '-7.00');
    await userEvent.click(screen.getByRole('combobox', { name: viDict.rx.rightEye }));
    // The left list may still be leaving the DOM, so both headers can be present.
    expect((await screen.findAllByText('Bước 0.25 · 0.50 dưới -6.00')).length).toBeGreaterThan(0);
    expect(screen.queryByRole('option', { name: '-7.25' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('option', { name: `${viDict.rx.sameAsLeft} (-7.00)` }));
    expect(lastUrl()).toBe('/vi/collection/all-lenses?rx=-7,-7');
  });

  it('shows the applied powers from the URL', () => {
    search = 'rx=-1.5,-2';
    renderFilters();
    expect(screen.getByRole('combobox', { name: viDict.rx.leftEye })).toHaveTextContent('-1.50');
    expect(screen.getByRole('combobox', { name: viDict.rx.rightEye })).toHaveTextContent('-2.00');
  });

  it('"Xoá tất cả" drops the rx filter but keeps the saved Default Rx', async () => {
    localStorage.setItem(GUEST_RX_KEY, JSON.stringify({ left: -1, right: -1 }));
    search = 'rx=-1,-1';
    renderFilters();
    await userEvent.click(screen.getByRole('button', { name: t.clearAll }));
    expect(lastUrl()).toBe('/vi/collection/all-lenses');
    expect(localStorage.getItem(GUEST_RX_KEY)).not.toBeNull();
  });

  describe('DefaultRxAutoApply', () => {
    it('applies a saved Default Rx to a collection opened without one', async () => {
      localStorage.setItem(GUEST_RX_KEY, JSON.stringify({ left: -1, right: -2 }));
      search = 'color=brown';
      render(<DefaultRxAutoApply />);
      await vi.waitFor(() => expect(replace).toHaveBeenCalledWith('/vi/collection/all-lenses?color=brown&rx=-1%2C-2', { scroll: false }));
    });

    it('leaves an rx already in the URL alone', async () => {
      localStorage.setItem(GUEST_RX_KEY, JSON.stringify({ left: -1, right: -2 }));
      search = 'rx=-3,-3';
      render(<DefaultRxAutoApply />);
      await act(async () => {});
      expect(replace).not.toHaveBeenCalled();
    });

    it('does not bring it back after "Xoá tất cả" in the same session', async () => {
      localStorage.setItem(GUEST_RX_KEY, JSON.stringify({ left: -1, right: -2 }));
      search = 'rx=-1,-2';
      const { unmount } = renderFilters();
      await userEvent.click(screen.getByRole('button', { name: t.clearAll }));
      unmount();
      search = '';
      render(<DefaultRxAutoApply />);
      await act(async () => {});
      expect(replace).not.toHaveBeenCalled();
    });
  });

  it('opens on mobile from "Nhập độ" as a sheet with the guide link', async () => {
    render(<YourRxSheet dict={viDict} />);
    await userEvent.click(screen.getByRole('button', { name: y.enter }));
    const sheet = await screen.findByRole('dialog', { name: y.title });
    expect(within(sheet).getByRole('combobox', { name: viDict.rx.leftEye })).toBeInTheDocument();
    expect(within(sheet).getByRole('link', { name: y.guide })).toHaveAttribute('href', '/vi/support/guides/chon-do-can-the-nao');
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

describe('CollectionImageView (#195)', () => {
  beforeEach(() => {
    push.mockClear();
    replace.mockClear();
    search = '';
  });

  it('defaults to Người mẫu and writes the chosen view to the URL, keeping the paging', async () => {
    search = 'show=16';
    render(<CollectionImageView dict={viDict} />);
    expect(screen.getByRole('button', { name: 'Người mẫu' })).toHaveAttribute('aria-pressed', 'true');

    await userEvent.click(screen.getByRole('button', { name: 'Cận mắt' }));
    expect(replace).toHaveBeenLastCalledWith('/vi/collection/all-lenses?show=16&view=closeUp', { scroll: false });
    // A view switch replaces the history entry rather than adding one.
    expect(push).not.toHaveBeenCalled();
  });

  it('drops the param when going back to the default', async () => {
    search = 'view=eye';
    render(<CollectionImageView dict={viDict} />);
    expect(screen.getByRole('button', { name: 'Vân lens' })).toHaveAttribute('aria-pressed', 'true');

    await userEvent.click(screen.getByRole('button', { name: 'Người mẫu' }));
    expect(replace).toHaveBeenLastCalledWith('/vi/collection/all-lenses', { scroll: false });
  });
});
