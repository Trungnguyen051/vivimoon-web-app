import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getDictionary } from '@/lib/i18n/dictionaries';
import type { Product } from '@/lib/api/schemas/catalog';
import { FavoritesGrid } from './favorites-grid';

const push = vi.fn();
const add = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));
vi.mock('@/features/cart/use-cart', () => ({ useCart: () => ({ add }) }));

const dict = getDictionary('en').favorites;
const mk = (id: string, requiresRx: boolean) => ({
  id, slug: `s-${id}`, name: `Lens ${id}`, requiresRx, images: ['/a.jpg'],
  variants: [{ id: `v-${id}`, sku: `sku-${id}`, price: 100, currency: 'VND', color: 'x', colorLabel: 'Brown' }],
}) as unknown as Product;

afterEach(() => { vi.unstubAllGlobals(); vi.clearAllMocks(); });

describe('FavoritesGrid', () => {
  it('heart removes the card via DELETE', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true, data: null }), { headers: { 'content-type': 'application/json' } }));
    vi.stubGlobal('fetch', fetchMock);
    render(<FavoritesGrid initialProducts={[mk('1', false)]} locale="en" dict={dict} />);
    await userEvent.click(screen.getByRole('button', { name: dict.remove }));
    expect(fetchMock.mock.calls[0][0]).toBe('/api/account/favorites/1');
    expect(screen.queryByText('Lens 1')).toBeNull();
  });

  it('Add to cart adds an Rx-free product, navigates for an Rx one', async () => {
    render(<FavoritesGrid initialProducts={[mk('1', false), mk('2', true)]} locale="en" dict={dict} />);
    const [free, rx] = screen.getAllByRole('button', { name: dict.addToCart });
    await userEvent.click(free);
    expect(add).toHaveBeenCalledWith(expect.objectContaining({ productId: '1', variantId: 'v-1' }));
    expect(push).not.toHaveBeenCalled();
    expect(free).toHaveTextContent(dict.added);
    await userEvent.click(rx);
    expect(add).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledWith('/en/product/s-2');
  });

  it('Buy now opens the product page', async () => {
    render(<FavoritesGrid initialProducts={[mk('1', false)]} locale="en" dict={dict} />);
    await userEvent.click(screen.getByRole('button', { name: dict.buyNow }));
    expect(push).toHaveBeenCalledWith('/en/product/s-1');
  });
});
