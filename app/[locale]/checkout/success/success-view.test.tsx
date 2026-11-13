import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, render, screen, within } from '@testing-library/react';
import { SuccessView, type FirstWearRead } from './success-view';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { useSessionStore } from '@/features/session/session-store';
import { useCartStore } from '@/features/cart/cart-store';
import type { PaymentOrder } from '@/lib/api/schemas/orders';

const dict = getDictionary('vi');

function order(overrides: Partial<PaymentOrder> = {}): PaymentOrder {
  return {
    id: 'o1', code: 'VVM-ABC123', status: 'placed', placedAt: '2026-09-30T03:00:00Z',
    lines: [{ lineKey: 'l1', variantId: 'v1', quantity: 1, unitPrice: 578_000, lineTotal: 578_000, currency: 'VND' }],
    totals: { subtotal: 578_000, discount: 0, appliedVouchers: [], shipping: 0, total: 578_000, currency: 'VND', pointsToEarn: 58 },
    address: {
      recipient: 'Nguyễn Thu Hà', phone: '0912345678', line1: '1 Trần Duy Hưng',
      ward: 'Dịch Vọng', district: 'Cầu Giấy', province: 'HN', label: 'home',
    },
    shippingMethod: 'standard',
    payment: { method: 'qr', status: 'paid', intent: { id: 'pi-1', method: 'qr', status: 'paid', qrCode: 'vivimoon-qr:pi-1' } },
    notificationChannel: 'zalo',
    ...overrides,
  };
}

const READS: FirstWearRead[] = [
  { key: 'v', kind: 'video', title: 'Đeo 10h đi làm có khô?', image: '/images/tv-thumb-3.jpg', href: 'https://www.tiktok.com/@vivimoon.official', duration: '1:05' },
  { key: 'a', kind: 'article', title: 'Cách đeo lens lần đầu', image: '/images/hero-1.jpg', href: '/vi/articles/cach-deo-lens-lan-dau', minutes: 2 },
];

function json(body: unknown) {
  return new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } });
}

async function renderView(o: PaymentOrder | null = order(), etaDays?: number) {
  await act(async () => {
    render(<SuccessView order={o} etaDays={etaDays} reads={READS} locale="vi" dict={dict} />);
  });
}

function seedSnapshot(extra: Record<string, unknown>) {
  sessionStorage.setItem('vivimoon-last-order', JSON.stringify({ orderId: 'VVM-ABC123', currency: 'VND', value: null, lines: [], isBuyNow: true, ...extra }));
}

function stepLabels() {
  return within(screen.getByRole('list', { name: dict.orderDetail.status })).getAllByRole('listitem')
    .map((li) => `${li.textContent}${li.dataset.done === 'true' ? ' ✓' : ''}`);
}

beforeEach(() => {
  sessionStorage.clear();
  useCartStore.setState({ lines: [], hydrated: true, buyNowLine: null });
  useSessionStore.setState({ user: null, status: 'anonymous' });
});
afterEach(() => vi.unstubAllGlobals());

