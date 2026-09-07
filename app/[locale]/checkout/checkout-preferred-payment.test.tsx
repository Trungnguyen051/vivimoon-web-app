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
    expect(screen.getByRole('button', { name: 'QR Pay' })).toHaveAttribute('aria-pressed', 'true');
  });

  it("preselects a logged-in shopper's saved preferred payment method", async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json({ ok: true, data: { preferredPaymentMethod: 'sepay' } })));
    useSessionStore.setState({ user: { id: 'u-001', name: 'Mai', phone: '0912345678' }, status: 'authenticated' });
    await renderCheckoutPage();
    expect(await screen.findByRole('button', { name: 'SePay', pressed: true })).toBeInTheDocument();
  });

  it("falls back to the first configured method when the account has none set", async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json({ ok: true, data: {} })));
    useSessionStore.setState({ user: { id: 'u-001', name: 'Mai', phone: '0912345678' }, status: 'authenticated' });
    await renderCheckoutPage();
    expect(screen.getByRole('button', { name: 'QR Pay' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('never lets the account fetch override a choice the shopper already made', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json({ ok: true, data: { preferredPaymentMethod: 'sepay' } })));
    useSessionStore.setState({ user: { id: 'u-001', name: 'Mai', phone: '0912345678' }, status: 'authenticated' });
    await renderCheckoutPage();
    await userEvent.click(screen.getByRole('button', { name: 'ZaloPay' }));
    expect(screen.getByRole('button', { name: 'ZaloPay' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'SePay' })).toHaveAttribute('aria-pressed', 'false');
  });

  it("disables Place order until a signed-in shopper's preference fetch resolves, so a fast click can't submit the fallback method", async () => {
    let resolveFetch!: (response: Response) => void;
    const pending = new Promise<Response>((resolve) => { resolveFetch = resolve; });
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(pending));
    useSessionStore.setState({ user: { id: 'u-001', name: 'Mai', phone: '0912345678' }, status: 'authenticated' });
    await renderCheckoutPage();

    expect(screen.getByRole('button', { name: 'Place order' })).toBeDisabled();

    await act(async () => { resolveFetch(json({ ok: true, data: { preferredPaymentMethod: 'sepay' } })); });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Place order' })).not.toBeDisabled());
    expect(screen.getByRole('button', { name: 'SePay' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('never disables Place order for a guest, who has no account fetch to wait on', async () => {
    vi.stubGlobal('fetch', vi.fn());
    useSessionStore.setState({ user: null, status: 'anonymous' });
    await renderCheckoutPage();
    expect(screen.getByRole('button', { name: 'Place order' })).not.toBeDisabled();
  });
});
