import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Suspense } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { apiRequest } from '@/lib/api/client';
import { useCartStore } from '@/features/cart/cart-store';
import { useSessionStore } from '@/features/session/session-store';
import { CartView } from './cart-view';
import { getDictionary } from '@/lib/i18n/dictionaries';
import type { CartLine } from '@/features/cart/cart.types';
import type { PriceCartRequest, PricedCart } from '@/lib/api/schemas/cart';
import { mockPricing } from '@/lib/api/resources/pricing/mock';
import { formatPrice } from '@/lib/utils/format';

vi.mock('@/lib/api/client', () => ({ apiRequest: vi.fn() }));
const mockedApiRequest = vi.mocked(apiRequest);

const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));

const track = vi.fn();
vi.mock('@/lib/analytics/use-analytics', () => ({ useAnalytics: () => ({ track }) }));

function makeLine(overrides: Partial<CartLine> = {}): CartLine {
  return {
    lineKey: 'k1', productId: 'p1', variantId: 'v1', name: 'Aqua', sku: 'SKU1',
    unitPrice: 125_000, currency: 'VND', quantity: 1,
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
        <CartView locale="en" dict={getDictionary('en')} />
      </Suspense>,
    );
    await Promise.resolve();
  });
  return utils;
}

beforeEach(() => {
  mockedApiRequest.mockReset();
  track.mockReset();
  push.mockReset();
  useCartStore.setState({ lines: [], unticked: [], voucherCode: undefined, hydrated: false });
});

