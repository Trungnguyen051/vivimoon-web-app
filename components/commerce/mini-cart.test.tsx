import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MiniCart } from './mini-cart';
import { apiRequest } from '@/lib/api/client';
import { useCartStore } from '@/features/cart/cart-store';
import { useMiniCartStore } from '@/features/cart/mini-cart-store';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { accessories } from '@/content/mock';
import { lineKey } from '@/lib/cart/line-key';
import type { CartLine, PriceCartRequest, PricedCart } from '@/lib/api/schemas/cart';

vi.mock('@/lib/api/client', () => ({ apiRequest: vi.fn() }));
const mockedApiRequest = vi.mocked(apiRequest);

const dict = getDictionary('vi');

const sandkiss = (left: number, right: number): CartLine => ({
  lineKey: lineKey('v-sandkiss', { left: { sph: left }, right: { sph: right } }), productId: 'p-sandkiss', variantId: 'v-sandkiss', name: 'Sandkiss', sku: 'SK', unitPrice: 190_000,
  currency: 'VND', quantity: 1, purchaseUnit: 'pair', lensLine: 'moisture', replacement: 'monthly',
  rx: { sameBothEyes: false, left: { sph: left }, right: { sph: right } },
});

// 190.000 a line: under the 300.000 free-shipping tier.
function priced(body: PriceCartRequest): PricedCart {
  const lines = body.lines.map((l) => ({
    lineKey: l.lineKey, variantId: l.variantId, quantity: l.quantity, unitPrice: 190_000, lineTotal: 190_000 * l.quantity, currency: 'VND' as const,
  }));
  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  return {
    lines, unavailableLines: [], subtotal, discount: 0, appliedVouchers: [], shipping: 0, total: subtotal, currency: 'VND',
    nextSpendTier: subtotal < 300_000 ? { threshold: 300_000, reward: 'freeShipping', remaining: 300_000 - subtotal } : undefined,
  };
}

beforeEach(() => {
  mockedApiRequest.mockReset();
  mockedApiRequest.mockImplementation(async (_url, init) => ({ ok: true, data: priced(init!.body as PriceCartRequest) }) as never);
});

const open = (lines: CartLine[], added: CartLine[] = lines.slice(0, 1)) => {
  useCartStore.setState({ lines, hydrated: true, buyNowLine: null });
  useMiniCartStore.setState({ open: true, added });
  render(<MiniCart locale="vi" dict={dict} accessories={accessories} />);
};

describe('MiniCart', () => {
  it('stays closed until the cart-UI signal opens it', () => {
    useCartStore.setState({ lines: [sandkiss(-2.5, -3)], hydrated: true, buyNowLine: null });
    useMiniCartStore.setState({ open: false, added: [] });
    render(<MiniCart locale="vi" dict={dict} accessories={accessories} />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('confirms what was added and shows the way to free shipping', async () => {
    open([sandkiss(-2.5, -3)]);
    const drawer = screen.getByRole('dialog');
    expect(within(drawer).getByText('Đã thêm Sandkiss (L −2.50 · R −3.00) vào giỏ')).toBeTruthy();
    expect(within(drawer).getByText('Sandkiss · Khoá ẩm 1 tháng')).toBeTruthy();
    expect(await within(drawer).findByText('Mua thêm 110.000₫ để được Freeship')).toBeTruthy();
    expect(within(drawer).getByRole('heading', { name: dict.miniCart.upsell })).toBeTruthy();
    expect(within(drawer).getByRole('link', { name: dict.cart.checkout })).toBeTruthy();
    expect(within(drawer).getByRole('link', { name: dict.miniCart.viewCart })).toBeTruthy();
  });

  it('adds a suggested accessory in one tap', async () => {
    open([sandkiss(-2.5, -3)]);
    fireEvent.click(await screen.findByRole('button', { name: 'Thêm Nước nhỏ mắt 15ml vào giỏ' }));
    expect(useCartStore.getState().lines.map((l) => l.variantId)).toEqual(['v-sandkiss', 'a-nuoc-nho-mat-15']);
    // The tray is the 500.000₫ tier's Gift, so it is never suggested.
    expect(screen.queryByRole('button', { name: /Khay đựng/ })).toBeNull();
  });

  it('re-keys an edited line and merges it into an identical one', () => {
    open([sandkiss(-2.5, -3), sandkiss(-2.5, -2.5)]);
    const [, second] = screen.getAllByRole('combobox', { name: dict.rx.rightEye });
    fireEvent.change(second, { target: { value: '-3' } });
    const lines = useCartStore.getState().lines;
    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatchObject({ quantity: 2, rx: { left: { sph: -2.5 }, right: { sph: -3 } } });
  });

  it('switches a pair to a single lens, keeping the left power', () => {
    open([sandkiss(-2.5, -3)]);
    fireEvent.change(screen.getByRole('combobox', { name: dict.pdp.buyAs }), { target: { value: 'single' } });
    expect(useCartStore.getState().lines[0]).toMatchObject({ purchaseUnit: 'single', rx: { sph: -2.5 }, unitPrice: 95_000 });
  });
});
