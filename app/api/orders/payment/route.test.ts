import { describe, it, expect, beforeEach } from 'vitest';

const { GET, POST } = await import('./route');
const { mockOrders, resetMockOrdersState } = await import('@/lib/api/resources/orders/mock');

async function placeQr() {
  return mockOrders.place({
    lines: [{ lineKey: 'l1', variantId: 'p-aqua-daily-30', quantity: 1, purchaseUnit: 'single', rx: { sph: -2.5 } }],
    address: {
      recipient: 'Alice Nguyen', phone: '0900000000', line1: '1 Le Loi',
      ward: 'Ben Nghe', district: 'District 1', province: 'Ho Chi Minh City', label: 'home',
    },
    email: 'alice@example.com',
    paymentMethod: 'qr',
    notificationChannel: 'zalo',
  }, 'user-1');
}

const get = (code: string) => GET(new Request(`http://localhost/api/orders/payment?code=${encodeURIComponent(code)}`));
const post = (body: unknown) =>
  POST(new Request('http://localhost/api/orders/payment', { method: 'POST', body: JSON.stringify(body) }));

describe('/api/orders/payment', () => {
  beforeEach(() => { resetMockOrdersState(); });

  it('returns the order with its payment, but not its owner or email', async () => {
    const { code } = await placeQr();
    const body = await (await get(code)).json();
    expect(body.data.payment).toMatchObject({ method: 'qr', status: 'pending' });
    expect(body.data.payment.intent.qrCode).toBeTruthy();
    expect(body.data).not.toHaveProperty('userId');
    expect(body.data).not.toHaveProperty('guestEmail');
  });

  it('404s an unknown code', async () => {
    expect((await get('VVM-NOPE0000')).status).toBe(404);
    expect((await post({ code: 'VVM-NOPE0000', action: 'confirm' })).status).toBe(404);
  });

  it('confirms the transfer', async () => {
    const { code } = await placeQr();
    const body = await (await post({ code, action: 'confirm' })).json();
    expect(body.data.payment.status).toBe('paid');
  });

  it('switches to COD', async () => {
    const { code } = await placeQr();
    const body = await (await post({ code, action: 'cod' })).json();
    expect(body.data.payment).toEqual({ method: 'cod', status: 'pending' });
  });

  it('409s an action the payment no longer allows', async () => {
    const { code } = await placeQr();
    await post({ code, action: 'confirm' });
    expect((await post({ code, action: 'cod' })).status).toBe(409);
  });

  it('400s an unknown action', async () => {
    const { code } = await placeQr();
    expect((await post({ code, action: 'refund' })).status).toBe(400);
  });
});
