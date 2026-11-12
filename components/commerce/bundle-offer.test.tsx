import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BundleOffer } from './bundle-offer';
import { apiRequest } from '@/lib/api/client';
import { useCartStore } from '@/features/cart/cart-store';
import { useBuyBoxStore } from '@/features/cart/buy-box-store';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { products, accessories } from '@/content/mock';
import type { PriceCartRequest, PricedCart } from '@/lib/api/schemas/cart';

vi.mock('@/lib/api/client', () => ({ apiRequest: vi.fn() }));
const mockedApiRequest = vi.mocked(apiRequest);

const dict = getDictionary('vi');
const lens = products.find((p) => p.id === 'p-aqua-daily')!;
const bundleAccessories = accessories.filter((a) => lens.bundle!.accessoryIds.includes(a.id));
const singleLens = {
  lineKey: 'p-aqua-daily-30~single~sph.-3.00', productId: lens.id, variantId: 'p-aqua-daily-30', name: lens.name,
  sku: 'AQD-30', unitPrice: 25, currency: 'USD' as const, quantity: 1, purchaseUnit: 'single' as const, rx: { sph: -3 },
};

// The server's answer, keyed off what was asked: the full tagged set saves 3.
function priced(body: PriceCartRequest): PricedCart {
  const complete = body.lines.length === 3 && body.lines.every((l) => l.bundle === lens.id);
  const subtotal = { 3: 30, 2: 28 }[body.lines.length] ?? 25;
  return {
    lines: [], unavailableLines: [], subtotal, bundleSaving: complete ? 3 : 0, bundledSubtotal: subtotal - (complete ? 3 : 0),
    discount: 0, appliedVouchers: [], shipping: 0, total: subtotal, currency: 'USD',
  };
}

beforeEach(() => {
  useCartStore.setState({ lines: [], hydrated: true, buyNowLine: null });
  useBuyBoxStore.setState({ line: singleLens });
  mockedApiRequest.mockReset();
  mockedApiRequest.mockImplementation(async (_url, init) => ({ ok: true, data: priced(init!.body as PriceCartRequest) }) as never);
});

const show = () => render(<BundleOffer product={lens} accessories={bundleAccessories} locale="en" dict={dict} />);

describe('BundleOffer', () => {
  it('shows the Bundle price against the separate total while every item is ticked', async () => {
    show();
    expect(await screen.findByText('$27.00')).toBeTruthy();
    expect(screen.getByText('$30.00').className).toContain('line-through');
  });

  it('drops to separate prices when an item is unticked', async () => {
    show();
    await screen.findByText('$27.00');
    fireEvent.click(screen.getByRole('checkbox', { name: /Nước nhỏ mắt/ }));
    expect(await screen.findByText('$28.00')).toBeTruthy();
    expect(screen.queryByText('$30.00')).toBeNull();
    const last = mockedApiRequest.mock.calls.at(-1)![1]!.body as PriceCartRequest;
    expect(last.lines.map((l) => l.variantId)).toEqual(['p-aqua-daily-30', 'a-khay-dung-set']);
    expect(last.lines.every((l) => !l.bundle)).toBe(true);
  });

  it('adds the ticked items, the lens with the buy box unit and power, as one Bundle', async () => {
    show();
    fireEvent.click(screen.getByRole('button', { name: dict.pdp.bundle.add }));
    const lines = useCartStore.getState().lines;
    expect(lines.map((l) => [l.variantId, l.bundle, l.quantity])).toEqual([
      ['p-aqua-daily-30', lens.id, 1], ['a-nuoc-nho-mat-15', lens.id, 1], ['a-khay-dung-set', lens.id, 1],
    ]);
    expect(lines[0]).toMatchObject({ purchaseUnit: 'single', rx: { sph: -3 } });
  });

  it('adds a partial pick as ordinary lines', () => {
    show();
    fireEvent.click(screen.getByRole('checkbox', { name: /Khay đựng/ }));
    fireEvent.click(screen.getByRole('button', { name: dict.pdp.bundle.addSome }));
    expect(useCartStore.getState().lines.map((l) => [l.variantId, l.bundle])).toEqual([
      ['p-aqua-daily-30', undefined], ['a-nuoc-nho-mat-15', undefined],
    ]);
  });
});
