import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CollectionFilters } from './collection-filters';
import { vi as viDict } from '@/lib/i18n/dictionaries/vi';
import {
  LENS_FACETS, DIAMETER_BUCKETS, MATERIAL_VALUES, facetAnchorId, diameterBucketLabel,
} from '@/lib/products/lens-facets';

const push = vi.fn();
let search = '';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  usePathname: () => '/vi/collection/colored-lenses',
  useSearchParams: () => new URLSearchParams(search),
}));

const colors = ['brown', 'gray'];

function renderFilters() {
  return render(<CollectionFilters dict={viDict} colors={colors} />);
}

/**
 * A Color Family tile drops a shopper straight onto `?color=…`. Until the colour
 * had a control, that page showed a filtered — often empty — grid with nothing
 * naming the filter and nothing to undo it; the only way out was editing the URL (#43).
 */
describe('CollectionFilters', () => {
  beforeEach(() => {
    push.mockClear();
    search = '';
  });

  /**
   * Only the colour control was pinned this way, and the Base UI migration showed
   * why that was not enough: the library reads a trigger's text from the select's
   * `items` map rather than from the chosen option's children, so every control
   * here silently fell back to the raw query value — `daily` in place of the
   * shopper's own language. One control's coverage caught it; four had none.
   */
  it('names every active filter in words a shopper reads, not by its query value', () => {
    search = 'productLine=trongSuot&replacement=daily&sort=newest';
    renderFilters();

    expect(screen.getByRole('combobox', { name: viDict.filters.productLine }))
      .toHaveTextContent(viDict.filters.productLines.trongSuot);
    expect(screen.getByRole('combobox', { name: viDict.filters.replacement }))
      .toHaveTextContent(viDict.filters.replacements.daily);
    expect(screen.getByRole('combobox', { name: viDict.filters.sort }))
      .toHaveTextContent(viDict.filters.sorts.newest);
  });

  it('names the active colour rather than leaving it invisible', () => {
    search = 'color=brown';
    renderFilters();

    // The dictionary's name for the colour, not a variant's English shade name.
    expect(screen.getByRole('combobox', { name: viDict.filters.color })).toHaveTextContent(viDict.filters.colors.brown);
  });

  it('offers a way back whenever a colour filter is active', () => {
    search = 'color=brown';
    const { unmount } = renderFilters();
    expect(screen.getByRole('button', { name: viDict.filters.clear })).toBeInTheDocument();
    unmount();

    search = '';
    renderFilters();
    expect(screen.queryByRole('button', { name: viDict.filters.clear })).not.toBeInTheDocument();
  });

  /**
   * A Lens Facet lands a shopper on a filter this row has no control for — the menu
   * offers diameter and material, the row offers neither (#109). Without a way back
   * they are stranded exactly as #43 left them, narrowed with nothing on the page to
   * widen again, and an empty result hides the collection's own recovery link too.
   *
   * Driven through the real query schema rather than a list of names, so a filter the
   * schema gains later is covered the day it arrives.
   */
  it.each(['diameter=13.5-13.9', 'material=Hydrogel', 'brandId=b1'])(
    'offers a way back when the only filter is %s',
    (search_) => {
      search = search_;
      renderFilters();
      expect(screen.getByRole('button', { name: viDict.filters.clear })).toBeInTheDocument();
    }
  );

  /**
   * The Sản Phẩm menu offers four axes; this row offered two of them. A shopper following
   * a diameter or material value landed on a narrowed grid with every control reading
   * "all" and nothing naming what had narrowed it — the shape of #43, which is why that
   * issue's recovery link exists (#133).
   */
  it.each([
    ['diameter', `diameter=${DIAMETER_BUCKETS[4].id}`, diameterBucketLabel(DIAMETER_BUCKETS[4])],
    ['material', `material=${MATERIAL_VALUES[0].material}`, viDict.nav.facets.materials.moisture],
  ])('shows the %s a shopper arrived with, rather than "all"', (_axis, search_, label) => {
    search = search_;
    renderFilters();

    expect(screen.getByRole('combobox', { name: label === viDict.nav.facets.materials.moisture
      ? viDict.nav.facets.material
      : viDict.nav.facets.diameter })).toHaveTextContent(label);
  });

  /**
   * A facet name in the menu opens this page with that facet's control focused, via a
   * fragment. The id is read from the same function the menu's href is built from, so a
   * control and the link aiming at it cannot drift — and `expiry` is in there on purpose,
   * since its control carries `?replacement=` and an id built from the query key would be
   * right for three facets and silently wrong for that one.
   */
  it.each(LENS_FACETS.map((facet) => facet.id))('gives %s a control the menu can aim at', (facetId) => {
    search = '';
    const { container } = renderFilters();

    const control = container.querySelector(`#${facetAnchorId(facetId)}`);
    expect(control, `nothing answers #${facetAnchorId(facetId)}`).not.toBeNull();
    // A fragment focuses its target only if the target can take focus.
    expect(control!.tagName.toLowerCase()).toBe('button');
  });

  it('narrows the collection to a diameter the shopper picks', async () => {
    const bucket = DIAMETER_BUCKETS[4];
    renderFilters();

    await userEvent.click(screen.getByRole('combobox', { name: viDict.nav.facets.diameter }));
    await userEvent.click(await screen.findByRole('option', { name: diameterBucketLabel(bucket) }));

    expect(push).toHaveBeenCalledWith(`/vi/collection/colored-lenses?diameter=${bucket.id}`);
  });

  it('narrows the collection to a material the shopper picks', async () => {
    renderFilters();

    await userEvent.click(screen.getByRole('combobox', { name: viDict.nav.facets.material }));
    await userEvent.click(await screen.findByRole('option', { name: viDict.nav.facets.materials.breathable }));

    expect(push).toHaveBeenCalledWith('/vi/collection/colored-lenses?material=Silicone+Hydrogel');
  });

  /**
   * The row must offer exactly what the menu does. Two lists of buckets would drift the
   * first time one was edited, and a shopper would find an option in the menu that the
   * page it opens cannot show them.
   */
  it('offers the same buckets and materials the menu does', async () => {
    renderFilters();

    await userEvent.click(screen.getByRole('combobox', { name: viDict.nav.facets.diameter }));
    const offered = (await screen.findAllByRole('option')).map((o) => o.textContent);

    for (const bucket of DIAMETER_BUCKETS) {
      expect(offered, `the row omits ${bucket.id}`).toContain(diameterBucketLabel(bucket));
    }
  });

  it('filters to a colour the shopper picks', async () => {
    renderFilters();

    await userEvent.click(screen.getByRole('combobox', { name: viDict.filters.color }));
    await userEvent.click(await screen.findByRole('option', { name: viDict.filters.colors.gray }));

    expect(push).toHaveBeenCalledWith('/vi/collection/colored-lenses?color=gray');
  });

  it('treats a blank colour param as no filter', () => {
    search = 'color=';
    renderFilters();

    // `?color=` filters nothing server-side, so it must not add a blank row to the menu.
    expect(screen.queryByRole('button', { name: viDict.filters.clear })).not.toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: viDict.filters.color })).toHaveTextContent(viDict.filters.color);
  });

  /** A family tile can send a set of colours; the control must still say what is applied. */
  it('names a multi-colour filter it has no single option for', () => {
    search = 'color=brown,gray';
    renderFilters();

    expect(screen.getByRole('combobox', { name: viDict.filters.color }))
      .toHaveTextContent(`${viDict.filters.colors.brown} + ${viDict.filters.colors.gray}`);
  });
});
