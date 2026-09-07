import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { Suspense } from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CheckoutPage from './page';
import { useCartStore } from '@/features/cart/cart-store';
import { useSessionStore } from '@/features/session/session-store';
import type { CartLine } from '@/features/cart/cart.types';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));

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
    sku: 'SKU0', unitPrice: 25, currency: 'USD', quantity: 1,
    ...overrides,
  };
}

const PRICED_RESPONSE = {
  lines: [{ lineKey: 'existing', variantId: 'p-aqua-daily-30', quantity: 1, unitPrice: 25, lineTotal: 25, currency: 'USD' }],
  subtotal: 25, discount: 5, appliedVouchers: [{ code: 'SAVE5', title: 'x', description: 'x', type: 'fixed', value: 5, expiresAt: '2099-01-01', status: 'active' }],
  shipping: 3, total: 23, currency: 'USD',
};

function fetchRoutingTo(pricePreview: unknown) {
  return vi.fn().mockImplementation((path: string) => {
    if (path === '/api/cart/price') return Promise.resolve(json({ ok: true, data: pricePreview }));
    return Promise.resolve(json({ ok: true, data: {} }));
  });
}

beforeEach(() => {
  localStorage.clear();
  useCartStore.setState({ lines: [makeLine()], hydrated: true, buyNowLine: null });
  useSessionStore.setState({ user: null, status: 'anonymous' });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('CheckoutPage — live price preview (M5.4, issue #21)', () => {
  it('shows the total as pending, never a wrong or zero number, until the address is complete', async () => {
    vi.stubGlobal('fetch', fetchRoutingTo(PRICED_RESPONSE));
    await renderCheckoutPage();

    await userEvent.type(screen.getByLabelText('Recipient name'), 'Alice Nguyen');
    await userEvent.type(screen.getByLabelText('Email'), 'alice@example.com');
    await userEvent.type(screen.getByLabelText('Phone'), '0912345678');
    await userEvent.type(screen.getByLabelText('Address'), '1 Le Loi');
    await userEvent.type(screen.getByLabelText('Ward'), 'Ben Nghe');
    // District/Province left blank — not complete enough to quote yet.

    expect(screen.getByText('Total').nextElementSibling).toHaveTextContent('—');
    expect(screen.getByText('Shipping').nextElementSibling).toHaveTextContent('—');
  });

  it('fires a price request once province and district are filled, and shows the quoted shipping fee, discount, and total', async () => {
    vi.stubGlobal('fetch', fetchRoutingTo(PRICED_RESPONSE));
    await renderCheckoutPage();

    await userEvent.type(screen.getByLabelText('District'), 'District 1');
    await userEvent.type(screen.getByLabelText('Province'), 'Ho Chi Minh City');

    await waitFor(() => expect(screen.getByText('Total').nextElementSibling).not.toHaveTextContent('—'));
    expect(screen.getByText('Shipping').nextElementSibling).toHaveTextContent('$3.00');
    expect(screen.getByText('Discount').nextElementSibling).toHaveTextContent('$5.00');
    expect(screen.getByText('Total').nextElementSibling).toHaveTextContent('$23.00');
  });

  it('adds no delivery-method picker — only the existing payment method picker\'s three buttons render', async () => {
    vi.stubGlobal('fetch', fetchRoutingTo(PRICED_RESPONSE));
    await renderCheckoutPage();
    await userEvent.type(screen.getByLabelText('District'), 'District 1');
    await userEvent.type(screen.getByLabelText('Province'), 'Ho Chi Minh City');
    await waitFor(() => expect(screen.getByText('Total').nextElementSibling).not.toHaveTextContent('—'));

    expect(screen.getAllByRole('button', { name: /pay|standard|express/i })).toHaveLength(3);
  });

  it("placing the order still re-prices server-side — the preview is never the value order placement trusts", async () => {
    const fetchMock = vi.fn().mockImplementation((path: string) => {
      if (path === '/api/cart/price') return Promise.resolve(json({ ok: true, data: PRICED_RESPONSE }));
      if (path === '/api/orders') {
        return Promise.resolve(json({
          ok: true,
          data: { id: 'o1', code: 'VVM-X', status: 'placed', totals: { subtotal: 25, discount: 5, shipping: 3, total: 23, currency: 'USD' } },
        }));
      }
      return Promise.resolve(json({ ok: true, data: {} }));
    });
    vi.stubGlobal('fetch', fetchMock);
    await renderCheckoutPage();

    await userEvent.type(screen.getByLabelText('Recipient name'), 'Alice Nguyen');
    await userEvent.type(screen.getByLabelText('Email'), 'alice@example.com');
    await userEvent.type(screen.getByLabelText('Phone'), '0912345678');
    await userEvent.type(screen.getByLabelText('Address'), '1 Le Loi');
    await userEvent.type(screen.getByLabelText('Ward'), 'Ben Nghe');
    await userEvent.type(screen.getByLabelText('District'), 'District 1');
    await userEvent.type(screen.getByLabelText('Province'), 'Ho Chi Minh City');
    await waitFor(() => expect(screen.getByText('Total').nextElementSibling).not.toHaveTextContent('—'));

    await userEvent.click(screen.getByRole('button', { name: 'Place order' }));
    await waitFor(() => expect(fetchMock.mock.calls.some((c) => c[0] === '/api/orders')).toBe(true));

    const [, init] = fetchMock.mock.calls.find((c) => c[0] === '/api/orders')!;
    const body = JSON.parse(init.body as string);
    // The order request carries only lines/address/email/paymentMethod —
    // no client-computed total ever rides along with it.
    expect(body).not.toHaveProperty('total');
    expect(body).not.toHaveProperty('subtotal');
  });
});
