import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBox } from './search-box';
import { apiRequest } from '@/lib/api/client';
import { vi as viDict } from '@/lib/i18n/dictionaries/vi';
import { popularSearches } from '@/content/search';

vi.mock('@/lib/api/client', () => ({ apiRequest: vi.fn() }));
const api = vi.mocked(apiRequest);
const t = viDict.search;
const RECENT = 'vivimoon:recent-searches';

const lens = (id: string, price: number) => ({
  id, slug: id, name: `Lens ${id}`, variants: [{ id: `${id}-v`, sku: 's', price, currency: 'VND', stock: 1 }],
});
const found = {
  ok: true as const,
  data: {
    categories: [{ id: 'color:brown', query: 'color=brown', count: 9 }],
    products: [lens('a', 95_000), lens('b', 100_000)],
    total: 24,
  },
};

const box = (props: Partial<Parameters<typeof SearchBox>[0]> = {}) =>
  render(<SearchBox locale="vi" dict={viDict} floating {...props} />);
const field = () => screen.getByRole('searchbox', { name: viDict.common.search });

beforeEach(() => {
  api.mockReset();
  api.mockResolvedValue(found as never);
  localStorage.clear();
});

describe('SearchBox (#260)', () => {
  it('offers the popular keywords before anything is typed', async () => {
    box();
    await userEvent.click(field());
    const links = screen.getAllByRole('link').map((a) => [a.textContent, a.getAttribute('href')]);
    expect(links).toEqual(popularSearches.vi.map((k) => [k, `/vi/collection/all-lenses?q=${encodeURIComponent(k)}`]));
    expect(screen.queryByText(t.recent)).not.toBeInTheDocument();
    expect(api).not.toHaveBeenCalled();
  });

  it('lists this device’s recent searches, and clears them', async () => {
    localStorage.setItem(RECENT, JSON.stringify(['honey brown', 'lens 6 tháng']));
    box();
    await userEvent.click(field());
    expect(screen.getByRole('link', { name: 'honey brown' })).toHaveAttribute('href', '/vi/collection/all-lenses?q=honey%20brown');

    await userEvent.click(screen.getByRole('button', { name: t.clearRecent }));
    expect(screen.queryByText(t.recent)).not.toBeInTheDocument();
    expect(localStorage.getItem(RECENT)).toBe('[]');
  });

  it('reads malformed storage as no recent searches', async () => {
    localStorage.setItem(RECENT, '{"not":"a list"}');
    box();
    await userEvent.click(field());
    expect(screen.queryByText(t.recent)).not.toBeInTheDocument();
  });

  it('suggests categories, lenses and a way to all results once typing pauses', async () => {
    box();
    await userEvent.type(field(), 'nâu');

    expect(await screen.findByRole('link', { name: 'Màu sắc: Nâu (9)' })).toHaveAttribute('href', '/vi/collection/all-lenses?color=brown');
    expect(screen.getByRole('link', { name: /Lens a.*95\.000₫/ })).toHaveAttribute('href', '/vi/product/a');
    expect(screen.getByRole('link', { name: 'Xem tất cả 24 kết quả cho “nâu”' })).toHaveAttribute('href', '/vi/collection/all-lenses?q=n%C3%A2u');
    expect(api).toHaveBeenLastCalledWith('/api/search/suggest?q=n%C3%A2u');
    expect(screen.queryByText(t.popular)).not.toBeInTheDocument();
  });

  it('says so when nothing matches', async () => {
    api.mockResolvedValue({ ok: true, data: { categories: [], products: [], total: 0 } } as never);
    box();
    await userEvent.type(field(), 'zzzz');
    expect(await screen.findByText(t.none.replace('{q}', 'zzzz'))).toBeInTheDocument();
  });

  it('remembers a search when its results are opened, newest first and at most five', async () => {
    localStorage.setItem(RECENT, JSON.stringify(['a', 'b', 'c', 'd', 'Nâu']));
    const onNavigate = vi.fn();
    box({ onNavigate });
    await userEvent.type(field(), 'nâu');
    await userEvent.click(await screen.findByRole('link', { name: /Xem tất cả 24/ }));

    expect(JSON.parse(localStorage.getItem(RECENT)!)).toEqual(['nâu', 'a', 'b', 'c', 'd']);
    expect(onNavigate).toHaveBeenCalled();
  });

  it('submits the typed words to the results listing', () => {
    box();
    expect(screen.getByRole('search')).toHaveAttribute('action', '/vi/collection/all-lenses');
    expect(field()).toHaveAttribute('name', 'q');
  });

  it('is dismissed by Escape', async () => {
    const onDismiss = vi.fn();
    box({ onDismiss });
    await userEvent.type(field(), '{Escape}');
    expect(onDismiss).toHaveBeenCalled();
  });

  it('never lets an older answer replace a newer one', async () => {
    let answerOld: (value: unknown) => void = () => {};
    api.mockImplementationOnce(() => new Promise((resolve) => { answerOld = resolve; }) as never);
    box();
    await userEvent.type(field(), 'nâu');
    await vi.waitFor(() => expect(api).toHaveBeenCalledTimes(1));

    api.mockResolvedValue({ ok: true, data: { categories: [], products: [lens('new', 1)], total: 1 } } as never);
    await userEvent.type(field(), ' xám');
    expect(await screen.findByRole('link', { name: /Lens new/ })).toBeInTheDocument();

    await act(async () => answerOld(found));
    expect(screen.queryByRole('link', { name: /Lens a/ })).not.toBeInTheDocument();
  });

  it('shows its panel in the mobile menu only once the field is used', async () => {
    render(<SearchBox locale="vi" dict={viDict} />);
    expect(screen.queryByText(t.popular)).not.toBeInTheDocument();
    await userEvent.click(field());
    expect(screen.getByText(t.popular)).toBeInTheDocument();
  });
});
