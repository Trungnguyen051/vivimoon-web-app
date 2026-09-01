import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Suspense } from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import { apiRequest } from '@/lib/api/client';
import { useCartStore } from '@/features/cart/cart-store';
import CartPage from './page';
import type { CartLine } from '@/features/cart/cart.types';
import type { PricedCart } from '@/lib/api/schemas/cart';

vi.mock('@/lib/api/client', () => ({ apiRequest: vi.fn() }));
const mockedApiRequest = vi.mocked(apiRequest);

const track = vi.fn();
vi.mock('@/lib/analytics/use-analytics', () => ({ useAnalytics: () => ({ track }) }));

function makeLine(overrides: Partial<CartLine> = {}): CartLine {
  return {
    lineKey: 'k1', productId: 'p1', variantId: 'v1', name: 'Aqua', sku: 'SKU1',
    packSize: '30', unitPrice: 25, currency: 'USD', quantity: 1,
    ...overrides,
  };
}

// `use(params)` suspends on the first render because a freshly-created
// promise (even one already resolved) has not settled its microtask yet.
// Rendering inside `act` and flushing a microtask lets the resolved value
// land before assertions run.
async function renderCartPage() {
  let utils!: ReturnType<typeof render>;
  await act(async () => {
    utils = render(
      <Suspense fallback={null}>
        <CartPage params={Promise.resolve({ locale: 'en' })} />
      </Suspense>,
    );
    await Promise.resolve();
  });
  return utils;
}

beforeEach(() => {
  mockedApiRequest.mockReset();
  track.mockReset();
  useCartStore.setState({ lines: [], hydrated: false });
});

describe('CartPage', () => {
  it('matches each line total back to the cart by lineKey, not by array position', async () => {
    const lineA = makeLine({ lineKey: 'kA', quantity: 1 });
    const lineB = makeLine({ lineKey: 'kB', quantity: 2 });
    // Response order deliberately differs from the cart's line order, so a
    // positional (index-based) match would attach the wrong total to each line.
    const priced: PricedCart = {
      lines: [
        { lineKey: 'kB', variantId: lineB.variantId, quantity: 2, unitPrice: 25, lineTotal: 999, currency: 'USD' },
        { lineKey: 'kA', variantId: lineA.variantId, quantity: 1, unitPrice: 25, lineTotal: 111, currency: 'USD' },
      ],
      subtotal: 1110, discount: 0, appliedVouchers: [], shipping: 0, total: 1110, currency: 'USD',
    };
    mockedApiRequest.mockResolvedValue({ ok: true, data: priced });
    useCartStore.setState({ lines: [lineA, lineB], hydrated: true });

    await renderCartPage();

    await waitFor(() => expect(screen.getByText('$111.00')).toBeInTheDocument(), { timeout: 2000 });
    expect(screen.getByText('$999.00')).toBeInTheDocument();
  });

  it('fires view_cart exactly once per cart view, even through a later re-price', async () => {
    const line = makeLine();
    const priced: PricedCart = {
      lines: [{ lineKey: line.lineKey, variantId: line.variantId, quantity: 1, unitPrice: 25, lineTotal: 25, currency: 'USD' }],
      subtotal: 25, discount: 0, appliedVouchers: [], shipping: 0, total: 25, currency: 'USD',
    };
    mockedApiRequest.mockResolvedValue({ ok: true, data: priced });
    useCartStore.setState({ lines: [line], hydrated: true });

    await renderCartPage();

    await waitFor(() => expect(track).toHaveBeenCalledTimes(1), { timeout: 2000 });
    expect(track).toHaveBeenCalledWith({
      name: 'view_cart',
      params: { currency: 'USD', value: 25, items: expect.any(Array) },
    });

    // A rapid quantity change re-prices the cart. That must not fire a second view_cart.
    const line2 = makeLine({ quantity: 2 });
    const priced2: PricedCart = {
      lines: [{ lineKey: line2.lineKey, variantId: line2.variantId, quantity: 2, unitPrice: 25, lineTotal: 50, currency: 'USD' }],
      subtotal: 50, discount: 0, appliedVouchers: [], shipping: 0, total: 50, currency: 'USD',
    };
    mockedApiRequest.mockResolvedValue({ ok: true, data: priced2 });
    useCartStore.setState({ lines: [line2] });

    // $50.00 shows up in the line item AND the order summary (subtotal + total)
    // once re-priced — wait for at least one occurrence rather than a single unique match.
    await waitFor(() => expect(screen.getAllByText('$50.00').length).toBeGreaterThan(0), { timeout: 2000 });
    expect(track).toHaveBeenCalledTimes(1);
  });

  it('shows a loading skeleton, not the empty state, before hydration completes', async () => {
    useCartStore.setState({ lines: [], hydrated: false });
    await renderCartPage();
    expect(screen.queryByText('Your cart is empty')).not.toBeInTheDocument();
  });
});