describe('CartPage', () => {
  it('matches each line total back to the cart by lineKey, not by array position', async () => {
    const lineA = makeLine({ lineKey: 'kA', quantity: 1 });
    const lineB = makeLine({ lineKey: 'kB', quantity: 2 });
    // Response order deliberately differs from the cart's line order, so a
    // positional (index-based) match would attach the wrong total to each line.
    const priced: PricedCart = {
      lines: [
        { lineKey: 'kB', variantId: lineB.variantId, quantity: 2, unitPrice: 125_000, lineTotal: 4_995_000, currency: 'VND' },
        { lineKey: 'kA', variantId: lineA.variantId, quantity: 1, unitPrice: 125_000, lineTotal: 555_000, currency: 'VND' },
      ],
      unavailableLines: [],
      subtotal: 5_550_000, discount: 0, appliedVouchers: [], shipping: 0, total: 5_550_000, currency: 'VND',
    };
    mockedApiRequest.mockResolvedValue({ ok: true, data: priced });
    useCartStore.setState({ lines: [lineA, lineB], hydrated: true });

    await renderCartPage();

    await waitFor(() => expect(screen.getByText('555.000₫')).toBeInTheDocument(), { timeout: 2000 });
    expect(screen.getByText('4.995.000₫')).toBeInTheDocument();
  });

  it('formats in the server’s currency, not a stale one saved on the line (#210)', async () => {
    // A cart persisted before the catalogue moved to VND still says USD on its lines.
    const stale = makeLine({ unitPrice: 25, currency: 'USD' });
    mockedApiRequest.mockResolvedValue({
      ok: true,
      data: {
        lines: [{ lineKey: 'k1', variantId: 'v1', quantity: 1, unitPrice: 125_000, lineTotal: 125_000, currency: 'VND' }],
        unavailableLines: [],
        subtotal: 125_000, discount: 0, appliedVouchers: [], shipping: 0, total: 125_000, currency: 'VND',
      } satisfies PricedCart,
    });
    useCartStore.setState({ lines: [stale], hydrated: true });

    await renderCartPage();

    await waitFor(() => expect(screen.getAllByText('125.000₫').length).toBeGreaterThan(0), { timeout: 2000 });
    expect(screen.queryByText(/US\$|\$/)).toBeNull();
  });

  // ADR-0012 / issue #29. A cart persisted in localStorage outlives a
  // catalogue change, so one stale line used to blank out every total and
  // leave the shopper stuck with no explanation.
  describe('a line the catalogue can no longer price', () => {
    const gone = makeLine({ lineKey: 'kGone', variantId: 'vGone', name: 'Ocean' });
    const kept = makeLine({ lineKey: 'kKept', variantId: 'vKept', name: 'Aqua' });
    const partiallyPriced: PricedCart = {
      lines: [
        { lineKey: 'kKept', variantId: 'vKept', quantity: 1, unitPrice: 125_000, lineTotal: 125_000, currency: 'VND' },
      ],
      unavailableLines: [{ lineKey: 'kGone', variantId: 'vGone' }],
      subtotal: 125_000, discount: 0, appliedVouchers: [], shipping: 0, total: 125_000, currency: 'VND',
    };

    async function renderWithStaleLine() {
      mockedApiRequest.mockResolvedValue({ ok: true, data: partiallyPriced });
      useCartStore.setState({ lines: [kept, gone], hydrated: true });
      await renderCartPage();
      await waitFor(() => expect(screen.getByText('No longer available')).toBeInTheDocument(), { timeout: 2000 });
    }

    it('still shows the rest of the cart its real total', async () => {
      await renderWithStaleLine();
      // The surviving line's total — not the blank '—' the whole cart used
      // to collapse to when one line went missing.
      expect(screen.getAllByText('125.000₫').length).toBeGreaterThan(0);
    });

    it('keeps the stale line visible and removable rather than dropping it', async () => {
      await renderWithStaleLine();
      expect(screen.getByText('Ocean')).toBeInTheDocument();
      expect(screen.getAllByRole('button', { name: 'Remove' })).toHaveLength(2);
    });

    it('blocks checkout, naming what has to happen first', async () => {
      await renderWithStaleLine();
      expect(screen.getByRole('button', { name: 'Proceed to checkout' })).toBeDisabled();
      expect(screen.getByText('Remove unavailable items to continue.')).toBeInTheDocument();
      expect(screen.getByText('Unavailable items are not included in the total.')).toBeInTheDocument();
    });

    it('does not block checkout when every line prices', async () => {
      mockedApiRequest.mockResolvedValue({
        ok: true,
        data: { ...partiallyPriced, unavailableLines: [] },
      });
      useCartStore.setState({ lines: [kept], hydrated: true });
      await renderCartPage();
      await waitFor(() => expect(screen.getByRole('link', { name: 'Proceed to checkout' })).toBeInTheDocument(), { timeout: 2000 });
      expect(screen.queryByText('No longer available')).not.toBeInTheDocument();
    });
  });

  it('says so when the price request fails, instead of leaving a stale total to read as current', async () => {
    mockedApiRequest.mockResolvedValue({ ok: false, error: { code: 'internal', message: 'boom' } });
    useCartStore.setState({ lines: [makeLine()], hydrated: true });
    await renderCartPage();
    await waitFor(
      () => expect(screen.getByText('We couldn’t update your total. Please try again.')).toBeInTheDocument(),
      { timeout: 2000 },
    );
    expect(screen.getByRole('button', { name: 'Proceed to checkout' })).toBeDisabled();
  });

  it('fires view_cart exactly once per cart view, even through a later re-price', async () => {
    const line = makeLine();
    const priced: PricedCart = {
      lines: [{ lineKey: line.lineKey, variantId: line.variantId, quantity: 1, unitPrice: 125_000, lineTotal: 125_000, currency: 'VND' }],
      unavailableLines: [],
      subtotal: 125_000, discount: 0, appliedVouchers: [], shipping: 0, total: 125_000, currency: 'VND',
    };
    mockedApiRequest.mockResolvedValue({ ok: true, data: priced });
    useCartStore.setState({ lines: [line], hydrated: true });

    await renderCartPage();

    await waitFor(() => expect(track).toHaveBeenCalledTimes(1), { timeout: 2000 });
    expect(track).toHaveBeenCalledWith({
      name: 'view_cart',
      params: { currency: 'VND', value: 125_000, items: expect.any(Array) },
    });

    // A rapid quantity change re-prices the cart. That must not fire a second view_cart.
    const line2 = makeLine({ quantity: 2 });
    const priced2: PricedCart = {
      lines: [{ lineKey: line2.lineKey, variantId: line2.variantId, quantity: 2, unitPrice: 125_000, lineTotal: 250_000, currency: 'VND' }],
      unavailableLines: [],
      subtotal: 250_000, discount: 0, appliedVouchers: [], shipping: 0, total: 250_000, currency: 'VND',
    };
    mockedApiRequest.mockResolvedValue({ ok: true, data: priced2 });
    useCartStore.setState({ lines: [line2] });

    // 250.000₫ shows up in the line item AND the order summary (subtotal + total)
    // once re-priced — wait for at least one occurrence rather than a single unique match.
    await waitFor(() => expect(screen.getAllByText('250.000₫').length).toBeGreaterThan(0), { timeout: 2000 });
    expect(track).toHaveBeenCalledTimes(1);
  });

  it('shows a loading skeleton, not the empty state, before hydration completes', async () => {
    useCartStore.setState({ lines: [], hydrated: false });
    await renderCartPage();
    expect(screen.queryByText('Your cart is empty')).not.toBeInTheDocument();
  });
});

