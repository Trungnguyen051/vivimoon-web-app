import { describe, it, expect, beforeEach } from 'vitest';
import { Suspense } from 'react';
import { act, render, waitFor } from '@testing-library/react';
import SuccessPage from './page';
import { useCartStore } from '@/features/cart/cart-store';
import type { CartLine } from '@/features/cart/cart.types';

// `use(params)` suspends on first render even for an already-resolved
// promise — same pattern as app/[locale]/cart/page.test.tsx.
async function renderSuccessPage() {
  await act(async () => {
    render(
      <Suspense fallback={null}>
        <SuccessPage params={Promise.resolve({ locale: 'en' })} />
      </Suspense>,
    );
    await Promise.resolve();
  });
}

function makeLine(overrides: Partial<CartLine> = {}): CartLine {
  return {
    lineKey: 'existing', productId: 'p0', variantId: 'v0', name: 'Existing',
    sku: 'SKU0', packSize: '30', unitPrice: 25, currency: 'USD', quantity: 1,
    ...overrides,
  };
}

function seedLastOrder(overrides: Record<string, unknown> = {}) {
  sessionStorage.setItem('vivimoon-last-order', JSON.stringify({
    orderId: 'VVM-TEST1', currency: 'USD', value: 25,
    lines: [makeLine()],
    ...overrides,
  }));
}

beforeEach(() => {
  sessionStorage.clear();
  useCartStore.setState({ lines: [], hydrated: true, buyNowLine: null });
});

describe('SuccessPage — Buy Now (Task 12)', () => {
  it('clears the real cart after a normal (non-buy-now) order', async () => {
    useCartStore.getState().add(makeLine());
    seedLastOrder({ isBuyNow: false });

    await renderSuccessPage();

    await waitFor(() => expect(useCartStore.getState().lines).toHaveLength(0));
  });

  it('does not clear the real cart after a buy-now order', async () => {
    useCartStore.getState().add(makeLine());
    seedLastOrder({ isBuyNow: true });

    await renderSuccessPage();

    // Give the mount effect a tick to run, then assert the cart is untouched.
    await waitFor(() => expect(sessionStorage.getItem('vivimoon-last-order')).toBeNull());
    expect(useCartStore.getState().lines).toHaveLength(1);
    expect(useCartStore.getState().lines[0].lineKey).toBe('existing');
  });
});