describe('SuccessView (#206)', () => {
  it('shows the order code, where the confirmation went (masked) and the lookup links', async () => {
    await renderView();
    expect(screen.getByRole('heading', { level: 1, name: 'Đặt hàng thành công!' })).toBeInTheDocument();
    expect(screen.getByText('#VVM-ABC123')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: dict.orderSuccess.copyCode })).toBeInTheDocument();
    expect(screen.getByText('Xác nhận đơn đã được gửi qua Zalo 0912 *** 678. Dùng mã đơn để tra cứu bất cứ lúc nào.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Theo dõi đơn hàng' })).toHaveAttribute('href', '/vi/orders/track?code=VVM-ABC123');
    expect(screen.getByRole('link', { name: 'Tiếp tục mua sắm' })).toHaveAttribute('href', '/vi');
  });

  it('masks the email for the email channel from the checkout snapshot', async () => {
    seedSnapshot({ email: 'thuha@example.vn' });
    await renderView(order({ notificationChannel: 'email' }));
    expect(screen.getByText(/gửi qua Email t\*\*\*@example\.vn\./)).toBeInTheDocument();
  });

  it('names just the channel when the email is no longer known (a reload)', async () => {
    await renderView(order({ notificationChannel: 'email' }));
    expect(screen.getByText(/^Xác nhận đơn đã được gửi qua Email\. Dùng mã đơn/)).toBeInTheDocument();
  });

  it('draws the timeline with payment done for a paid QR order', async () => {
    await renderView();
    expect(stepLabels()).toEqual(['Đã đặt hàng ✓', 'Đã thanh toán ✓', 'Đang đóng gói', 'Đang giao', 'Đã nhận']);
  });

  it('draws "Thanh toán khi nhận" for COD', async () => {
    await renderView(order({ payment: { method: 'cod', status: 'pending' } }));
    expect(stepLabels().slice(0, 2)).toEqual(['Đã đặt hàng ✓', 'Thanh toán khi nhận']);
  });

  it('draws the e-wallet payment as still to come until the gateway confirms it', async () => {
    await renderView(order({ payment: { method: 'ewallet', status: 'pending', intent: { id: 'pi-2', method: 'ewallet', status: 'pending', redirectUrl: 'https://pay.example/1' } } }));
    expect(stepLabels().slice(0, 2)).toEqual(['Đã đặt hàng ✓', 'Đã thanh toán']);
  });

  it('a guest sees the points held against their phone, with the sign-up buttons', async () => {
    await renderView();
    const block = screen.getByTestId('points-guest');
    expect(within(block).getByRole('heading', { name: 'Bạn vừa tích 58 điểm' })).toBeInTheDocument();
    expect(within(block).getByText(/giữ theo SĐT 0912 \*\*\* 678/)).toBeInTheDocument();
    for (const name of ['Tiếp tục với Zalo', 'Google', 'Dùng SĐT (OTP)']) {
      expect(within(block).getByRole('link', { name })).toHaveAttribute('href', '/vi/sign-up');
    }
    expect(within(block).getByRole('link', { name: 'Dùng SĐT (OTP)' })).not.toHaveAttribute('data-highlighted');
    expect(screen.queryByTestId('points-member')).not.toBeInTheDocument();
  });

  it('highlights the OTP path for a guest who ticked "Tạo tài khoản"', async () => {
    seedSnapshot({ createAccount: true });
    await renderView();
    expect(screen.getByRole('link', { name: 'Dùng SĐT (OTP)' })).toHaveAttribute('data-highlighted', 'true');
  });

  it('a member sees the points earned and their new total instead', async () => {
    useSessionStore.setState({ user: { id: 'u1', name: 'Hà', phone: '0912345678' }, status: 'authenticated' });
    vi.stubGlobal('fetch', vi.fn(async () => json({ ok: true, data: { balance: 377, history: [] } })));
    await renderView(order({ totals: { ...order().totals, pointsToEarn: 57, pointsUsed: 100 } }));
    const block = await screen.findByTestId('points-member');
    expect(await within(block).findByRole('heading', { name: 'Bạn nhận +57 điểm, tổng 377 điểm' })).toBeInTheDocument();
    expect(screen.queryByTestId('points-guest')).not.toBeInTheDocument();
  });

  it('lists recipient, address, shipping with ETA, payment status and total', async () => {
    await renderView(order(), 2);
    const info = screen.getByRole('region', { name: 'Thông tin đơn hàng' });
    const rows = within(info).getAllByRole('term').map((dt) => `${dt.textContent}: ${dt.nextSibling?.textContent}`);
    expect(rows).toEqual([
      'Người nhận: Nguyễn Thu Hà',
      'Giao tới: Dịch Vọng, Cầu Giấy, HN',
      'Vận chuyển: Giao hàng tiêu chuẩn · dự kiến 02/10',
      'Thanh toán: Chuyển khoản · Đã nhận',
      expect.stringMatching(/^Tổng thanh toán: 578\.000/),
    ]);
  });

  it('shows the first-wear reads labelled by kind', async () => {
    await renderView();
    expect(screen.getByText('Video 1:05')).toBeInTheDocument();
    expect(screen.getByText('Bài viết · 2 phút')).toBeInTheDocument();
  });

  it('falls back to a plain thank-you for a missing or unknown code', async () => {
    await renderView(null);
    expect(screen.getByRole('heading', { level: 1, name: 'Đặt hàng thành công!' })).toBeInTheDocument();
    expect(screen.queryByRole('list', { name: dict.orderDetail.status })).not.toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Thông tin đơn hàng' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Theo dõi đơn hàng' })).toHaveAttribute('href', '/vi/orders/track');
  });
});
