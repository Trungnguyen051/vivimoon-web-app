import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { Suspense } from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CheckoutView } from './checkout-view';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { useCartStore } from '@/features/cart/cart-store';
import { useSessionStore } from '@/features/session/session-store';
import type { CartLine } from '@/features/cart/cart.types';

const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push, refresh: vi.fn() }) }));

async function renderCheckoutPage() {
  let utils!: ReturnType<typeof render>;
  await act(async () => {
    utils = render(
      <Suspense fallback={null}>
        <CheckoutView locale="en" dict={getDictionary('en')} />
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
    sku: 'SKU0', unitPrice: 125_000, currency: 'VND', quantity: 1,
    ...overrides,
  };
}

const HOME = {
  id: 'addr-1', isDefault: true, recipient: 'Mai Nguyen', phone: '0912345678',
  line1: '1 Le Loi', ward: 'Ben Nghe', district: 'District 1', province: 'Ho Chi Minh City', label: 'home',
};
const OFFICE = {
  id: 'addr-2', isDefault: false, recipient: 'Mai Nguyen', phone: '0912345678',
  line1: '22 Lang Ha', ward: 'Lang Ha', district: 'Dong Da', province: 'Ha Noi', label: 'office',
};
const NEW = {
  id: 'addr-3', isDefault: false, recipient: 'Mai Nguyen', phone: '0912345678',
  line1: '5 Hang Bai', ward: 'Hang Bai', district: 'Hoan Kiem', province: 'Ha Noi', label: 'home',
};

const PRICED = {
  lines: [{ lineKey: 'existing', variantId: 'p-aqua-daily-30', quantity: 1, unitPrice: 125_000, lineTotal: 125_000, currency: 'VND' }],
  unavailableLines: [],
  subtotal: 125_000, discount: 0, appliedVouchers: [], shipping: 15_000, total: 140_000, currency: 'VND',
};
const ORDER = { id: 'o1', code: 'VVM-X', status: 'placed', payment: { method: 'cod', status: 'pending' }, totals: { total: 140_000, currency: 'VND' } };

/** Routes each request by path and method; `book` is the address book the API holds. */
function api(book: unknown[]) {
  return vi.fn().mockImplementation((path: string, init?: RequestInit) => {
    const method = init?.method ?? 'GET';
    if (path === '/api/account/addresses' && method === 'POST') return Promise.resolve(json({ ok: true, data: [...book, NEW] }));
    if (path.startsWith('/api/account/addresses/') && method === 'PATCH') {
      const patch = JSON.parse(init!.body as string);
      return Promise.resolve(json({ ok: true, data: book.map((a) => ((a as { id: string }).id === path.split('/').pop() ? { ...(a as object), ...patch } : a)) }));
    }
    if (path === '/api/account/addresses') return Promise.resolve(json({ ok: true, data: book }));
    if (path === '/api/account') return Promise.resolve(json({ ok: true, data: { preferredPaymentMethod: 'cod' } }));
    if (path === '/api/loyalty') return Promise.resolve(json({ ok: true, data: { balance: 320, history: [] } }));
    if (path === '/api/cart/price') return Promise.resolve(json({ ok: true, data: PRICED }));
    if (path === '/api/orders') return Promise.resolve(json({ ok: true, data: ORDER }));
    if (path === '/api/auth/logout') return Promise.resolve(json({ ok: true, data: null }));
    return Promise.resolve(json({ ok: true, data: {} }));
  });
}

function orderBody(fetchMock: ReturnType<typeof api>) {
  const [, init] = fetchMock.mock.calls.find((c) => c[0] === '/api/orders')!;
  return JSON.parse(init.body as string);
}

function signIn() {
  useSessionStore.setState({ user: { id: 'u-001', name: 'Mai Nguyen', phone: '0912345678', email: 'mai@example.vn' }, status: 'authenticated' });
}

beforeEach(() => {
  localStorage.clear();
  push.mockClear();
  useCartStore.setState({ lines: [makeLine()], hydrated: true, buyNowLine: null });
  useSessionStore.setState({ user: null, status: 'anonymous' });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Checkout — guest', () => {
  it('shows the optional sign-in prompt and the delivery-details form, never the address book', async () => {
    const fetchMock = api([HOME]);
    vi.stubGlobal('fetch', fetchMock);
    await renderCheckoutPage();

    expect(screen.getByText('Optional - you can still order right away')).toBeInTheDocument();
    for (const name of ['Google', 'Zalo', 'Sign in']) {
      expect(screen.getByRole('link', { name })).toHaveAttribute('href', `/en/sign-in?next=${encodeURIComponent('/en/checkout')}`);
    }
    expect(screen.getByRole('heading', { name: 'Delivery details' })).toBeInTheDocument();
    expect(screen.getByLabelText('Email (optional)')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Zalo' })).toBeChecked();
    expect(screen.queryByText(/^Hi,/)).not.toBeInTheDocument();
    expect(fetchMock.mock.calls.some((c) => String(c[0]).startsWith('/api/account'))).toBe(false);
  });

  it('places a COD order with no email, sending the chosen channel and note', async () => {
    const fetchMock = api([]);
    vi.stubGlobal('fetch', fetchMock);
    await renderCheckoutPage();

    await userEvent.type(screen.getByLabelText('Full name'), 'Alice Nguyen');
    await userEvent.type(screen.getByLabelText('Phone'), '0912345678');
    await userEvent.type(screen.getByLabelText('Province / City'), 'Ho Chi Minh City');
    await userEvent.type(screen.getByLabelText('District'), 'District 1');
    await userEvent.type(screen.getByLabelText('Ward'), 'Ben Nghe');
    await userEvent.type(screen.getByLabelText('Street address'), '1 Le Loi');
    await userEvent.type(screen.getByLabelText('Order note'), 'Office hours');
    await userEvent.click(screen.getByRole('radio', { name: 'SMS' }));
    await userEvent.click(screen.getByRole('radio', { name: /Cash on delivery/ }));
    await userEvent.click(screen.getByRole('button', { name: /Place order/ }));

    await waitFor(() => expect(fetchMock.mock.calls.some((c) => c[0] === '/api/orders')).toBe(true));
    const body = orderBody(fetchMock);
    expect(body).not.toHaveProperty('email');
    expect(body).toMatchObject({ paymentMethod: 'cod', notificationChannel: 'sms', note: 'Office hours' });
    await waitFor(() => expect(push).toHaveBeenCalledWith('/en/checkout/success'));
  });

  it('asks for an email when the shopper picks the email channel', async () => {
    vi.stubGlobal('fetch', api([]));
    await renderCheckoutPage();
    await userEvent.click(screen.getByRole('radio', { name: 'Email' }));
    await userEvent.click(screen.getByRole('button', { name: /Place order/ }));
    expect(await screen.findByText('Enter an email to get updates by email')).toBeInTheDocument();
  });
});

describe('Checkout — member', () => {
  it('greets the member with their points, and drops the sign-in prompt', async () => {
    vi.stubGlobal('fetch', api([HOME]));
    signIn();
    await renderCheckoutPage();

    expect(await screen.findByText('Hi, Mai Nguyen')).toBeInTheDocument();
    expect(await screen.findByText(/320 points/)).toBeInTheDocument();
    expect(screen.queryByText('Optional - you can still order right away')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Delivery address' })).toBeInTheDocument();
  });

  it('pre-selects the default Address card, tagged Default', async () => {
    vi.stubGlobal('fetch', api([OFFICE, HOME]));
    signIn();
    await renderCheckoutPage();

    const home = await screen.findByRole('radio', { name: /Mai Nguyen · 0912345678.*Default.*1 Le Loi/ });
    expect(home).toBeChecked();
    expect(screen.getByRole('radio', { name: /22 Lang Ha.*\(Office\)/ })).not.toBeChecked();
  });

  it('ships to the Address card the member picks', async () => {
    const fetchMock = api([HOME, OFFICE]);
    vi.stubGlobal('fetch', fetchMock);
    signIn();
    await renderCheckoutPage();

    const office = await screen.findByRole('radio', { name: /22 Lang Ha/ });
    await userEvent.click(office);
    expect(office).toBeChecked();
    await waitFor(() => expect(screen.getByRole('button', { name: /Place order/ })).not.toBeDisabled());
    await userEvent.click(screen.getByRole('button', { name: /Place order/ }));

    await waitFor(() => expect(fetchMock.mock.calls.some((c) => c[0] === '/api/orders')).toBe(true));
    const body = orderBody(fetchMock);
    expect(body.address).toMatchObject({ line1: '22 Lang Ha', district: 'Dong Da', province: 'Ha Noi', label: 'office' });
    // The member's account email rides along; their channel defaults to Zalo.
    expect(body).toMatchObject({ email: 'mai@example.vn', notificationChannel: 'zalo', paymentMethod: 'cod' });
  });

  it('adds a new address inline and picks it', async () => {
    const fetchMock = api([HOME]);
    vi.stubGlobal('fetch', fetchMock);
    signIn();
    await renderCheckoutPage();

    await userEvent.click(await screen.findByRole('button', { name: '+ Add a new address' }));
    expect(screen.getByLabelText('Full name')).toHaveValue('');
    await userEvent.type(screen.getByLabelText('Full name'), NEW.recipient);
    await userEvent.type(screen.getByLabelText('Phone'), NEW.phone);
    await userEvent.type(screen.getByLabelText('Province / City'), NEW.province);
    await userEvent.type(screen.getByLabelText('District'), NEW.district);
    await userEvent.type(screen.getByLabelText('Ward'), NEW.ward);
    await userEvent.type(screen.getByLabelText('Street address'), NEW.line1);
    await userEvent.click(screen.getByRole('button', { name: 'Save address' }));

    const post = await waitFor(() => {
      const call = fetchMock.mock.calls.find((c) => c[0] === '/api/account/addresses' && c[1]?.method === 'POST');
      expect(call).toBeDefined();
      return call!;
    });
    expect(JSON.parse(post[1].body as string)).toMatchObject({ line1: '5 Hang Bai', label: 'home' });
    expect(await screen.findByRole('radio', { name: /5 Hang Bai/ })).toBeChecked();
    expect(screen.getByRole('radio', { name: /1 Le Loi/ })).not.toBeChecked();
  });

  it('edits a saved address inline with "Edit"', async () => {
    const fetchMock = api([HOME]);
    vi.stubGlobal('fetch', fetchMock);
    signIn();
    await renderCheckoutPage();

    await userEvent.click(await screen.findByRole('button', { name: 'Edit: 1 Le Loi' }));
    expect(screen.getByLabelText('Street address')).toHaveValue('1 Le Loi');
    await userEvent.clear(screen.getByLabelText('Street address'));
    await userEvent.type(screen.getByLabelText('Street address'), '9 Le Loi');
    await userEvent.click(screen.getByRole('button', { name: 'Save address' }));

    await waitFor(() => expect(fetchMock.mock.calls.some((c) => c[0] === '/api/account/addresses/addr-1' && c[1]?.method === 'PATCH')).toBe(true));
    expect(await screen.findByText(/9 Le Loi/)).toBeInTheDocument();
  });

  it('shows the inline address form when the member has no saved address', async () => {
    vi.stubGlobal('fetch', api([]));
    signIn();
    await renderCheckoutPage();
    expect(await screen.findByLabelText('Full name')).toHaveValue('');
    expect(screen.queryByRole('radio', { name: /0912345678/ })).not.toBeInTheDocument();
  });

  it('"Not you?" signs out and falls back to the guest form', async () => {
    const fetchMock = api([HOME]);
    vi.stubGlobal('fetch', fetchMock);
    signIn();
    await renderCheckoutPage();

    await userEvent.click(await screen.findByRole('button', { name: 'Not you?' }));
    expect(fetchMock.mock.calls.some((c) => c[0] === '/api/auth/logout')).toBe(true);
    expect(await screen.findByText('Optional - you can still order right away')).toBeInTheDocument();
    expect(screen.getByLabelText('Full name')).toHaveValue('');
  });
});
