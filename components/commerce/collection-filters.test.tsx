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
