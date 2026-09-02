import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { Suspense } from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CheckoutPage from './page';
import { useCartStore } from '@/features/cart/cart-store';
import type { CartLine } from '@/features/cart/cart.types';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));

// `use(params)` suspends on first render even for an already-resolved
// promise — same pattern as app/[locale]/cart/page.test.tsx.
async function renderCheckoutPage() {
  let utils!: ReturnType<typeof render>;
  await act(async () => {
    utils = render(
      <Suspense fallback={null}>
        <CheckoutPage params={Promise.resolve({ locale: 'en' })} />
      </Suspense>,
    );
    await Promise.resolve();
  });
  return utils;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

function makeLine(overrides: Partial<CartLine> = {}): CartLine {
  return {
    lineKey: 'existing', productId: 'p0', variantId: 'p-aqua-daily-30', name: 'Existing',
    sku: 'SKU0', packSize: '30', unitPrice: 25, currency: 'USD', quantity: 1,
    ...overrides,
  };
}

const ORDER_RESPONSE = {
  id: 'order-1', code: 'VVM-TEST1', status: 'placed', userId: undefined,
  totals: { subtotal: 22, discount: 0, shipping: 0, total: 22, currency: 'USD' },
};

async function fillRequiredFields() {
  await userEvent.type(screen.getByLabelText('Recipient name'), 'Alice Nguyen');
  await userEvent.type(screen.getByLabelText('Email'), 'alice@example.com');
  await userEvent.type(screen.getByLabelText('Phone'), '0912345678');
  await userEvent.type(screen.getByLabelText('Address'), '1 Le Loi');
  await userEvent.type(screen.getByLabelText('Ward'), 'Ben Nghe');
  await userEvent.type(screen.getByLabelText('District'), 'District 1');
  await userEvent.type(screen.getByLabelText('Province'), 'Ho Chi Minh City');
}

beforeEach(() => {
  localStorage.clear();
  useCartStore.setState({ lines: [], hydrated: true, buyNowLine: null });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('CheckoutPage — Buy Now (Task 12)', () => {
  it('submits only the buyNowLine, leaving a non-empty real cart untouched', async () => {
    useCartStore.getState().add(makeLine());
    useCartStore.getState().setBuyNowLine(makeLine({ lineKey: 'buy-now-line', variantId: 'p-hazel-monthly-brown-30', sku: 'SKU-BN' }));

    const fetchMock = vi.fn().mockResolvedValue(json({ ok: true, data: ORDER_RESPONSE }));
    vi.stubGlobal('fetch', fetchMock);

    await renderCheckoutPage();

    // buyNowLine is consumed (and cleared from the store) on mount.
    expect(useCartStore.getState().buyNowLine).toBeNull();
    // The real cart is never read into a buy-now checkout.
    expect(useCartStore.getState().lines).toHaveLength(1);
    expect(useCartStore.getState().lines[0].lineKey).toBe('existing');

    await fillRequiredFields();
    await userEvent.click(screen.getByRole('button', { name: 'Place order' }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [path, init] = fetchMock.mock.calls[0];
    expect(path).toBe('/api/orders');
    const body = JSON.parse(init.body as string);
    expect(body.lines).toHaveLength(1);
    expect(body.lines[0].lineKey).toBe('buy-now-line');

    // The real cart still has its one pre-existing line — untouched by submit.
    expect(useCartStore.getState().lines).toHaveLength(1);
    expect(useCartStore.getState().lines[0].lineKey).toBe('existing');
  });

  it('abandoning a buy-now checkout (no submit) leaves the real cart intact', async () => {
    useCartStore.getState().add(makeLine());
    useCartStore.getState().setBuyNowLine(makeLine({ lineKey: 'buy-now-line' }));

    const { unmount } = await renderCheckoutPage();
    unmount();

    expect(useCartStore.getState().lines).toHaveLength(1);
    expect(useCartStore.getState().lines[0].lineKey).toBe('existing');
  });

  it('falls back to the real cart lines when no buyNowLine is set', async () => {
    useCartStore.getState().add(makeLine());

    const fetchMock = vi.fn().mockResolvedValue(json({ ok: true, data: ORDER_RESPONSE }));
    vi.stubGlobal('fetch', fetchMock);

    await renderCheckoutPage();
    await fillRequiredFields();
    await userEvent.click(screen.getByRole('button', { name: 'Place order' }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(body.lines).toHaveLength(1);
    expect(body.lines[0].lineKey).toBe('existing');
  });
});