describe('CartPage — Spend Tier discount (#198)', () => {
  it('shows the 800.000₫ tier as its own row, so the rows add up to the total', async () => {
    // The real pricing: 7 x 125.000 = 875.000 single lenses, over the 800.000 tier.
    mockedApiRequest.mockImplementation(async (_url, init) =>
      ({ ok: true, data: await mockPricing.priceCart(init!.body as PriceCartRequest) }) as never);
    useCartStore.setState({
      lines: [makeLine({ lineKey: 'k', variantId: 'p-aqua-daily-30', quantity: 7, purchaseUnit: 'single', rx: { sph: -2.5 } })],
      hydrated: true,
    });
    await renderCartPage();
    const dict = getDictionary('en');
    const vnd = (n: number) => formatPrice(n, 'VND', 'en');
    const row = (label: string) => screen.getByText(label).parentElement!.lastElementChild!.textContent;

    const priced = await mockPricing.priceCart({ lines: [{ lineKey: 'k', variantId: 'p-aqua-daily-30', quantity: 7, purchaseUnit: 'single', rx: { sph: -2.5 } }] });
    const voucherRow = dict.cart.voucherRow.replace('{code}', priced.appliedVouchers[0].code);
    await waitFor(() => expect(screen.getByText(voucherRow)).toBeInTheDocument());
    expect(row(dict.cart.subtotalCount.replace('{count}', '7'))).toBe(vnd(875_000));
    expect(row(voucherRow)).toBe(`-${vnd(priced.discount)}`);
    expect(row(dict.cart.tierDiscount.replace('{threshold}', vnd(800_000)))).toBe(`-${vnd(50_000)}`);
    expect(row(dict.cart.shipping)).toBe(dict.cart.free);
    expect(row(dict.cart.total)).toBe(vnd(875_000 - priced.discount - 50_000));
  });
});

/** The real pricing behind the mocked client, recording each request body. */
function realPricing() {
  const bodies: PriceCartRequest[] = [];
  mockedApiRequest.mockImplementation(async (url, init) => {
    if (url !== '/api/cart/price') return { ok: true, data: [] } as never;
    const body = init!.body as PriceCartRequest;
    bodies.push(body);
    return { ok: true, data: await mockPricing.priceCart(body) } as never;
  });
  return bodies;
}

const lens = (lineKey: string, variantId: string, quantity = 1) =>
  makeLine({ lineKey, variantId, name: lineKey, quantity, purchaseUnit: 'single', rx: { sph: -2.5 } });

describe('CartPage — ticked lines (#202)', () => {
  it('prices only the ticked lines, and re-prices when one is unticked', async () => {
    const bodies = realPricing();
    useCartStore.setState({ lines: [lens('Aqua', 'p-aqua-daily-30', 2), lens('Hazel', 'p-hazel-monthly-brown-30')], hydrated: true });
    await renderCartPage();
    await waitFor(() => expect(bodies).toHaveLength(1));
    expect(bodies[0].lines.map((l) => l.lineKey)).toEqual(['Aqua', 'Hazel']);

    fireEvent.click(screen.getByRole('checkbox', { name: 'Select Hazel' }));
    await waitFor(() => expect(bodies.at(-1)!.lines.map((l) => l.lineKey)).toEqual(['Aqua']), { timeout: 2000 });
    // Unticked, not removed.
    expect(useCartStore.getState().lines).toHaveLength(2);
    expect(screen.getByText('Hazel')).toBeInTheDocument();
  });

  it('blocks checkout when nothing is ticked', async () => {
    realPricing();
    useCartStore.setState({ lines: [lens('Aqua', 'p-aqua-daily-30')], hydrated: true });
    await renderCartPage();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select all (1)' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Proceed to checkout' })).toBeDisabled());
    expect(screen.getByText('Select at least one item to check out.')).toBeInTheDocument();
  });

  it('shows a Gift line at 0₫ with what is in it', async () => {
    realPricing();
    // p-* 6-month lenses earn Kits Yêu Mắt; find one in the catalogue.
    const { products } = await import('@/content/mock');
    const sixMonth = products.find((p) => p.replacement === 'sixMonth')!;
    useCartStore.setState({
      lines: [makeLine({ lineKey: 'six', productId: sixMonth.id, variantId: sixMonth.variants[0].id, name: sixMonth.name, replacement: 'sixMonth', purchaseUnit: 'single', rx: { sph: -1 } })],
      hydrated: true,
    });
    await renderCartPage();
    await waitFor(() => expect(screen.getByText(`Gift: Kits Yêu Mắt (with ${sixMonth.name} 6 months)`)).toBeInTheDocument(), { timeout: 2000 });
    expect(screen.getByText(/Khăn ướt làm sạch/)).toBeInTheDocument();
  });
});

