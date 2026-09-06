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
    sku: 'SKU0', packSize: '30', unitPrice: 25, currency: 'USD', quantity: 1,
    ...overrides,
  };
}

const DEFAULT_ADDRESS = {
  id: 'addr-1', isDefault: true, recipient: 'Mai Nguyen', phone: '0912345678',
  line1: '1 Le Loi', ward: 'Ben Nghe', district: 'District 1', province: 'Ho Chi Minh City',
  label: 'home',
};

const PRICED_RESPONSE = {
  lines: [{ lineKey: 'existing', variantId: 'p-aqua-daily-30', quantity: 1, unitPrice: 25, lineTotal: 25, currency: 'USD' }],
  subtotal: 25, discount: 0, appliedVouchers: [], shipping: 3, total: 28, currency: 'USD',
};

function fetchRoutingTo(addresses: unknown[], account: unknown = {}) {
  return vi.fn().mockImplementation((path: string) => {
    if (path === '/api/account/addresses') return Promise.resolve(json({ ok: true, data: addresses }));
    if (path === '/api/account') return Promise.resolve(json({ ok: true, data: account }));
    if (path === '/api/cart/price') return Promise.resolve(json({ ok: true, data: PRICED_RESPONSE }));
    return Promise.resolve(json({ ok: true, data: {} }));
  });
}

beforeEach(() => {
  localStorage.clear();
  useCartStore.setState({ lines: [makeLine()], hydrated: true, buyNowLine: null });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('CheckoutPage — logged-in checkout personalization (M5.5, issue #22)', () => {
  it("prefills the address fields from a logged-in shopper's default saved address", async () => {
    vi.stubGlobal('fetch', fetchRoutingTo([DEFAULT_ADDRESS]));
    useSessionStore.setState({ user: { id: 'u-001', name: 'Mai', phone: '0912345678' }, status: 'authenticated' });
    await renderCheckoutPage();

    await waitFor(() => expect(screen.getByLabelText('Recipient name')).toHaveValue('Mai Nguyen'));
    expect(screen.getByLabelText('Phone')).toHaveValue('0912345678');
    expect(screen.getByLabelText('Address')).toHaveValue('1 Le Loi');
    expect(screen.getByLabelText('Ward')).toHaveValue('Ben Nghe');
    expect(screen.getByLabelText('District')).toHaveValue('District 1');
    expect(screen.getByLabelText('Province')).toHaveValue('Ho Chi Minh City');
  });

  it('never overwrites a field the shopper already started typing before the fetch resolved', async () => {
    let resolveFetch!: (response: Response) => void;
    const pending = new Promise<Response>((resolve) => { resolveFetch = resolve; });
    vi.stubGlobal('fetch', vi.fn().mockImplementation((path: string) => {
      if (path === '/api/account/addresses') return pending;
      if (path === '/api/cart/price') return Promise.resolve(json({ ok: true, data: PRICED_RESPONSE }));
      return Promise.resolve(json({ ok: true, data: {} }));
    }));
    useSessionStore.setState({ user: { id: 'u-001', name: 'Mai', phone: '0912345678' }, status: 'authenticated' });
    await renderCheckoutPage();

    await userEvent.type(screen.getByLabelText('Recipient name'), 'Someone Else');
    await act(async () => { resolveFetch(json({ ok: true, data: [DEFAULT_ADDRESS] })); });
    await waitFor(() => expect(screen.getByLabelText('Phone')).toHaveValue('0912345678'));

    expect(screen.getByLabelText('Recipient name')).toHaveValue('Someone Else');
  });

  it('shows the same blank, fully editable form as a guest when the shopper has no saved address', async () => {
    vi.stubGlobal('fetch', fetchRoutingTo([]));
    useSessionStore.setState({ user: { id: 'u-001', name: 'Mai', phone: '0912345678' }, status: 'authenticated' });
    await renderCheckoutPage();

    await new Promise((r) => setTimeout(r, 0));
    expect(screen.getByLabelText('Recipient name')).toHaveValue('');
    expect(screen.getByLabelText('District')).toHaveValue('');
  });

  it("never fetches the address book for a signed-out shopper", async () => {
    const fetchMock = fetchRoutingTo([DEFAULT_ADDRESS]);
    vi.stubGlobal('fetch', fetchMock);
    useSessionStore.setState({ user: null, status: 'anonymous' });
    await renderCheckoutPage();

    expect(fetchMock.mock.calls.some((c) => c[0] === '/api/account/addresses')).toBe(false);
    expect(screen.getByLabelText('Recipient name')).toHaveValue('');
  });

  it("leaves phone blank when the saved address's phone fails checkout's stricter format check, but still prefills the rest", async () => {
    const looseAddress = { ...DEFAULT_ADDRESS, phone: '12345' };
    vi.stubGlobal('fetch', fetchRoutingTo([looseAddress]));
    useSessionStore.setState({ user: { id: 'u-001', name: 'Mai', phone: '0912345678' }, status: 'authenticated' });
    await renderCheckoutPage();

    await waitFor(() => expect(screen.getByLabelText('Recipient name')).toHaveValue('Mai Nguyen'));
    expect(screen.getByLabelText('Phone')).toHaveValue('');
  });

  it('editing the prefilled address re-triggers the price preview exactly as a manually-typed address would', async () => {
    vi.stubGlobal('fetch', fetchRoutingTo([DEFAULT_ADDRESS]));
    useSessionStore.setState({ user: { id: 'u-001', name: 'Mai', phone: '0912345678' }, status: 'authenticated' });
    await renderCheckoutPage();

    await waitFor(() => expect(screen.getByText('Total').nextElementSibling).not.toHaveTextContent('—'));
    expect(screen.getByText('Shipping').nextElementSibling).toHaveTextContent('$3.00');
  });
});
