import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OrderHistoryCard, type HistoryLine } from './order-history-card';
import { useCartStore } from '@/features/cart/cart-store';
import { getDictionary } from '@/lib/i18n/dictionaries';
import type { Order } from '@/lib/api/schemas/orders';

const push = vi.fn();
const refresh = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push, refresh }) }));

const dict = getDictionary('en');
const RX = { sameBothEyes: true as const, right: { sph: -2.5 }, left: { sph: -2.5 } };

const product = (n: number) => ({
  id: `p${n}`, slug: `lens-${n}`, name: `Lens ${n}`, image: `/l${n}.jpg`, sku: `S${n}`, color: 'Brown',
  compareAtPrice: n === 1 ? 30 : undefined,
});
const line = (n: number, extra: Partial<HistoryLine> = {}): HistoryLine => ({
  lineKey: `k${n}`, variantId: `v${n}`, quantity: n, unitPrice: 25, lineTotal: 25 * n, currency: 'USD',
  rx: RX, product: product(n), ...extra,
});

function order(status: Order['status']): Order {
  return {
    id: 'o1', code: 'VVM-AAA', status, placedAt: '2026-01-01T00:00:00Z', lines: [],
    totals: { subtotal: 0, discount: 0, appliedVouchers: [], shipping: 0, total: 125, currency: 'USD' },
    address: { recipient: 'a', phone: '0900000000', line1: 'x', ward: 'w', district: 'd', province: 'p', label: 'home' },
    payment: { method: 'qr', status: 'pending' },
  };
}

const renderCard = (status: Order['status'], lines = [line(1), line(2), line(3)]) =>
  render(<OrderHistoryCard order={order(status)} lines={lines} locale="en" dict={dict} />);

beforeEach(() => {
  localStorage.clear();
  useCartStore.setState({ lines: [], hydrated: true });
  push.mockClear(); refresh.mockClear();
  vi.restoreAllMocks();
});

const labels = () => [...screen.queryAllByRole('button'), ...screen.queryAllByRole('link')].map((e) => e.textContent);

describe('OrderHistoryCard actions by status', () => {
  it.each([
    ['placed', [dict.orders.cancelOrder]],
    ['confirmed', [dict.orders.cancelOrder]],
    ['delivered', [dict.orders.returnItems, dict.orders.review, dict.orders.buyAgain]],
    ['shipped', []],
    ['cancelled', []],
  ] as const)('%s', (status, expected) => {
    renderCard(status);
    const shown = labels();
    for (const l of [dict.orders.cancelOrder, dict.orders.returnItems, dict.orders.review, dict.orders.buyAgain]) {
      if ((expected as readonly string[]).includes(l)) expect(shown).toContain(l);
      else expect(shown).not.toContain(l);
    }
  });

  it('links return to the support returns topic and review to the reviews anchor', () => {
    renderCard('delivered');
    expect(screen.getByRole('link', { name: dict.orders.returnItems })).toHaveAttribute('href', '/en/support/faq?category=returns');
    expect(screen.getByRole('link', { name: dict.orders.review })).toHaveAttribute('href', '/en/product/lens-1#reviews');
  });
});

describe('OrderHistoryCard body', () => {
  it('shows the first line, toggles the rest, and totals with the item count', async () => {
    renderCard('shipped');
    expect(screen.getByText('Lens 1')).toBeInTheDocument();
    expect(screen.queryByText('Lens 2')).not.toBeInTheDocument();
    expect(screen.getByText(/\$30/)).toHaveClass('line-through');
    expect(screen.getByText('Total (6 items)')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Show 2 more items' }));
    expect(screen.getByText('Lens 3')).toBeInTheDocument();
  });
});

describe('OrderHistoryCard cancel', () => {
  it('asks first, then posts to the cancel route and refreshes', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ ok: true, data: {} })),
    );
    renderCard('placed');
    await userEvent.click(screen.getByRole('button', { name: dict.orders.cancelOrder }));
    expect(fetchMock).not.toHaveBeenCalled();
    await userEvent.click(await screen.findByRole('button', { name: dict.orders.cancelConfirm }));
    expect(fetchMock).toHaveBeenCalledWith('/api/orders/o1/cancel', { method: 'POST' });
    await vi.waitFor(() => expect(refresh).toHaveBeenCalled());
  });
});

describe('OrderHistoryCard buy again', () => {
  it('adds every line with its Rx and opens the cart', async () => {
    renderCard('delivered', [line(1), line(2)]);
    await userEvent.click(screen.getByRole('button', { name: dict.orders.buyAgain }));
    const lines = useCartStore.getState().lines;
    expect(lines.map((l) => [l.variantId, l.quantity, l.rx])).toEqual([['v1', 1, RX], ['v2', 2, RX]]);
    expect(push).toHaveBeenCalledWith('/en/cart');
  });

  it('reports an unavailable line instead of dropping it silently', async () => {
    renderCard('delivered', [line(1), line(2, { product: null })]);
    await userEvent.click(screen.getByRole('button', { name: dict.orders.buyAgain }));
    expect(useCartStore.getState().lines).toHaveLength(1);
    expect(screen.getByRole('alert')).toHaveTextContent('1 item(s) are no longer available');
    expect(push).not.toHaveBeenCalled();
  });
});
