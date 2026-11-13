import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mockOrders, resetMockOrdersState, OrderError } from './mock';
import type { PlaceOrderRequest } from '@/lib/api/schemas/orders';

const REQ: PlaceOrderRequest = {
  lines: [{ lineKey: 'l1', variantId: 'p-aqua-daily-30', quantity: 1, purchaseUnit: 'single', rx: { sph: -2.5 } }],
  address: {
    recipient: 'Alice Nguyen', phone: '0900000000', line1: '1 Le Loi',
    ward: 'Ben Nghe', district: 'District 1', province: 'Ho Chi Minh City', label: 'home',
  },
  paymentMethod: 'qr',
  notificationChannel: 'zalo',
};

const MINUTE = 60_000;

describe('QR order payment (#205)', () => {
  beforeEach(() => {
    resetMockOrdersState();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-11-13T10:00:00Z'));
  });
  afterEach(() => { vi.useRealTimers(); });

  it('starts awaiting payment with a QR intent', async () => {
    const order = await mockOrders.place(REQ, null);
    expect(order.payment).toMatchObject({ method: 'qr', status: 'pending' });
    expect(order.payment.intent?.qrCode).toBeTruthy();
  });

  it('"Tôi đã chuyển khoản" marks the payment paid', async () => {
    const { code } = await mockOrders.place(REQ, null);
    const order = await mockOrders.updatePayment(code, 'confirm');
    expect(order?.payment.status).toBe('paid');
    expect((await mockOrders.findByCode(code))?.payment.status).toBe('paid');
  });

  it('"Đổi sang COD" switches the method and drops the QR intent', async () => {
    const { code } = await mockOrders.place(REQ, null);
    const order = await mockOrders.updatePayment(code, 'cod');
    expect(order?.payment).toEqual({ method: 'cod', status: 'pending' });
  });

  it('expires an unpaid QR order 15 minutes after it was placed', async () => {
    const { code } = await mockOrders.place(REQ, null);
    vi.setSystemTime(Date.now() + 15 * MINUTE - 1);
    expect((await mockOrders.findByCode(code))?.payment.status).toBe('pending');
    vi.setSystemTime(Date.now() + 1);
    expect((await mockOrders.findByCode(code))?.payment.status).toBe('expired');
  });

  it('refuses to confirm an expired QR, but still lets it switch to COD', async () => {
    const { code } = await mockOrders.place(REQ, null);
    vi.setSystemTime(Date.now() + 16 * MINUTE);
    await expect(mockOrders.updatePayment(code, 'confirm')).rejects.toBeInstanceOf(OrderError);
    expect((await mockOrders.updatePayment(code, 'cod'))?.payment).toEqual({ method: 'cod', status: 'pending' });
  });

  it('a new QR restarts the 15-minute hold with a fresh intent', async () => {
    const placed = await mockOrders.place(REQ, null);
    const firstIntent = placed.payment.intent?.id;
    vi.setSystemTime(Date.now() + 16 * MINUTE);
    const renewed = await mockOrders.updatePayment(placed.code, 'renew');
    expect(renewed?.payment.status).toBe('pending');
    expect(renewed?.payment.intent?.id).not.toBe(firstIntent);
    vi.setSystemTime(Date.now() + 14 * MINUTE);
    expect((await mockOrders.findByCode(placed.code))?.payment.status).toBe('pending');
  });

  it('refuses a new QR while the current one is still live', async () => {
    const { code } = await mockOrders.place(REQ, null);
    await expect(mockOrders.updatePayment(code, 'renew')).rejects.toBeInstanceOf(OrderError);
  });

  it('refuses to change a paid order', async () => {
    const { code } = await mockOrders.place(REQ, null);
    await mockOrders.updatePayment(code, 'confirm');
    await expect(mockOrders.updatePayment(code, 'cod')).rejects.toBeInstanceOf(OrderError);
  });

  it('returns null for an unknown Order Code', async () => {
    expect(await mockOrders.updatePayment('VVM-NOPE0000', 'confirm')).toBeNull();
  });
});
