import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { fetchViaSelf } from '@/lib/api/server-fetch';
import type { Order } from '@/lib/api/schemas/orders';
import TrackedOrderPage from './page';

vi.mock('@/lib/api/server-fetch', () => ({ fetchViaSelf: vi.fn() }));
const mockedFetchViaSelf = vi.mocked(fetchViaSelf);

// The page's own module instance never sees the token the route handler
// wrote (ADR-0002) — a direct resource read here would always come back empty.
vi.mock('@/lib/api/resources/orders', () => ({
  orders: { resolveTrackingToken: vi.fn(async () => undefined) },
}));

vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND');
  },
}));

vi.mock('@/components/commerce/order-detail-view', () => ({
  OrderDetailView: ({ order }: { order: Order }) => <p>order {order.code}</p>,
}));

const order: Order = {
  id: 'o1',
  code: 'VM-TRACK1',
  status: 'placed',
  placedAt: '2026-01-01T00:00:00.000Z',
  lines: [{ lineKey: 'k1', variantId: 'v1', quantity: 1, unitPrice: 25, lineTotal: 25, currency: 'USD' }],
  totals: { subtotal: 25, discount: 0, appliedVouchers: [], shipping: 0, total: 25, currency: 'USD' },
  address: {} as Order['address'],
  payment: { method: 'qr', status: 'pending' },
  guestEmail: 'guest@example.com',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

beforeEach(() => {
  mockedFetchViaSelf.mockReset();
});

describe('TrackedOrderPage', () => {
  it('reads the order through the tracking route handler, not the resource directly', async () => {
    mockedFetchViaSelf.mockResolvedValue(json({ ok: true, data: order }));

    render(await TrackedOrderPage({ params: Promise.resolve({ locale: 'en', token: 'tok/1' }) }));

    expect(mockedFetchViaSelf).toHaveBeenCalledWith('/api/orders/track/tok%2F1');
    expect(screen.getByText('order VM-TRACK1')).toBeInTheDocument();
  });

  it('404s on an invalid or expired token', async () => {
    mockedFetchViaSelf.mockResolvedValue(
      json({ ok: false, error: { code: 'not_found', message: 'nope' } }, 404),
    );

    await expect(
      TrackedOrderPage({ params: Promise.resolve({ locale: 'en', token: 'bad' }) }),
    ).rejects.toThrow('NEXT_NOT_FOUND');
  });
});