describe('CartPage — vouchers (#202)', () => {
  it('pre-selects the best Voucher, and switching the radio re-prices with that code', async () => {
    const bodies = realPricing();
    useCartStore.setState({ lines: [lens('Aqua', 'p-aqua-daily-30', 2), lens('Hazel', 'p-hazel-monthly-brown-30')], hydrated: true });
    await renderCartPage();
    const best = await screen.findByRole('radio', { name: /SAVE15/ }, { timeout: 2000 });
    expect(best).toBeChecked();
    expect(bodies[0].voucherCode).toBeUndefined();

    fireEvent.click(screen.getByRole('radio', { name: /NEW30/ }));
    await waitFor(() => expect(screen.getByRole('radio', { name: /NEW30/ })).toBeChecked(), { timeout: 2000 });
    expect(bodies.at(-1)!.voucherCode).toBe('NEW30');
    expect(screen.getByText('Voucher NEW30').parentElement!.lastElementChild!.textContent).toBe('-30.000₫');
  });

  it('applies a typed code, and names why a bad one was refused', async () => {
    realPricing();
    useCartStore.setState({ lines: [lens('Aqua', 'p-aqua-daily-30', 2), lens('Hazel', 'p-hazel-monthly-brown-30')], hydrated: true });
    await renderCartPage();
    const field = await screen.findByPlaceholderText('Enter a voucher code');
    fireEvent.change(field, { target: { value: 'MEMBER20' } });
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
    expect(await screen.findByRole('alert', {}, { timeout: 2000 })).toHaveTextContent('Code MEMBER20 is for members. Sign in to use it.');
    // The rest of the price still stands, with the best Voucher.
    expect(screen.getByRole('radio', { name: /SAVE15/ })).toBeChecked();
  });
});

describe('CartPage — Loyalty (#204)', () => {
  it('tells a guest what signing in would let them spend and earn', async () => {
    realPricing();
    useSessionStore.setState({ status: 'anonymous' });
    useCartStore.setState({ lines: [lens('Aqua', 'p-aqua-daily-30', 2), lens('Hazel', 'p-hazel-monthly-brown-30')], hydrated: true });
    await renderCartPage();
    // 350.000 subtotal: 10% = 350 points; 275.000 paid after SAVE15 earns 27.
    const prompt = await screen.findByRole('link', { name: 'Sign in to use 350 points & earn 27 more' }, { timeout: 2000 });
    expect(prompt).toHaveAttribute('href', '/en/sign-in?next=%2Fen%2Fcart');
  });
});

describe('CartPage — move to Favorites (#202)', () => {
  it('asks a guest to sign in', async () => {
    realPricing();
    useSessionStore.setState({ status: 'anonymous' });
    useCartStore.setState({ lines: [lens('Aqua', 'p-aqua-daily-30')], unticked: ['Aqua'], hydrated: true });
    await renderCartPage();
    fireEvent.click(screen.getByRole('button', { name: 'Move unselected items to Favorites' }));
    expect(push).toHaveBeenCalledWith('/en/sign-in?next=%2Fen%2Fcart');
  });

  it('moves a member’s unticked lenses to Favorites and out of the cart', async () => {
    realPricing();
    useSessionStore.setState({ status: 'authenticated' });
    useCartStore.setState({ lines: [lens('Aqua', 'p-aqua-daily-30'), lens('Hazel', 'p-hazel-monthly-brown-30')], unticked: ['Hazel'], hydrated: true });
    await renderCartPage();
    fireEvent.click(screen.getByRole('button', { name: 'Move unselected items to Favorites' }));
    await waitFor(() => expect(useCartStore.getState().lines.map((l) => l.lineKey)).toEqual(['Aqua']));
    expect(mockedApiRequest).toHaveBeenCalledWith('/api/account/favorites', { method: 'POST', body: { productId: 'p1' } });
  });
});
