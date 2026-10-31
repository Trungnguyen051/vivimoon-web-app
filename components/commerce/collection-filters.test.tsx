import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CollectionFilters } from './collection-filters';
import { vi as viDict } from '@/lib/i18n/dictionaries/vi';

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
