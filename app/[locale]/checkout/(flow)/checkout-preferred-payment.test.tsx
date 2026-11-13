import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { Suspense } from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CheckoutView } from './checkout-view';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { useCartStore } from '@/features/cart/cart-store';
import { useSessionStore } from '@/features/session/session-store';
import type { CartLine } from '@/features/cart/cart.types';

const QR = /Bank transfer \/ Scan QR/;
const COD = /Cash on delivery/;
const EWALLET = /E-wallet/;
const REMEMBERED = 'Preselected from your last order';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));

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

beforeEach(() => {
  localStorage.clear();
  useCartStore.setState({ lines: [makeLine()], hydrated: true, buyNowLine: null });
  useSessionStore.setState({ user: null, status: 'unknown' });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('CheckoutPage — preferred payment method preselection (M5.3, issue #20)', () => {
  it('defaults to the first configured method for a guest', async () => {
    vi.stubGlobal('fetch', vi.fn());
    useSessionStore.setState({ user: null, status: 'anonymous' });
    await renderCheckoutPage();
    expect(screen.getByRole('radio', { name: QR })).toBeChecked();
    expect(screen.queryByText(REMEMBERED)).not.toBeInTheDocument();
  });

  it("preselects a logged-in shopper's saved preferred payment method", async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json({ ok: true, data: { preferredPaymentMethod: 'cod' } })));
    useSessionStore.setState({ user: { id: 'u-001', name: 'Mai', phone: '0912345678' }, status: 'authenticated' });
    await renderCheckoutPage();
    await waitFor(() => expect(screen.getByRole('radio', { name: COD })).toBeChecked());
    expect(screen.getByText(REMEMBERED)).toBeInTheDocument();
  });

  it("falls back to the first configured method when the account has none set", async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json({ ok: true, data: {} })));
    useSessionStore.setState({ user: { id: 'u-001', name: 'Mai', phone: '0912345678' }, status: 'authenticated' });
    await renderCheckoutPage();
    expect(screen.getByRole('radio', { name: QR })).toBeChecked();
  });

  it('never lets the account fetch override a choice the shopper already made', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json({ ok: true, data: { preferredPaymentMethod: 'cod' } })));
    useSessionStore.setState({ user: { id: 'u-001', name: 'Mai', phone: '0912345678' }, status: 'authenticated' });
    await renderCheckoutPage();
    await userEvent.click(screen.getByRole('radio', { name: EWALLET }));
    expect(screen.getByRole('radio', { name: EWALLET })).toBeChecked();
    expect(screen.getByRole('radio', { name: COD })).not.toBeChecked();
    // The label belongs to the remembered method only.
    expect(screen.queryByText(REMEMBERED)).not.toBeInTheDocument();
  });

  it("disables Place order until a signed-in shopper's preference fetch resolves, so a fast click can't submit the fallback method", async () => {
    let resolveFetch!: (response: Response) => void;
    const pending = new Promise<Response>((resolve) => { resolveFetch = resolve; });
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(pending));
    useSessionStore.setState({ user: { id: 'u-001', name: 'Mai', phone: '0912345678' }, status: 'authenticated' });
    await renderCheckoutPage();

    expect(screen.getByRole('button', { name: /Place order/ })).toBeDisabled();

    await act(async () => { resolveFetch(json({ ok: true, data: { preferredPaymentMethod: 'cod' } })); });
    await waitFor(() => expect(screen.getByRole('button', { name: /Place order/ })).not.toBeDisabled());
    expect(screen.getByRole('radio', { name: COD })).toBeChecked();
  });

  it('never disables Place order for a guest, who has no account fetch to wait on', async () => {
    vi.stubGlobal('fetch', vi.fn());
    useSessionStore.setState({ user: null, status: 'anonymous' });
    await renderCheckoutPage();
    expect(screen.getByRole('button', { name: /Place order/ })).not.toBeDisabled();
  });
});
