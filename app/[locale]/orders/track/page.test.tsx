import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { fetchViaSelf } from '@/lib/api/server-fetch';
import type { Order } from '@/lib/api/schemas/orders';
import { getDictionary } from '@/lib/i18n/dictionaries';
import TrackOrderPage from './page';

vi.mock('@/lib/api/server-fetch', () => ({ fetchViaSelf: vi.fn() }));
const mockedFetchViaSelf = vi.mocked(fetchViaSelf);

const session = vi.hoisted(() => ({ userId: null as string | null }));
vi.mock('@/lib/auth/cookie', () => ({ readSessionUserId: async () => session.userId }));

vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND');
  },
}));

vi.mock('@/components/commerce/order-detail-view', () => ({
  OrderDetailView: ({ order }: { order: Order }) => <p>order {order.code}</p>,
}));

const dict = getDictionary('vi').tracking;
const order = { id: 'o1', code: 'VVM-SEED0001' } as Order;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

async function renderPage(code?: string) {
  render(
    await TrackOrderPage({
      params: Promise.resolve({ locale: 'vi' }),
      searchParams: Promise.resolve(code === undefined ? {} : { code }),
    }),
  );
}

describe('Track Order page (Order Lookup)', () => {
  beforeEach(() => { mockedFetchViaSelf.mockReset(); session.userId = null; });

  it('shows the lookup form and the idle prompt when no code is given', async () => {
    await renderPage();
    expect(screen.getByRole('heading', { name: dict.title })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: dict.code })).toHaveAttribute('name', 'code');
    expect(screen.getByRole('button', { name: dict.submit })).toBeInTheDocument();
    expect(screen.getByText(dict.idle)).toBeInTheDocument();
    expect(mockedFetchViaSelf).not.toHaveBeenCalled();
  });

  it('renders the order inline when the code matches, keeping the code in the field', async () => {
    mockedFetchViaSelf.mockResolvedValue(json({ ok: true, data: order }));
    await renderPage('#vvm-seed0001');
    expect(mockedFetchViaSelf).toHaveBeenCalledWith('/api/orders/track?code=%23vvm-seed0001');
    expect(screen.getByText('order VVM-SEED0001')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: dict.code })).toHaveValue('#vvm-seed0001');
    expect(screen.queryByText(dict.idle)).not.toBeInTheDocument();
  });

  it('shows the not-found state echoing the typed code, with a link to support', async () => {
    mockedFetchViaSelf.mockResolvedValue(json({ ok: false, error: { code: 'not_found', message: 'x' } }, 404));
    await renderPage(' 2222 ');
    expect(screen.getByRole('heading', { name: dict.notFoundTitle })).toBeInTheDocument();
    expect(screen.getByText('2222', { selector: 'strong' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: dict.contactSupport })).toHaveAttribute('href', '/vi/support');
  });

  it('treats a blank code as no code', async () => {
    await renderPage('   ');
    expect(screen.getByText(dict.idle)).toBeInTheDocument();
    expect(mockedFetchViaSelf).not.toHaveBeenCalled();
  });

  it('links back to the account only for a signed-in member', async () => {
    await renderPage();
    expect(screen.queryByRole('link', { name: dict.backToAccount })).not.toBeInTheDocument();
    session.userId = 'u-001';
    await renderPage();
    expect(screen.getByRole('link', { name: dict.backToAccount })).toHaveAttribute('href', '/vi/account');
  });
});
